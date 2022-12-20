const {validationResult} = require('express-validator');
const Product = require('../models/product');
const fileHelper = require('../util/file');

const ITEMS_PER_PAGE = 2;

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
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

    if(!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            oldInput: {
                title,
                price,
                description
            },
            errorMessage: 'Attached file is not an image',
            successMessage: '',
            validationErrors: []
        });
    }

    const imageUrl = image.path.replace('\\', '/');

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            oldInput: {
                title,
                price,
                description
            },
            errorMessage: '',
            successMessage: '',
            validationErrors: errors.array()
        });
    }
    const product = new Product({
        title,
        price,
        description,
        imageUrl,
        userId: req.user
    });

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
                description
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
  const image = req.file;
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
                description: updatedDesc
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
      if(image) {
          fileHelper.deleteFile(product.imageUrl);
          product.imageUrl = image.path.replace('\\', '/');
      }
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
                      description: updatedDesc
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
                description: updatedDesc
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

    const page = +req.query.page || 1;
    let totalItems = 0;
    Product.find({userId: req.user._id})
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find({userId: req.user._id})
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
                errorMessage,
                successMessage,
                currentPage: page,
                nextPage: page + 1,
                prevPage: page - 1,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPrevPage: page > 1,
                lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
            });
        })
        .catch(err => next(new Error(err)));
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if(product.userId.toString() !== req.user._id.toString()) {
                res.status(500).json({'message': 'You do not have permission'});
            }
            fileHelper.deleteFile(product.imageUrl);
            Product.findByIdAndRemove(prodId)
                .then(() => {
                    res.status(200).json({'message': 'Product removed successfully'})
                })
                .catch(() => {
                    res.status(500).json({'message': 'Some error occurred. Please try again.'});
                });
        })
        .catch(() => {
            res.status(500).json({'message': 'Invalid Product.'});
        });
};
