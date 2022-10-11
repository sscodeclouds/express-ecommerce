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
  const product = new Product(title, imageUrl, description, price);
  product.save().then(result => {
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  });
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(([rows, fields]) => {
    res.render('admin/products', {
      prods: rows,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(([rows, fields]) => {
    res.render('admin/edit-product', {
      product: rows[0],
      pageTitle: rows[0].title,
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
    const product = new Product(title, imageUrl, description, price);
    product.save(id).then(result => {
      res.redirect('/admin/products');
    }).catch(err => {
      console.log(err)
    });
  }
};

exports.deleteProduct = (req, res, next) => {
  const id = req.body.id;
  console.log(id)
  if(id !== '') {
    Product.delete(id).then(result => {
      res.redirect('/admin/products');
    }).catch(err => {
      console.log(err)
    });
  }
};