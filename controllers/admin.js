const {validationResult} = require('express-validator');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    let errorMessage = req.flash('error');
    if(errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    }else {
        errorMessage = null;
    }
    let successMessage = req.flash('success');
    if(successMessage.length > 0) {
        successMessage = successMessage[0];
    }else {
        successMessage = null;
    }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    oldInput: {},
    validationErrors: [],
      errorMessage,
      successMessage
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.user
  });
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            oldInput: {
                title,
                price,
                description,
                imageUrl,
            },
            errorMessage: '',
            successMessage: '',
            validationErrors: errors.array()
        });
    }
  product
    .save()
    .then(() => {
        req.flash('success', 'Product created successfully');
      res.redirect('/admin/products');
    })
    .catch(err => {
        return res.status(500).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            oldInput: {
                title,
                price,
                description,
                imageUrl,
            },
            errorMessage: 'Some error occurs. Please try again.',
            successMessage: '',
            validationErrors: []
        });
    });
};

exports.getEditProduct = (req, res, next) => {
    let errorMessage = req.flash('error');
    if(errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    }else {
        errorMessage = null;
    }
    let successMessage = req.flash('success');
    if(successMessage.length > 0) {
        successMessage = successMessage[0];
    }else {
        successMessage = null;
    }
  const editMode = req.query.edit;
  if (!editMode) {
      req.flash('error', 'Request is invalid');
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        validationErrors: [],
          errorMessage,
          successMessage
      });
    })
    .catch(err => next(new Error(err)));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            product: {
                _id: prodId,
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDesc,
                imageUrl: updatedImageUrl,
            },
            oldInput: {},
            validationErrors: errors.array(),
            errorMessage: '',
            successMessage: ''
        });
    }

  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()) {
          req.flash('error', 'You do not have permission');
          return res.redirect('/admin/products');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save()
          .then(() => {
              req.flash('success', 'Product updated successfully');
              res.redirect('/admin/products');
          })
          .catch(() => {
              return res.status(500).render('admin/edit-product', {
                  pageTitle: 'Edit Product',
                  path: '/admin/edit-product',
                  editing: true,
                  product: {
                      _id: prodId,
                      title: updatedTitle,
                      price: updatedPrice,
                      description: updatedDesc,
                      imageUrl: updatedImageUrl,
                  },
                  oldInput: {},
                  validationErrors: [],
                  errorMessage: 'Some error occurred. Please try again.',
                  successMessage: ''
              });
          });
    })
    .catch(() => {
        return res.status(500).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            product: {
                _id: prodId,
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDesc,
                imageUrl: updatedImageUrl,
            },
            oldInput: {},
            validationErrors: [],
            errorMessage: 'Invalid product.',
            successMessage: ''
        });
    });
};

exports.getProducts = (req, res, next) => {
    let errorMessage = req.flash('error');
    if(errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    }else {
        errorMessage = null;
    }
    let successMessage = req.flash('success');
    if(successMessage.length > 0) {
        successMessage = successMessage[0];
    }else {
        successMessage = null;
    }
  Product.find({userId: req.user._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
          errorMessage,
          successMessage
      });
    })
    .catch(err => next(new Error(err)));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            if(product.userId.toString() !== req.user._id.toString()) {
                req.flash('error', 'You do not have permission');
                return res.redirect('/admin/products');
            }
            Product.findByIdAndRemove(prodId)
                .then(() => {
                    req.flash('success', 'Product removed successfully');
                    res.redirect('/admin/products');
                })
                .catch(() => {
                    req.flash('error', 'Some error occurred. Please try again.');
                    res.redirect('/admin/products');
                });
        })
        .catch(() => {
            req.flash('error', 'Invalid product.');
            res.redirect('/admin/products');
        });
};
