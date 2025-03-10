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
    .get(orderController.getOrder)
    .patch(orderController.updateOrder)
    .delete(orderController.deleteOrder);

module.exports = router;
