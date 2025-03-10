const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Error interno del servidor';

    // Manejo de errores de validación de Mongoose
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // Manejo de errores de JWT
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token inválido';
    }

    // Manejo de errores de token expirado
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expirado';
    }

    // Manejo de errores de MongoDB
    if (err.name === 'MongoError' && err.code === 11000) {
        statusCode = 400;
        message = 'El correo electrónico ya está registrado';
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
