const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const authMiddleware = require('../middleware/authMiddleware');
const businessRestriction = require('../middleware/businessRestriction');

// Rutas protegidas por autenticación
router.use(authMiddleware.protect);

// Rutas de negocio
router.get('/', authMiddleware.restrictTo('admin'), businessController.getBusinesses);
router.post('/', authMiddleware.restrictTo('admin'), businessRestriction.checkBusinessLimit, businessController.createBusiness);

router.route('/:businessId')
    .get(authMiddleware.restrictTo('admin'), businessRestriction.checkBusinessOwnership, businessController.getBusiness)
    .patch(authMiddleware.restrictTo('admin'), businessRestriction.checkBusinessOwnership, businessController.updateBusiness)
    .delete(authMiddleware.restrictTo('admin'), businessRestriction.checkBusinessOwnership, businessController.deleteBusiness);

module.exports = router;
