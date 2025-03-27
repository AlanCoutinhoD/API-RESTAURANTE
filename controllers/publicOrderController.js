const pool = require('../config/db');
const ws = require('../services/websocketService');

exports.createPublicOrder = async (req, res) => {
    try {
        // Create order
        const [orderResult] = await pool.query(
            'INSERT INTO orders (status, total_amount, payment_method, payment_status, branch_id, tableNumber) VALUES (?, ?, ?, ?, ?, ?)',
            ['pending', req.body.total_amount, req.body.payment_method, 'pending', req.body.branch_id, req.body.tableNumber]
        );

        // Create order items
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

        // Get complete order with items
        const [order] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderResult.insertId]
        );

        const [items] = await pool.query(
            'SELECT oi.*, p.name as product_name, p.description \
            FROM order_items oi \
            LEFT JOIN products p ON oi.product_id = p.id \
            WHERE oi.order_id = ?',
            [orderResult.insertId]
        );

        // Format order data for response and WebSocket
        const orderData = {
            ...order[0],
            items: items.map(item => ({
                id: item.id,
                product_name: item.product_name,
                description: item.description,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
            }))
        };

        // Send to WebSocket
        ws.send(JSON.stringify({
            type: 'new_order',
            data: orderData
        }));
        console.log('New order sent to WebSocket:', orderData.id);

        res.status(201).json(orderData);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear orden', error: error.message });
    }
};