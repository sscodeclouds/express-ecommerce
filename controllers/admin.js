const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({title, price, description, imageUrl, userId: req.user});
  product.save()
      .then(result => {
          console.log(result);
          res.redirect('/admin/products');
      }).catch(err => {
          console.log(err)
      });
};
exports.getProducts = (req, res, next) => {
  Product.find()
      .then(prods => {
        res.render('admin/products', {
          prods,
          pageTitle: 'Admin Products',
          path: '/admin/products'
        });
      }).catch(err => {
        console.log(err);
      });
};
exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product => {
    res.render('admin/edit-product', {
      product,
      pageTitle: product.title,
      path: '/admin/products'
    });
  }).catch(err => {
    console.log(err)
  });
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  if(id !== '') {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    Product.findById(id).then(product => {
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      product.save().then(result => {
        res.redirect('/admin/products');
      }).catch(err => {
        console.log(err)
      });
    }).catch(err => {
      console.log(err)
    });
  }
};
exports.deleteProduct = (req, res, next) => {
  const id = req.body.id;
  if(id !== '') {
    Product.findByIdAndRemove(id).then(() => {
      res.redirect('/admin/products');
    }).catch(err => {
      console.log(err)
    });
  }
};
