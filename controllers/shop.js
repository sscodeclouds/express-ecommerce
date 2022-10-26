const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  Product.findByPk(prodId).then(product => {
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
  Product.findAll()
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
  .then(cart => {
    if(cart) {
      return cart.getProducts();
    }else {
      return [];
    }
  })
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
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart()
  .then(cart => {
    if (cart) {
      fetchedCart = cart;
      return cart.getProducts({where: {id: prodId}});
    }else {
      req.user.createCart()
      .then(cart => {
        fetchedCart = cart;
        return Promise.resolve([]);
      })
      .catch(err => {
        console.log(err)
      });
    }
  })
  .then(products => {
    let product;
    if (typeof products !== 'undefined' && products.length > 0) {
      product = products[0];
    }
    if (product) {
      let oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      return product;
    }
    return Product.findByPk(prodId);
  })
  .then(product => {
    return fetchedCart.addProduct(product, {through: {quantity: newQuantity}});
  })
  .then(() => {
    res.redirect('/cart');
  })
  .catch(err => {
    console.log(err);
  });
};

exports.deleteCartItem =(req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart()
      .then(cart => {
        return cart.getProducts({where: {id: prodId}})
      })
      .then(products => {
        const product = products[0];
        return product.cartItem.destroy();
      })
      .then(result => {
        res.redirect('/cart');
      })
      .catch(err => {
        console.log(err);
      });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrder()
      .then(order => {
        if(order) {
          return order.getProducts();
        }else {
          return [];
        }
      })
      .then(products => {
        res.render('shop/orders', {
          products,
          path: '/orders',
          pageTitle: 'Your Orders'
        });
      })
      .catch(err => console.log(err))

};

exports.postOrders = (req, res, next) => {
  let userCart;
  req.user.getCart()
      .then(cart => {
        userCart = cart;
        return cart.getProducts();
      })
      .then(products => {
        return req.user.createOrder()
            .then(order => {
              order.addProducts(products.map(product => {
                product.orderItem = {quantity: product.cartItem.quantity}
                return product;
              }));
            })
            .then(result => {
              userCart.destroy();
              res.redirect('/orders');
            })
            .catch(err => console.log(err));
      })
      .catch(err => {
        console.log(err)
      });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
