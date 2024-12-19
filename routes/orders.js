const express = require('express');
const { Order, Product } = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { body, query } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lista todos os pedidos
 *     description: Obtém uma lista de todos os pedidos com suporte a paginação e filtros de status.
 *     tags:
 *       - Pedidos
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
 *         description: Limite de pedidos por página
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           description: Filtra os pedidos por status (ex: 'pendente', 'concluído', 'cancelado')
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const orderModel = new Order();
    const orders = await orderModel.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
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
 *     description: Cria um novo pedido com os produtos selecionados. Verifica se há estoque suficiente antes de criar o pedido.
 *     tags:
 *       - Pedidos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: ID do produto
 *                     quantity:
 *                       type: integer
 *                       description: Quantidade do produto
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID do pedido
 *                 customerId:
 *                   type: string
 *                   description: ID do cliente que fez o pedido
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *       400:
 *         description: Erro de validação ou estoque insuficiente
 *       401:
 *         description: Não autorizado, token JWT inválido ou ausente
 *       500:
 *         description: Erro interno no servidor
 */
router.post(
  '/',
  auth,
  [
    body('products').isArray(),
    body('products.*.productId').notEmpty(),
    body('products.*.quantity').isInt({ min: 1 }),
    validate,
  ],
  async (req, res, next) => {
    try {
      const orderModel = new Order();
      const productModel = new Product();

      for (const item of req.body.products) {
        const product = await productModel.getById(item.productId);
        if (product.stock < item.quantity) {
          throw new Error(`Estoque insuficiente pelo produto ${product.name}`);
        }
      }

      const order = await orderModel.create({
        ...req.body,
        customerId: req.user.id,
      });

      for (const item of req.body.products) {
        await productModel.updateStock(item.productId, -item.quantity);
      }

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Consulta detalhes de um pedido específico
 *     description: Obtém os detalhes de um pedido específico pelo ID.
 *     tags:
 *       - Pedidos
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
 *         description: Erro interno no servidor
 */
router.get('/:id', async (req, res) => {
  try {
    const orderModel = new Order();
    const order = await orderModel.getById(req.params.id);
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
 *     description: Altera o status de um pedido específico. Somente administradores podem alterar o status.
 *     tags:
 *       - Pedidos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *       - in: body
 *         name: status
 *         required: true
 *         description: Novo status do pedido
 *         schema:
 *           type: string
 *           enum: [pendente, concluído, cancelado]
 *           description: Novo status do pedido
 *     responses:
 *       200:
 *         description: Status do pedido atualizado com sucesso
 *       400:
 *         description: Status inválido
 *       401:
 *         description: Não autorizado, token JWT inválido ou ausente
 *       403:
 *         description: Acesso restrito a administradores
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno no servidor
 */
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const orderModel = new Order();
    const updatedOrder = await orderModel.updateStatus(req.params.id, status);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
