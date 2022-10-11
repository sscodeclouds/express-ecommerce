const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(([rows, fields]) => {
    res.render('shop/product-list', {
      prods: rows,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(([rows, fields]) => {
    res.render('shop/product-detail', {
      product: rows[0],
      pageTitle: rows[0].title,
      path: '/products'
    });
  }).catch(err => {
    console.log(err)
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then(([rows, fields]) => {
    res.render('shop/index', {
      prods: rows,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.getCart = (req, res, next) => {
  Cart.fetchAll(cart => {
    Product.fetchAll(products => {
      for (let product of products) {
        let cartProducts = [];
        const cartProductData = cart.products.find(p => p.id === product.id);
        if(cartProductData) {
          cartProducts.push({productData: product, qty: cartProductData.qty});
        }
        res.render('shop/cart', {
          products: cartProducts,
          path: '/cart',
          pageTitle: 'Your Cart'
        });
      }
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/cart');
};

exports.deleteCartItem =(req, res, next) => {
  const prodId = req.body.productId;
  if(prodId !== '') {
    Product.fetchAll(products => {
      const product = products.find(p => p.id === prodId);
      Cart.delete(prodId, product.price);
    });
  }
  res.redirect('/cart');
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
