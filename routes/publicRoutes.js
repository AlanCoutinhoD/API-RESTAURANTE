const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const publicOrderController = require('../controllers/publicOrderController');
const orderController = require('../controllers/orderController');

// Public routes
router.get('/menu/business/:businessId', productController.getBusinessMenu);
router.post('/orders', publicOrderController.createPublicOrder);
router.patch('/orders/:id', orderController.updateOrder);
router.get('/orders/branch/:branchId/prepared', orderController.getPreparedOrdersByBranch);

module.exports = router;