'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductSpec extends Model {
    static associate(models) {
      ProductSpec.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  ProductSpec.init({
    product_id: DataTypes.INTEGER,
    spec_key: DataTypes.STRING,
    spec_value: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ProductSpec',
  });
  return ProductSpec;
};