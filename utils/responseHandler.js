const responseHandler = {
    success: (res, message, data = null, statusCode = 200) => {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    },

    error: (res, message, statusCode = 500) => {
        res.status(statusCode).json({
            success: false,
            error: message
        });
    },

    validationError: (res, errors, statusCode = 400) => {
        res.status(statusCode).json({
            success: false,
            error: 'Validación fallida',
            details: errors
        });
    },

    notFound: (res, message = 'Recurso no encontrado', statusCode = 404) => {
        res.status(statusCode).json({
            success: false,
            error: message
        });
    },

    unauthorized: (res, message = 'No autorizado', statusCode = 401) => {
        res.status(statusCode).json({
            success: false,
            error: message
        });
    },

    forbidden: (res, message = 'Acceso denegado', statusCode = 403) => {
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }
};

module.exports = responseHandler;
