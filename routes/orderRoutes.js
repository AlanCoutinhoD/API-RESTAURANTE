const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas protegidas por autenticación
router.use(authMiddleware.protect);

// Rutas de pedido
router.route('/')
    .get(orderController.getOrders)
    .post(orderController.createOrder);

router.route('/:id')
    .patch(orderController.updateOrder)
    .delete(orderController.deleteOrder);

router.get('/branch/:branchId/payment_status/:payment_status', orderController.getOrdersByPaymentStatus);
router.get('/branch/:branchId', orderController.getOrdersByBranch);
router.get('/branch/:branchId/delivered', orderController.getDeliveredOrdersByBranch);

module.exports = router;
