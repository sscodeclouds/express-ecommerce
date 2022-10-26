const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Product = sequelize.define('product', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
});

module.exports = Product;