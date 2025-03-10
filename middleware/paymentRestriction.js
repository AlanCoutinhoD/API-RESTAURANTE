const pool = require('../config/db');

exports.checkPaymentOwnership = async (req, res, next) => {
    try {
        const [payment] = await pool.query(
            'SELECT p.*, o.branch_id, b.business_id, bu.owner_id as business_owner_id \
            FROM payments p \
            LEFT JOIN orders o ON p.order_id = o.id \
            LEFT JOIN branches b ON o.branch_id = b.id \
            LEFT JOIN businesses bu ON b.business_id = bu.id \
            WHERE p.id = ?',
            [req.params.paymentId]
        );

        if (!payment.length) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        if (payment[0].business_owner_id !== req.user.id) {
            return res.status(403).json({
                message: 'No tienes permisos para acceder a este pago'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar propiedad del pago', error: error.message });
    }
};

exports.checkPaymentBranchOwnership = async (req, res, next) => {
    try {
        const [payment] = await pool.query(
            'SELECT p.*, o.branch_id, b.business_id, bu.owner_id as business_owner_id \
            FROM payments p \
            LEFT JOIN orders o ON p.order_id = o.id \
            LEFT JOIN branches b ON o.branch_id = b.id \
            LEFT JOIN businesses bu ON b.business_id = bu.id \
            WHERE o.branch_id = ?',
            [req.params.branchId]
        );

        if (!payment.length) {
            return res.status(404).json({ message: 'No hay pagos para esta sucursal' });
        }

        if (payment[0].business_owner_id !== req.user.id) {
            return res.status(403).json({
                message: 'No tienes permisos para acceder a los pagos de esta sucursal'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar propiedad de la sucursal', error: error.message });
    }
};
