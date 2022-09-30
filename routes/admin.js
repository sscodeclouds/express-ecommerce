const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');

router.get('/products', adminController.getProducts);
router.get('/add-product', adminController.getAddProduct);
router.post('/add-product', adminController.postAddProduct);

module.exports = router;