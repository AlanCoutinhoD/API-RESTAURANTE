const pool = require('../config/db');

exports.checkProductOwnership = async (req, res, next) => {
    try {
        const [product] = await pool.query(
            'SELECT p.*, b.business_id, bu.owner_id as business_owner_id \
            FROM products p \
            LEFT JOIN branches b ON p.branch_id = b.id \
            LEFT JOIN businesses bu ON b.business_id = bu.id \
            WHERE p.id = ?',
            [req.params.productId]
        );

        if (!product.length) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        if (product[0].business_owner_id !== req.user.id) {
            return res.status(403).json({
                message: 'No tienes permisos para acceder a este producto'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar propiedad del producto', error: error.message });
    }
};

exports.checkProductBranchOwnership = async (req, res, next) => {
    try {
        const [product] = await pool.query(
            'SELECT p.*, b.business_id, bu.owner_id as business_owner_id \
            FROM products p \
            LEFT JOIN branches b ON p.branch_id = b.id \
            LEFT JOIN businesses bu ON b.business_id = bu.id \
            WHERE p.branch_id = ?',
            [req.params.branchId]
        );

        if (!product.length) {
            return res.status(404).json({ message: 'No hay productos para esta sucursal' });
        }

        if (product[0].business_owner_id !== req.user.id) {
            return res.status(403).json({
                message: 'No tienes permisos para acceder a los productos de esta sucursal'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar propiedad de la sucursal', error: error.message });
    }
};

exports.checkBusinessOwnership = async (req, res, next) => {
    try {
        const [products] = await pool.query(
            'SELECT p.*, b.business_id, bu.owner_id as business_owner_id \
            FROM products p \
            LEFT JOIN branches b ON p.branch_id = b.id \
            LEFT JOIN businesses bu ON b.business_id = bu.id \
            WHERE bu.owner_id = ?',
            [req.user.id]
        );

        // Remove the products.length check
        req.products = products;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar los productos del negocio', error: error.message });
    }
};
