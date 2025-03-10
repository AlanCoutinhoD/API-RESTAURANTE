const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    try {
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
        if (!user.length) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        const [result] = await pool.query(
            'UPDATE users SET ? WHERE id = ?',
            [updates, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const [updatedUser] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
        res.json(updatedUser[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);

        if (!user.length) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña actual incorrecta' });
        }

        // Hash nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.userId]);

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar contraseña', error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (!user.length) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Verificar si el email ya existe
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email ya registrado' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el usuario
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        // Obtener el usuario creado
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        
        // Eliminar la contraseña del objeto antes de enviarlo
        delete user[0].password;
        
        res.status(201).json(user[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updates = req.body;
        const [result] = await pool.query(
            'UPDATE users SET ? WHERE id = ?',
            [updates, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const [updatedUser] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        res.json(updatedUser[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
};
