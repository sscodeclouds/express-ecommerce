const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
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
  Product.find()
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
  req.user
  .populate('cart.items.productId')
  .then(user => {
    const products = user.cart.items;
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
  Order.find({'user.userId': req.user._id})
      .populate('products.productId')
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
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return {quantity: i.quantity, productId: i.productId}
            });

            const order = new Order({
                products,
                user: {
                    userId: req.user
                }
            });
            order.save()
                .then(() => {
                    user.cart = {items: []};
                    return user.save();
                })
                .then(() => res.redirect('/orders'))
                .catch(err => console.log(err))
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
