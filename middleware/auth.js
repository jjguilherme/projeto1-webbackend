const jwt = require('jsonwebtoken');

const JWT_SECRET = 'sua-chave-secreta'; 

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ erro: 'Autenticação necessária', mensagem: 'Por favor, forneça um token válido para acessar este recurso.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido', mensagem: 'O token fornecido é inválido ou expirou. Tente fazer login novamente.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso proibido', mensagem: 'Você não tem permissão para acessar esta área de administração.' });
  }
  next();
};

module.exports = { auth, isAdmin, JWT_SECRET };
