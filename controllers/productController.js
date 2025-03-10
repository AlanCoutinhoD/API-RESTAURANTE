const pool = require('../config/db');
const fileUpload = require('../middleware/fileUpload');

exports.createProduct = async (req, res) => {
    try {
        // Subir imagen si existe
        if (req.file) {
            req.body.image_url = `/uploads/${req.file.filename}`;
        }

        // Obtener el business_id del usuario autenticado
        const [business] = await pool.query(
            'SELECT id FROM businesses WHERE owner_id = ?',
            [req.user.id]
        );

        if (!business.length) {
            return res.status(404).json({ message: 'Negocio no encontrado para este usuario' });
        }

        const businessId = business[0].id;

        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, image_url, available, category_id, branch_id, user_id, business_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.body.name, req.body.description, req.body.price, req.body.image_url, req.body.available, req.body.category_id, req.body.branch_id, req.user.id, businessId]
        );
        
        const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
        res.status(201).json(product[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        let query = 'SELECT p.*, c.name as category_name, b.name as branch_name FROM products p \
                    LEFT JOIN categories c ON p.category_id = c.id \
                    LEFT JOIN branches b ON p.branch_id = b.id';
        const params = [];

        if (req.query.category) {
            query += ' WHERE category_id = ?';
            params.push(req.query.category);
        }

        if (req.query.branch) {
            if (params.length === 0) {
                query += ' WHERE branch_id = ?';
            } else {
                query += ' AND branch_id = ?';
            }
            params.push(req.query.branch);
        }

        if (req.query.available !== undefined) {
            if (params.length === 0) {
                query += ' WHERE available = ?';
            } else {
                query += ' AND available = ?';
            }
            params.push(req.query.available === 'true');
        }

        const [products] = await pool.query(query, params);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

exports.getProductsByBranch = async (req, res) => {
    try {
        const [products] = await pool.query(
            'SELECT p.*, c.name as category_name, b.name as branch_name FROM products p \
            LEFT JOIN categories c ON p.category_id = c.id \
            LEFT JOIN branches b ON p.branch_id = b.id \
            WHERE p.branch_id = ?',
            [req.params.branchId]
        );
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const [product] = await pool.query(
            'SELECT p.*, c.name as category_name, b.name as branch_name FROM products p \
            LEFT JOIN categories c ON p.category_id = c.id \
            LEFT JOIN branches b ON p.branch_id = b.id \
            WHERE p.id = ?',
            [req.params.productId]
        );

        if (!product.length) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(product[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener producto', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        // Subir nueva imagen si existe
        if (req.file) {
            req.body.image_url = `/uploads/${req.file.filename}`;
        }

        const updates = req.body;
        const [result] = await pool.query(
            'UPDATE products SET ? WHERE id = ?',
            [updates, req.params.productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const [updatedProduct] = await pool.query(
            'SELECT p.*, c.name as category_name, b.name as branch_name FROM products p \
            LEFT JOIN categories c ON p.category_id = c.id \
            LEFT JOIN branches b ON p.branch_id = b.id \
            WHERE p.id = ?',
            [req.params.productId]
        );

        res.json(updatedProduct[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(204).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
};
