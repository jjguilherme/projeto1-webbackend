const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { body, validationResult } = require('express-validator');
const path = require('path');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'Sua chave secreta';


// Validações para registro e login de usuário
const registerValidations = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
  body('name').not().isEmpty().withMessage('O nome é obrigatório'),
];

const loginValidations = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
];

// Middleware de validação de dados
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Erro de validação');
    error.statusCode = 400;
    error.details = errors.array();
    return next(error);
  }
  next();
};

// Registro de novo usuário
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     description: Registra um novo usuário no sistema.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                 name:
 *                   type: string
 *       400:
 *         description: Erro na criação do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/register', registerValidations, validate, async (req, res, next) => {
  try {
    const user = new User();
    const userData = await user.register(req.body);
    res.status(201).json({
      email: userData.email,
      name: userData.name
    });
  } catch (error) {
    next(error);
  }
});

// Login do usuário
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza o login de um usuário
 *     description: Realiza o login e retorna um token JWT para autenticação.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login bem-sucedido com o retorno do token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       format: email
 *                     name:
 *                       type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/login', loginValidations, validate, async (req, res, next) => {
  try {
    const user = new User();
    const userData = await user.login(req.body.email, req.body.password);
    const token = jwt.sign({ id: userData._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      user: {
        email: userData.email,
        name: userData.name
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Criar um usuário administrador (somente via GET para fins de instalação)
router.get('/install', async (req, res, next) => {
  try {
    // Verifica se já existe um administrador
    const existingAdmin = await User.findOne({ where: { isAdmin: true } });
    if (existingAdmin) {
      return res.status(200).json({ message: 'Usuário administrador já existe.' });
    }

    // Cria um novo usuário administrador
    const adminData = {
      email: 'admin@admin.com',
      password: 'admin123', 
      name: 'Administrador',
    };

    const user = new User();
    await user.register(adminData); 

    res.status(201).json({ message: 'Usuário administrador criado com sucesso.' });
  } catch (error) {
    next(error);
  }
});

// Documentação Swagger
/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Acessa a documentação da API
 *     description: Acessa a documentação da API gerada pelo Swagger.
 *     responses:
 *       200:
 *         description: Documentação da API
 */
router.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger.html')); 
});

// Exporta o router para ser utilizado no app
module.exports = router;
