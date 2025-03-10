const pool = require('../config/db');

exports.createBranch = async (req, res) => {
    try {
        console.log('Attempting to create branch for user:', req.user.id);
        
        // Verify user has permission to create branches
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create branches' });
        }

        // Check for existing business
        const [business] = await pool.query(
            'SELECT id FROM businesses WHERE owner_id = ?',
            [req.user.id]
        );

        if (!business.length) {
            return res.status(400).json({ 
                message: 'You must first register a business before creating branches',
                code: 'NO_BUSINESS_REGISTERED'
            });
        }

        // Create new branch
        const [result] = await pool.query(
            'INSERT INTO branches (name, address, phone, business_id) VALUES (?, ?, ?, ?)',
            [req.body.name, req.body.address, req.body.phone, business[0].id]
        );
        
        // Return created branch
        const [branch] = await pool.query('SELECT * FROM branches WHERE id = ?', [result.insertId]);
        res.status(201).json(branch[0]);
    } catch (error) {
        console.error('Error creating branch:', error);
        res.status(500).json({ 
            message: 'Error creating branch',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.getBranches = async (req, res) => {
    try {
        // Obtener el ID del negocio del administrador
        const [business] = await pool.query(
            'SELECT id FROM businesses WHERE owner_id = ?',
            [req.user.id]
        );

        if (!business.length) {
            return res.status(404).json({ message: 'No tienes un negocio registrado' });
        }

        const [branches] = await pool.query(
            'SELECT * FROM branches WHERE business_id = ?',
            [business[0].id]
        );
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sucursales', error: error.message });
    }
};

exports.getBranch = async (req, res) => {
    try {
        const [branch] = await pool.query(
            'SELECT * FROM branches WHERE id = ?',
            [req.params.branchId]
        );

        if (!branch.length) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }

        // Verificar que la sucursal pertenece al negocio del administrador
        const [business] = await pool.query(
            'SELECT id FROM businesses WHERE id = ? AND owner_id = ?',
            [branch[0].business_id, req.user.id]
        );

        if (!business.length) {
            return res.status(403).json({ message: 'No tienes permisos para acceder a esta sucursal' });
        }

        res.json(branch[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sucursal', error: error.message });
    }
};

exports.updateBranch = async (req, res) => {
    try {
        const updates = req.body;
        const [result] = await pool.query(
            'UPDATE branches SET ? WHERE id = ?',
            [updates, req.params.branchId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }

        const [updatedBranch] = await pool.query(
            'SELECT * FROM branches WHERE id = ?',
            [req.params.branchId]
        );

        // Verificar que la sucursal pertenece al negocio del administrador
        const [business] = await pool.query(
            'SELECT id FROM businesses WHERE id = ? AND owner_id = ?',
            [updatedBranch[0].business_id, req.user.id]
        );

        if (!business.length) {
            return res.status(403).json({ message: 'No tienes permisos para actualizar esta sucursal' });
        }

        res.json(updatedBranch[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar sucursal', error: error.message });
    }
};

exports.deleteBranch = async (req, res) => {
    try {
        // Verificar que la sucursal pertenece al negocio del administrador
        const [branch] = await pool.query(
            'SELECT * FROM branches WHERE id = ?',
            [req.params.branchId]
        );

        if (!branch.length) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }

        const [business] = await pool.query(
            'SELECT id FROM businesses WHERE id = ? AND owner_id = ?',
            [branch[0].business_id, req.user.id]
        );

        if (!business.length) {
            return res.status(403).json({ message: 'No tienes permisos para eliminar esta sucursal' });
        }

        const [result] = await pool.query(
            'DELETE FROM branches WHERE id = ?',
            [req.params.branchId]
        );

        res.status(204).json({ message: 'Sucursal eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar sucursal', error: error.message });
    }
};
