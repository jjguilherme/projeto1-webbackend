const express = require('express');
const jwt = require('jsonwebtoken');
const { Product } = require('../models/Product');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; 

// Middleware de autenticação
const auth = (req, res, next) => {
  const token = req.header('Auttorização');
  if (!token) return res.status(401).json({ error: 'Acesso negado' });

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID do produto
 *                 name:
 *                   type: string
 *                   description: Nome do produto
 *                 description:
 *                   type: string
 *                   description: Descrição do produto
 *                 price:
 *                   type: number
 *                   description: Preço do produto
 *                 stock:
 *                   type: integer
 *                   description: Quantidade em estoque
 *       400:
 *         description: Erro de validação ou dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Não autorizado, token JWT inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   stock:
 *                     type: integer
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.post('/', auth, async (req, res) => {
  try {
    const productModel = new Product();
    const product = await productModel.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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

module.exports = router;
