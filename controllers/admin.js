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

  req.user.createProduct({title, imageUrl, price, description})
      .then(result => {
        console.log(result)
        res.redirect('/admin/products');
      })
      .catch(err => {
        console.log(err)
      });
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts().then(prods => {
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
  Product.findByPk(prodId).then(product => {
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
    Product.update({title, imageUrl, description, price}, {
      where : {
        id
      }
    }).then(result => {
      console.log(result);
      res.redirect('/admin/products');
    }).catch(err => {
      console.log(err)
    });
  }
};

exports.deleteProduct = (req, res, next) => {
  const id = req.body.id;
  if(id !== '') {
    Product.destroy({
      where: {
        id
      }
    }).then(result => {
      console.log(result)
      res.redirect('/admin/products');
    }).catch(err => {
      console.log(err)
    });
  }
};