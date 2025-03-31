const pool = require('../config/db');

exports.createOrder = async (req, res) => {
    try {
        // Crear la orden
        const [orderResult] = await pool.query(
            'INSERT INTO orders (status, total, payment_method, table_number, branch_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [req.body.status, req.body.total, req.body.payment_method, req.body.table_number, req.body.branch_id, req.user.userId]
        );

        // Crear los items de la orden
        const orderItems = req.body.items.map(item => ({
            order_id: orderResult.insertId,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
        }));

        const [itemsResult] = await pool.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [orderItems]
        );

        // Obtener la orden completa con sus items
        const [order] = await pool.query(
            'SELECT o.*, b.name as branch_name, u.name as user_name FROM orders o \
            LEFT JOIN branches b ON o.branch_id = b.id \
            LEFT JOIN users u ON o.user_id = u.id \
            WHERE o.id = ?',
            [orderResult.insertId]
        );

        const [items] = await pool.query(
            'SELECT oi.*, p.name as product_name, p.description as product_description \
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

exports.getOrders = async (req, res) => {
    try {
        let query = 'SELECT o.*, b.name as branch_name, u.name as user_name FROM orders o \
                    LEFT JOIN branches b ON o.branch_id = b.id \
                    LEFT JOIN users u ON o.user_id = u.id';
        const params = [];

        if (req.query.status) {
            query += ' WHERE status = ?';
            params.push(req.query.status);
        }

        if (req.query.branch) {
            if (params.length === 0) {
                query += ' WHERE branch_id = ?';
            } else {
                query += ' AND branch_id = ?';
            }
            params.push(req.query.branch);
        }

        if (req.query.user) {
            if (params.length === 0) {
                query += ' WHERE user_id = ?';
            } else {
                query += ' AND user_id = ?';
            }
            params.push(req.query.user);
        }

        const [orders] = await pool.query(query, params);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener órdenes', error: error.message });
    }
};

exports.getOrdersByBranch = async (req, res) => {
    try {
        // First get all orders for the branch that are not prepared
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE branch_id = ? AND status != "prepared" ORDER BY created_at DESC',
            [req.params.branchId]
        );

        if (!orders.length) {
            return res.status(404).json({ message: 'No hay órdenes pendientes para esta sucursal' });
        }

        // Then get items for each order
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const [items] = await pool.query(
                'SELECT oi.*, p.name as product_name, p.description as product_description \
                FROM order_items oi \
                LEFT JOIN products p ON oi.product_id = p.id \
                WHERE oi.order_id = ?',
                [order.id]
            );

            return {
                ...order,
                items: items.map(item => ({
                    id: item.id,
                    product_name: item.product_name,
                    description: item.product_description,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price
                }))
            };
        }));

        res.status(200).json(ordersWithItems);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener órdenes', error: error.message });
    }
};

exports.getPreparedOrdersByBranch = async (req, res) => {
    try {
        // Get only prepared orders for the branch
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE branch_id = ? AND status = "prepared" ORDER BY created_at DESC',
            [req.params.branchId]
        );

        if (!orders.length) {
            return res.status(404).json({ message: 'No hay órdenes preparadas para esta sucursal' });
        }

        // Get items for each order
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const [items] = await pool.query(
                'SELECT oi.*, p.name as product_name, p.description as product_description \
                FROM order_items oi \
                LEFT JOIN products p ON oi.product_id = p.id \
                WHERE oi.order_id = ?',
                [order.id]
            );

            return {
                ...order,
                items: items.map(item => ({
                    id: item.id,
                    product_name: item.product_name,
                    description: item.product_description,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price
                }))
            };
        }));

        res.status(200).json(ordersWithItems);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener órdenes preparadas', error: error.message });
    }
};

exports.getDeliveredOrdersByBranch = async (req, res) => {
    try {
        // Get only entregado orders for the branch
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE branch_id = ? AND status = "entregado" ORDER BY created_at DESC',
            [req.params.branchId]
        );

        if (!orders.length) {
            return res.status(404).json({ message: 'No hay órdenes entregadas para esta sucursal' });
        }

        // Get items for each order
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const [items] = await pool.query(
                'SELECT oi.*, p.name as product_name, p.description as product_description \
                FROM order_items oi \
                LEFT JOIN products p ON oi.product_id = p.id \
                WHERE oi.order_id = ?',
                [order.id]
            );

            return {
                ...order,
                items: items.map(item => ({
                    id: item.id,
                    product_name: item.product_name,
                    description: item.product_description,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price
                }))
            };
        }));

        res.status(200).json(ordersWithItems);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener órdenes entregadas', error: error.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const [order] = await pool.query(
            'SELECT o.*, b.name as branch_name \
            FROM orders o \
            LEFT JOIN branches b ON o.branch_id = b.id \
            WHERE o.id = ?',
            [req.params.id]
        );

        if (!order.length) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        const [items] = await pool.query(
            'SELECT oi.*, p.name as product_name, p.description as product_description \
            FROM order_items oi \
            LEFT JOIN products p ON oi.product_id = p.id \
            WHERE oi.order_id = ?',
            [req.params.id]
        );

        res.json({
            order: {
                ...order[0],
                items: items.map(item => ({
                    id: item.id,
                    product_name: item.product_name,
                    description: item.product_description,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener orden', error: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const updates = req.body;
        const [result] = await pool.query(
            'UPDATE orders SET ? WHERE id = ?',
            [updates, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        const [updatedOrder] = await pool.query(
            'SELECT o.*, b.name as branch_name, u.name as user_name FROM orders o \
            LEFT JOIN branches b ON o.branch_id = b.id \
            LEFT JOIN users u ON o.user_id = u.id \
            WHERE o.id = ?',
            [req.params.id]
        );

        const [items] = await pool.query(
            'SELECT oi.*, p.name as product_name, p.description as product_description \
            FROM order_items oi \
            LEFT JOIN products p ON oi.product_id = p.id \
            WHERE oi.order_id = ?',
            [req.params.id]
        );

        res.json({ order: updatedOrder[0], items });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar orden', error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        // Eliminar los items de la orden primero
        await pool.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);

        // Eliminar la orden
        const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.json({ message: 'Orden eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar orden', error: error.message });
    }
};

exports.getOrdersByPaymentStatus = async (req, res) => {
    try {
        const [orders] = await pool.query(
            'SELECT o.*, b.name as branch_name \
            FROM orders o \
            LEFT JOIN branches b ON o.branch_id = b.id \
            WHERE o.payment_status = ? AND o.branch_id = ? \
            ORDER BY o.created_at DESC',
            [req.params.payment_status, req.params.branchId]
        );

        if (!orders.length) {
            return res.status(404).json({ message: 'No hay órdenes con este estado de pago para esta sucursal' });
        }

        // Get items for each order
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const [items] = await pool.query(
                'SELECT oi.*, p.name as product_name, p.description as product_description \
                FROM order_items oi \
                LEFT JOIN products p ON oi.product_id = p.id \
                WHERE oi.order_id = ?',
                [order.id]
            );

            return {
                ...order,
                items: items.map(item => ({
                    id: item.id,
                    product_name: item.product_name,
                    description: item.product_description,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price
                }))
            };
        }));

        res.status(200).json(ordersWithItems);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener órdenes', error: error.message });
    }
};
