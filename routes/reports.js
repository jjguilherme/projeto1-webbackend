const express = require('express');
const { Order } = require('../models/Order'); // Supondo que o modelo Order seja atualizado para MongoDB
const { Product } = require('../models/Product'); // Supondo que o modelo Product seja atualizado para MongoDB
const { auth, isAdmin } = require('../middleware/auth');
const { query } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Gerar relatórios de pedidos e produção
 *     description: Gera relatórios sobre pedidos e produção, incluindo dados agregados como total de vendas e quantidade de produtos vendidos.
 *     tags:
 *       - Relatórios
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início para o relatório
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de término para o relatório
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                   description: Total de pedidos realizados
 *                 totalRevenue:
 *                   type: number
 *                   format: float
 *                   description: Receita total gerada pelos pedidos
 *                 productsSold:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         description: ID do produto
 *                       productName:
 *                         type: string
 *                         description: Nome do produto
 *                       quantitySold:
 *                         type: integer
 *                         description: Quantidade de produtos vendidos
 *       401:
 *         description: Não autorizado, token JWT inválido ou ausente
 *       403:
 *         description: Acesso restrito a administradores
 *       500:
 *         description: Erro interno no servidor
 */
router.get(
  '/',
  auth,
  isAdmin,
  [
    query('startDate').optional().isDate(),
    query('endDate').optional().isDate(),
    validate,
  ],
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Filtrando pedidos pelo intervalo de datas (se fornecido)
      const filters = {};
      if (startDate) filters.createdAt = { $gte: new Date(startDate) };
      if (endDate) filters.createdAt = { $lte: new Date(endDate) };

      // Buscar pedidos com base nos filtros
      const orders = await Order.find(filters).populate('products.productId'); // Usando o populate para trazer os detalhes dos produtos relacionados ao pedido

      // Calculando total de pedidos e receita
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

      // Calculando quantidade de produtos vendidos
      const productsSold = [];

      for (const order of orders) {
        for (const product of order.products) {
          const existingProduct = productsSold.find((p) => p.productId.toString() === product.productId.toString());
          if (existingProduct) {
            existingProduct.quantitySold += product.quantity;
          } else {
            productsSold.push({
              productId: product.productId,
              productName: product.productName, // Supondo que o produto tenha o campo name ou similar
              quantitySold: product.quantity,
            });
          }
        }
      }

      res.json({
        totalOrders,
        totalRevenue,
        productsSold,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
