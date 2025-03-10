const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas protegidas por autenticación
router.use(authMiddleware.protect);

// Rutas administrativas (requieren rol de administrador)
router.use(authMiddleware.restrictTo('admin'));

// Rutas de categoría
router.route('/')
    .get(categoryController.getCategories)
    .post(categoryController.createCategory);

router.route('/:id')
    .get(categoryController.getCategory)
    .patch(categoryController.updateCategory)
    .delete(categoryController.deleteCategory);

module.exports = router;
