'use strict';
const { Sequelize, DataTypes } = require('sequelize');

// Настройка подключения к БД (замени на свои данные)
const sequelize = new Sequelize('agro_parser', 'postgres', '123456789', {
  host: 'localhost',
  dialect: 'postgres', // или 'mysql', 'sqlite'
});

const db = {};

db.Product = require('./Product')(sequelize, DataTypes);
db.Category = require('./Category')(sequelize, DataTypes);
db.Brand = require('./Brand')(sequelize, DataTypes);
db.ProductImage = require('./ProductImage')(sequelize, DataTypes);
db.ProductSpec = require('./ProductSpec')(sequelize, DataTypes);

// Связываем модели
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;