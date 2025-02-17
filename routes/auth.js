const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const { authWeb, isAdminWeb } = require('../middleware/auth');
const flash = require('connect-flash');

// Validações atualizadas para web e API
const registerValidations = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('name').not().isEmpty().withMessage('Nome é obrigatório'),
];

const loginValidations = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').not().isEmpty().withMessage('Senha é obrigatória'),
];

// Middleware de validação adaptado
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Para API
    if (req.originalUrl.startsWith('/api')) {
      return res.status(400).json({
        error: 'Erro de validação',
        details: errors.array()
      });
    }
    
    // Para Web
    req.flash('error', errors.array()[0].msg);
    return res.redirect('back');
  }
  
  next();
};

// Rotas Web
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/login', {
    title: 'Login',
    messages: req.flash()
  });
});

router.get('/register', isAdminWeb, (req, res) => {
  res.render('auth/register', {
    title: 'Registrar Usuário',
    messages: req.flash()
  });
});

// Login Web
router.post('/login', loginValidations, validate, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user || !(await user.comparePassword(req.body.password))) {
      req.flash('error', 'Credenciais inválidas');
      return res.redirect('/login');
    }

    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      admin: user.isAdmin
    };

    res.redirect(user.isAdmin ? '/admin/dashboard' : '/');
    
  } catch (error) {
    req.flash('error', 'Erro no login');
    res.redirect('/login');
  }
});

// Registro Web (apenas admin)
router.post('/register', isAdminWeb, registerValidations, validate, async (req, res) => {
  try {
    const user = new User({
      ...req.body,
      isAdmin: req.body.isAdmin ? true : false
    });
    
    await user.save();
    req.flash('success', 'Usuário criado com sucesso');
    res.redirect('/admin/usuarios');
    
  } catch (error) {
    req.flash('error', 'Erro ao criar usuário');
    res.redirect('/register');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Rotas API (mantidas)
router.post('/api/register', registerValidations, validate, async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({
      email: user.email,
      name: user.name
    });
  } catch (error) {
    next(error);
  }
});

router.post('/api/login', loginValidations, validate, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      user: {
        email: user.email,
        name: user.name,
        admin: user.isAdmin
      },
      token
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;