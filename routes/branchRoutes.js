const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const authMiddleware = require('../middleware/authMiddleware');
const branchRestriction = require('../middleware/branchRestriction');

// Rutas protegidas por autenticación
router.use(authMiddleware.protect);

// Rutas de sucursal
router.get('/', authMiddleware.restrictTo('admin'), branchController.getBranches);
router.post('/', authMiddleware.restrictTo('admin'), branchController.createBranch);

router.route('/:branchId')
    .get(authMiddleware.restrictTo('admin'), branchRestriction.checkBranchOwnership, branchController.getBranch)
    .patch(authMiddleware.restrictTo('admin'), branchRestriction.checkBranchOwnership, branchController.updateBranch)
    .delete(authMiddleware.restrictTo('admin'), branchRestriction.checkBranchOwnership, branchController.deleteBranch);

module.exports = router;
