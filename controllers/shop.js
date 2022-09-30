const Product = require('../models/product');

exports.getIndex = (req, res) => {
    Product.fetchAll(products => {
        res.render('shop/index', {prods: products, pageTitle: 'Shop', path: '/'});
    });
};

exports.getProducts = (req, res) => {
    Product.fetchAll(products => {
        res.render('shop/product-list', {prods: products, pageTitle: 'Products', path: '/products'});
    });
};

exports.getCart = (req, res) => {
    res.render('shop/cart', {pageTitle: 'Cart', path: '/cart'});
};