const express = require('express');
const { Order, Product } = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

const router = express.Router();

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

module.exports = router;
