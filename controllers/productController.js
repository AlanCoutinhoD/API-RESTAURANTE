const pool = require('../config/db');
const fileUpload = require('../middleware/fileUpload');

exports.createProduct = async (req, res) => {
    try {
        // Subir imagen si existe
        if (req.file) {
            req.body.image_url = `/uploads/${req.file.filename}`;
        }

        // Obtener el business_id del usuario
        const [business] = await pool.query(
            'SELECT id FROM businesses WHERE owner_id = ?',
            [req.user.id]
        );

        if (!business.length) {
            return res.status(404).json({ message: 'Negocio no encontrado para este usuario' });
        }

        const businessId = business[0].id;

        // Crear el producto para todo el negocio
        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, image_url, category_id, business_id, user_id, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                req.body.name,
                req.body.description,
                req.body.price,
                req.body.image_url,
                req.body.category_id,
                businessId,
                req.user.id,
                true
            ]
        );
        
        const [product] = await pool.query(
            'SELECT p.*, c.name as category_name \
            FROM products p \
            LEFT JOIN categories c ON p.category_id = c.id \
            WHERE p.id = ?',
            [result.insertId]
        );

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

exports.getBusinessMenu = async (req, res) => {
    try {
        const [products] = await pool.query(
            'SELECT p.*, c.name as category_name, c.id as category_id \
            FROM products p \
            LEFT JOIN categories c ON p.category_id = c.id \
            WHERE p.business_id = ? AND p.available = true \
            ORDER BY c.name, p.name',
            [req.params.businessId]
        );

        // Group products by category
        const menu = products.reduce((acc, product) => {
            const category = {
                id: product.category_id,
                name: product.category_name
            };
            
            if (!acc[product.category_id]) {
                acc[product.category_id] = {
                    category: category,
                    products: []
                };
            }
            
            acc[product.category_id].products.push({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image_url: product.image_url
            });
            
            return acc;
        }, {});

        res.status(200).json(Object.values(menu));
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el menú', error: error.message });
    }
};
