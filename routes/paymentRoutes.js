const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const paymentRestriction = require('../middleware/paymentRestriction');

// Rutas protegidas por autenticación
router.use(authMiddleware.protect);

// Rutas de pago
router.get('/', authMiddleware.restrictTo('admin'), paymentController.getPayments);
router.get('/:branchId', authMiddleware.restrictTo('admin'), paymentRestriction.checkPaymentBranchOwnership, paymentController.getPaymentsByBranch);
router.post('/', authMiddleware.restrictTo('admin'), paymentController.createPayment);

router.route('/:paymentId')
    .get(authMiddleware.restrictTo('admin'), paymentRestriction.checkPaymentOwnership, paymentController.getPayment)
    .patch(authMiddleware.restrictTo('admin'), paymentRestriction.checkPaymentOwnership, paymentController.updatePayment)
    .delete(authMiddleware.restrictTo('admin'), paymentRestriction.checkPaymentOwnership, paymentController.deletePayment);

module.exports = router;
