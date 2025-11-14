'use strict';

const puppeteer = require('puppeteer');
const db = require('./models');
const { Product, Category, Brand, ProductImage, ProductSpec } = db;

const START_URL = 'https://agromarket.kz/';
const DELAY = ms => new Promise(r => setTimeout(r, ms));
const now = () => new Date().toISOString();

// === Автоскролл страницы ===
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 300;
      const delay = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, delay);
    });
  });
}

// === Устанавливаем связи ===
function setAssociations() {
  Product.belongsTo(Category, { foreignKey: 'category_id' });
  Product.belongsTo(Brand, { foreignKey: 'brand_id' });
  Product.hasMany(ProductImage, { foreignKey: 'product_id' });
  Product.hasMany(ProductSpec, { foreignKey: 'product_id' });
}

// === Data Access Layer ===
async function saveCategory(name, url) {
  const [cat] = await Category.findOrCreate({
    where: { url },
    defaults: { name, url }
  });
  return cat;
}

async function saveBrand(name) {
  if (!name) return null;
  const [brand] = await Brand.findOrCreate({
    where: { name },
    defaults: { name }
  });
  return brand;
}

async function saveProduct(data, catId, brandId) {
  const [prod] = await Product.findOrCreate({
    where: { url: data.url },
    defaults: {
      title: data.title,
      price: data.price,
      url: data.url,
      description: data.description,
      category_id: catId,
      brand_id: brandId
    }
  });
  return prod;
}

async function saveImages(images, prodId) {
  for (const img of images) {
    await ProductImage.findOrCreate({
      where: { product_id: prodId, image_url: img },
      defaults: { product_id: prodId, image_url: img }
    });
  }
}

async function saveSpecs(specs, prodId) {
  for (const s of specs) {
    await ProductSpec.findOrCreate({
      where: { product_id: prodId, spec_key: s.key },
      defaults: { product_id: prodId, spec_key: s.key, spec_value: s.value }
    });
  }
}

// === Основная бизнес-логика ===
(async () => {
  console.log(now(), '🚀 Старт парсера AgroMarket');

  setAssociations();

  try {
    await db.sequelize.authenticate();
    console.log(now(), '✅ Подключение к БД успешно');

    // очень важно
    await db.sequelize.sync({ alter: true });
    console.log(now(), '✅ Синхронизация моделей завершена');
  } catch (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
  );

  try {
    await page.goto(START_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await DELAY(1500);

    // === Получаем категории ===
    const categoriesList = await page.evaluate(() => {
      const arr = [];
      document.querySelectorAll('a').forEach(a => {
        const name = a.textContent.trim();
        const url = a.href;
        if (name && url.includes('/product-category/')) arr.push({ name, url });
      });
      const seen = new Set();
      return arr.filter(c => {
        if (seen.has(c.url)) return false;
        seen.add(c.url);
        return true;
      });
    });

    console.log(now(), `📦 Найдено категорий: ${categoriesList.length}`);

    for (const cat of categoriesList) {
      const catRec = await saveCategory(cat.name, cat.url);
      console.log(now(), `Категория сохранена: ${catRec.name}`);

      const pageCat = await browser.newPage();
      await pageCat.goto(cat.url, { waitUntil: 'networkidle2', timeout: 60000 });
      await autoScroll(pageCat);
      await DELAY(1000);

      const products = await pageCat.evaluate(() => {
  const result = [];

  // Пробуем несколько возможных шаблонов
  const selectors = [
    '.products .product',
    'li.product',
    'div.product-item',
    '.product-grid .product',
    '.woocommerce ul.products li'
  ];

  let productElements = [];
  for (const sel of selectors) {
    productElements = document.querySelectorAll(sel);
    if (productElements.length > 0) break;
  }

  productElements.forEach(el => {
    const title =
      el.querySelector('.woocommerce-loop-product__title')?.innerText.trim() ||
      el.querySelector('.product-title')?.innerText.trim() ||
      el.querySelector('h2, h3, h4')?.innerText.trim() ||
      '';
    const url =
      el.querySelector('a[href*="/product/"]')?.href ||
      el.querySelector('a')?.href ||
      '';
    const price =
      el.querySelector('.woocommerce-Price-amount')?.innerText.replace(/[^\d.]/g, '') ||
      el.querySelector('.price')?.innerText.replace(/[^\d.]/g, '') ||
      '0';
    const image =
      el.querySelector('img.wp-post-image')?.src ||
      el.querySelector('img')?.src ||
      '';

    if (title && url) result.push({ title, url, price: parseFloat(price), image });
  });

  return result;
});

      console.log(now(), `[${cat.name}] товаров: ${products.length}`);

      for (const p of products) {
        try {
          const prodPage = await browser.newPage();
          await prodPage.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await DELAY(1200);

          const data = await prodPage.evaluate(() => {
            const getText = sel => document.querySelector(sel)?.innerText.trim() || '';
            const description =
              getText('.woocommerce-product-details__short-description') ||
              getText('#tab-description') ||
              getText('.entry-content');
            const brand = getText('.posted_in a') || '';
            const specs = [];
            document.querySelectorAll('.woocommerce-product-attributes tr').forEach(row => {
              const key = row.querySelector('th')?.innerText.trim();
              const value = row.querySelector('td')?.innerText.trim();
              if (key && value) specs.push({ key, value });
            });
            const images = Array.from(
              document.querySelectorAll('.woocommerce-product-gallery__image img')
            ).map(i => i.src);
            return { description, brand, specs, images };
          });

          const brandRec = await saveBrand(data.brand);
          const prod = await saveProduct(
            { ...p, description: data.description },
            catRec.id,
            brandRec ? brandRec.id : null
          );

          await saveImages(data.images, prod.id);
          await saveSpecs(data.specs, prod.id);

          console.log(now(), `💾 [${cat.name}] Добавлен: ${p.title}`);
          await prodPage.close();
        } catch (err) {
          console.error(now(), `[${cat.name}] Ошибка при товаре:`, err.message);
        }
      }

      await pageCat.close();
      console.log(now(), `[${cat.name}] ✅ Готово`);
    }

    console.log(now(), '🎯 Парсинг завершён успешно');
  } catch (err) {
    console.error(now(), '❌ Общая ошибка:', err.message);
  } finally {
    await browser.close();
    await db.sequelize.close();
  }
})();
