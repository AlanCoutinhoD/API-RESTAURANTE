const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const productRestriction = require('../middleware/productRestriction');

// Rutas protegidas por autenticación
router.use(authMiddleware.protect);

// Rutas de producto
router.get('/', productController.getProducts);
router.get('/:branchId', productController.getProductsByBranch);
router.post('/', productController.createProduct);

router.route('/:productId')
    .get(productController.getProduct)
    .patch(productController.updateProduct)
    .delete(productController.deleteProduct);

module.exports = router;
