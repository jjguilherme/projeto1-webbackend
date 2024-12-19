const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);  // Log da pilha de erros para depuração

  // Erro de validação (exemplo de erro com validação de dados)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      erro: 'Erro de Validação',
      detalhes: err.details || 'Dados inválidos fornecidos. Verifique as informações enviadas.'
    });
  }

  // Erro de autenticação (usuário não autorizado)
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      erro: 'Não Autorizado',
      detalhes: err.message || 'Você não tem permissão para acessar este recurso.'
    });
  }

  // Erro interno do servidor (erro genérico)
  res.status(500).json({
    erro: 'Erro Interno do Servidor',
    mensagem: err.message || 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.'
  });
};

module.exports = errorMiddleware;
