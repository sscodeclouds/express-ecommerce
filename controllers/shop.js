const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
      .then(prods => {
        res.render('shop/product-list', {
          prods,
          pageTitle: 'All Products',
          path: '/products'
        });
      })
      .catch(err => {
        console.log(err);
      });
};
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product => {
    res.render('shop/product-detail', {
      product,
      pageTitle: product.title,
      path: '/products'
    });
  }).catch(err => {
    console.log(err)
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
      .then(prods => {
        res.render('shop/index', {
          prods,
          pageTitle: 'Shop',
          path: '/'
        });
      })
      .catch(err => {
        console.log(err);
      });
};
exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then(products => {
    res.render('shop/cart', {
      products,
      path: '/cart',
      pageTitle: 'Your Cart'
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
      .then(product => {
        req.user.addToCart(product)
      })
      .then(() => {
        res.redirect('/cart')
      })
      .catch(err => console.log(err))
};
exports.deleteCartItem =(req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteCartItem(prodId)
      .then(() => {
        res.redirect('/cart');
      })
      .catch(err => {
        console.log(err);
      });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrder()
      .then(orders => {
        res.render('shop/orders', {
            orders: orders[0],
          path: '/orders',
          pageTitle: 'Your Orders'
        });
      })
      .catch(err => console.log(err))
};

exports.postOrders = (req, res, next) => {
    req.user.addOrder()
    .then(() => {
        res.redirect('/orders');
    })
    .catch(err => console.log(err))
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
