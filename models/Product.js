'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'category_id' });
      Product.belongsTo(models.Brand, { foreignKey: 'brand_id' });
      Product.hasMany(models.ProductImage, { foreignKey: 'product_id' });
      Product.hasMany(models.ProductSpec, { foreignKey: 'product_id' });
    }
  }
  Product.init({
    title: DataTypes.STRING,
    price: DataTypes.FLOAT,
    url: DataTypes.STRING,
    description: DataTypes.TEXT,
    category_id: DataTypes.INTEGER,
    brand_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};