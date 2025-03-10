const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const productRestriction = require('../middleware/productRestriction');

// Rutas protegidas por autenticación
router.use(authMiddleware.protect);

// Rutas de producto
router.get('/', authMiddleware.restrictTo('admin'), productController.getProducts);
router.get('/:branchId', authMiddleware.restrictTo('admin'), productRestriction.checkProductBranchOwnership, productController.getProductsByBranch);
router.post('/', authMiddleware.restrictTo('admin'), productController.createProduct);

router.route('/:productId')
    .get(authMiddleware.restrictTo('admin'), productRestriction.checkProductOwnership, productController.getProduct)
    .patch(authMiddleware.restrictTo('admin'), productRestriction.checkProductOwnership, productController.updateProduct)
    .delete(authMiddleware.restrictTo('admin'), productRestriction.checkProductOwnership, productController.deleteProduct);

module.exports = router;
