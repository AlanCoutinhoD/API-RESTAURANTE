const pool = require('../config/db');

exports.createPayment = async (req, res) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO payments (amount, method, status, order_id, user_id) VALUES (?, ?, ?, ?, ?)',
            [req.body.amount, req.body.method, req.body.status, req.body.order_id, req.user.id]
        );
        
        const [payment] = await pool.query('SELECT * FROM payments WHERE id = ?', [result.insertId]);
        res.status(201).json(payment[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear pago', error: error.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        let query = 'SELECT p.*, o.total as order_total, o.status as order_status, u.name as user_name FROM payments p \
                    LEFT JOIN orders o ON p.order_id = o.id \
                    LEFT JOIN users u ON p.user_id = u.id';
        const params = [];

        if (req.query.order) {
            query += ' WHERE order_id = ?';
            params.push(req.query.order);
        }

        if (req.query.user) {
            if (params.length === 0) {
                query += ' WHERE user_id = ?';
            } else {
                query += ' AND user_id = ?';
            }
            params.push(req.query.user);
        }

        if (req.query.status) {
            if (params.length === 0) {
                query += ' WHERE status = ?';
            } else {
                query += ' AND status = ?';
            }
            params.push(req.query.status);
        }

        const [payments] = await pool.query(query, params);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pagos', error: error.message });
    }
};

exports.getPaymentsByBranch = async (req, res) => {
    try {
        const [payments] = await pool.query(
            'SELECT p.*, o.total as order_total, o.status as order_status, u.name as user_name \
            FROM payments p \
            LEFT JOIN orders o ON p.order_id = o.id \
            LEFT JOIN users u ON p.user_id = u.id \
            WHERE o.branch_id = ?',
            [req.params.branchId]
        );
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pagos', error: error.message });
    }
};

exports.getPayment = async (req, res) => {
    try {
        const [payment] = await pool.query(
            'SELECT p.*, o.total as order_total, o.status as order_status, u.name as user_name \
            FROM payments p \
            LEFT JOIN orders o ON p.order_id = o.id \
            LEFT JOIN users u ON p.user_id = u.id \
            WHERE p.id = ?',
            [req.params.paymentId]
        );

        if (!payment.length) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        res.json(payment[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pago', error: error.message });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const updates = req.body;
        const [result] = await pool.query(
            'UPDATE payments SET ? WHERE id = ?',
            [updates, req.params.paymentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        const [updatedPayment] = await pool.query(
            'SELECT p.*, o.total as order_total, o.status as order_status, u.name as user_name \
            FROM payments p \
            LEFT JOIN orders o ON p.order_id = o.id \
            LEFT JOIN users u ON p.user_id = u.id \
            WHERE p.id = ?',
            [req.params.paymentId]
        );

        res.json(updatedPayment[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar pago', error: error.message });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM payments WHERE id = ?', [req.params.paymentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        res.status(204).json({ message: 'Pago eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar pago', error: error.message });
    }
};
