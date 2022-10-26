const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const CartItem = sequelize.define('cartItem', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
},{
    timestamps: false
});

module.exports = CartItem;