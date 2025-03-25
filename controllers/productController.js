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
        const [products] = await pool.query(
            'SELECT p.*, c.name as category_name, b.name as branch_name \
            FROM products p \
            LEFT JOIN categories c ON p.category_id = c.id \
            LEFT JOIN branches b ON p.branch_id = b.id \
            WHERE p.user_id = ?',
            [req.user.id]
        );

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const [product] = await pool.query(
            'SELECT p.*, c.name as category_name, b.name as branch_name \
            FROM products p \
            LEFT JOIN categories c ON p.category_id = c.id \
            LEFT JOIN branches b ON p.branch_id = b.id \
            WHERE p.id = ? AND p.user_id = ?',
            [req.params.productId, req.user.id]
        );

        if (!product.length) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(product[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener producto', error: error.message });
    }
};

exports.getProductsByBranch = async (req, res) => {
    try {
        const [products] = await pool.query(
            'SELECT p.*, c.name as category_name, b.name as branch_name \
            FROM products p \
            LEFT JOIN categories c ON p.category_id = c.id \
            LEFT JOIN branches b ON p.branch_id = b.id \
            LEFT JOIN businesses bu ON b.business_id = bu.id \
            WHERE p.branch_id = ? AND bu.owner_id = ?',
            [req.params.branchId, req.user.id]
        );

        if (!products.length) {
            return res.status(404).json({ message: 'No hay productos para esta sucursal' });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const [product] = await pool.query(
            'SELECT p.*, c.name as category_name, b.name as branch_name \
            FROM products p \
            LEFT JOIN categories c ON p.category_id = c.id \
            LEFT JOIN branches b ON p.branch_id = b.id \
            LEFT JOIN businesses bu ON b.business_id = bu.id \
            WHERE p.id = ? AND bu.owner_id = ?',
            [req.params.productId, req.user.id]
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
