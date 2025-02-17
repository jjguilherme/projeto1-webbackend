const express = require('express');
const { Order, Product } = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Operações relacionadas aos pedidos
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags: [Pedidos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de pedidos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, concluído, cancelado]
 *         description: Filtra pedidos pelo status
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).skip((page - 1) * limit).limit(parseInt(limit)).lean().exec();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Pedidos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [products]
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: ID do produto
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Quantidade do produto
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Erro de validação ou estoque insuficiente
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno no servidor
 */


/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Consulta detalhes de um pedido específico
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Detalhes do pedido
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean().exec();
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Altera o status de um pedido
 *     tags: [Pedidos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, concluído, cancelado]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       400:
 *         description: Status inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno
 */


module.exports = router;
