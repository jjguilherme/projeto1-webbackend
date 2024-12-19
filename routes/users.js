const express = require('express');
const { User } = require('../models/User');
const { auth, isAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários
 *     description: Obtém uma lista de todos os usuários. Somente administradores podem acessar.
 *     tags:
 *       - Usuários
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autorizado, token JWT inválido ou ausente
 *       403:
 *         description: Acesso restrito a administradores
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const userModel = new User();
    const users = await userModel.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário
 *     description: Cria um novo usuário. Somente administradores podem criar usuários.
 *     tags:
 *       - Usuários
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado, token JWT inválido ou ausente
 *       403:
 *         description: Acesso restrito a administradores
 *       500:
 *         description: Erro interno no servidor
 */
router.post(
  '/',
  auth,
  isAdmin,
  [
    body('username').isString().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    validate,
  ],
  async (req, res) => {
    try {
      const userModel = new User();
      const newUser = await userModel.create(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Exclui um usuário
 *     description: Exclui um usuário específico pelo ID. Somente administradores podem excluir usuários.
 *     tags:
 *       - Usuários
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário a ser excluído
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autorizado, token JWT inválido ou ausente
 *       403:
 *         description: Acesso restrito a administradores
 *       500:
 *         description: Erro interno no servidor
 */
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const userModel = new User();
    const deletedUser = await userModel.delete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.status(200).json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
