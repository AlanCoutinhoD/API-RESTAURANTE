const pool = require('../config/db');

exports.createPublicOrder = async (req, res) => {
    try {
        // Crear la orden
        const [orderResult] = await pool.query(
            'INSERT INTO orders (status, total_amount, payment_method, payment_status, branch_id, `tableNumber`) VALUES (?, ?, ?, ?, ?, ?)',
            ['pending', req.body.total_amount, req.body.payment_method, 'pending', req.body.branch_id, req.body.tableNumber]
        );

        // Crear los items de la orden
        const orderItems = req.body.items.map(item => [
            orderResult.insertId,
            item.product_id,
            item.quantity,
            item.price
        ]);

        await pool.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [orderItems]
        );

        // Obtener la orden completa con sus items
        const [order] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderResult.insertId]
        );

        const [items] = await pool.query(
            'SELECT oi.*, p.name as product_name \
            FROM order_items oi \
            LEFT JOIN products p ON oi.product_id = p.id \
            WHERE oi.order_id = ?',
            [orderResult.insertId]
        );

        res.status(201).json({ order: order[0], items });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear orden', error: error.message });
    }
};