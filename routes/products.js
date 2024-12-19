const express = require('express');
const jwt = require('jsonwebtoken');
const { Product } = require('../models/Product');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; 

// Middleware de autenticação
const auth = (req, res, next) => {
  const token = req.header('Authorization'); // Corrigindo o nome do header
  if (!token) return res.status(401).json({ error: 'Acesso negado' });

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware de verificação de administrador
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
};

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Cria um novo produto
 *     description: Cria um novo produto no catálogo com base nas informações fornecidas.
 *     tags:
 *       - Produtos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do produto
 *               description:
 *                 type: string
 *                 description: Descrição do produto
 *               price:
 *                 type: number
 *                 description: Preço do produto
 *                 example: 100.50
 *               stock:
 *                 type: integer
 *                 description: Quantidade em estoque
 *                 example: 50
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       401:
 *         description: Não autorizado, token JWT inválido ou ausente
 *       403:
 *         description: Acesso restrito a administradores
 *       500:
 *         description: Erro interno no servidor
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtém todos os produtos
 *     description: Obtém uma lista de todos os produtos, com suporte a paginação.
 *     tags:
 *       - Produtos
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página para a paginação
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de produtos por página
 *     responses:
 *       200:
 *         description: Lista de produtos
 *       500:
 *         description: Erro interno no servidor
 */

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     description: Atualiza as informações de um produto existente.
 *     tags:
 *       - Produtos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do produto
 *               description:
 *                 type: string
 *                 description: Descrição do produto
 *               price:
 *                 type: number
 *                 description: Preço do produto
 *                 example: 100.50
 *               stock:
 *                 type: integer
 *                 description: Quantidade em estoque
 *                 example: 50
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       400:
 *         description: Dados inválidos ou erro de validação
 *       401:
 *         description: Não autorizado, token JWT inválido ou ausente
 *       403:
 *         description: Acesso restrito a administradores
 *       500:
 *         description: Erro interno no servidor
 */

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Exclui um produto
 *     description: Exclui um produto do catálogo.
 *     tags:
 *       - Produtos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto excluído com sucesso
 *       401:
 *         description: Não autorizado, token JWT inválido ou ausente
 *       403:
 *         description: Acesso restrito a administradores
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno no servidor
 */

// Rota POST - Criar um novo produto (somente administradores)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const productModel = new Product();
    const product = await productModel.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota GET - Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const productModel = new Product();
    const { page = 1, limit = 10 } = req.query;
    const products = await productModel.getAll(parseInt(page), parseInt(limit));
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota PUT - Atualizar um produto (somente administradores)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const productModel = new Product();
    const updatedProduct = await productModel.update(req.params.id, req.body);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota DELETE - Excluir um produto (somente administradores)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const productModel = new Product();
    const result = await productModel.delete(req.params.id);
    if (result) {
      res.status(200).json({ message: 'Produto excluído com sucesso' });
    } else {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
