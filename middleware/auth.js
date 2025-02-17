const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para autenticação de APIs (JWT)
const authAPI = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Token não fornecido');

    const decoded = jwt.verify(token, JWT_SECRET); // Verifica e decodifica o token
    const user = await User.findById(decoded.id); // Encontra o usuário com base no ID do token
    if (!user) throw new Error('Usuário não encontrado');

    req.user = user; // Atribui o usuário ao objeto da requisição
    next(); // Passa o controle para a próxima função/middleware
  } catch (error) {
    res.status(401).json({
      erro: 'Falha na autenticação',
      mensagem: error.message
    });
  }
};

// Middleware para autenticação de Web (Sessão)
const authWeb = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redireciona para a página de login se não estiver autenticado
  }
  next(); // Caso contrário, segue para a próxima rota
};

// Middleware de Admin para Web (verifica se o usuário é administrador)
const isAdminWeb = (req, res, next) => {
  if (req.session.user?.role !== 'admin') { // Verifica se o usuário tem a role de 'admin'
    return res.status(403).render('error', {
      title: 'Acesso Negado',
      message: 'Área restrita a administradores'
    });
  }
  next(); // Caso seja administrador, permite o acesso
};

// Middleware para verificar se o usuário é administrador (para APIs)
const isAdminAPI = (req, res, next) => {
  if (req.user.role !== 'admin') { // Verifica a role do usuário no JWT
    return res.status(403).json({
      erro: 'Acesso negado',
      mensagem: 'Área restrita a administradores'
    });
  }
  next(); // Caso seja administrador, permite o acesso
};

module.exports = {
  authAPI,
  authWeb,
  isAdminWeb,
  isAdminAPI,
  JWT_SECRET
};
