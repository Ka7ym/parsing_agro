'use strict';
// src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    link: String,
    dateParsed: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);

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
