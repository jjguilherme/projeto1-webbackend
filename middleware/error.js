const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  // Para APIs
  if (req.originalUrl.startsWith('/api')) {
    return handleAPIError(err, res);
  }

  // Para Web
  handleWebError(err, req, res);
};

function handleAPIError(err, res) {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    erro: err.message || 'Erro interno',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

function handleWebError(err, req, res) {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).render('error', {
    title: 'Erro',
    message: err.message || 'Ocorreu um erro inesperado',
    statusCode
  });
}

module.exports = errorMiddleware;