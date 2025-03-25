const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const publicOrderController = require('../controllers/publicOrderController');

// Public routes
router.get('/menu/business/:businessId', productController.getBusinessMenu);
router.post('/orders', publicOrderController.createPublicOrder);

module.exports = router;