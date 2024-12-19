const { v4: uuidv4 } = require('uuid');
const FileOperations = require('../utils/fileOperations');
const Product = require('./Product');

class Order {
  constructor() {
    this.fileOps = new FileOperations('orders.json');
    this.productModel = new Product();
  }

  // Criar novo pedido com cálculo de produção e validação de disponibilidade
  async create(orderData) {
    // Validações básicas
    if (!orderData.customerId || !orderData.products || orderData.products.length === 0) {
      throw new Error('Os campos customerId e products são obrigatórios.');
    }

    // Validar disponibilidade de estoque
    await this.validateStock(orderData.products);

    const newOrder = {
      id: uuidv4(),
      customerId: orderData.customerId,
      products: orderData.products,
      status: 'pendente',
      orderDate: new Date().toISOString(),
      estimatedProductionTime: await this.calculateProductionTime(orderData.products),
      total: await this.calculateTotal(orderData.products),
      createdAt: new Date().toISOString(),
    };

    // Atualizar estoque dos produtos
    await this.updateStockAfterOrder(orderData.products);

    return this.fileOps.create(newOrder);
  }

  // Validar disponibilidade de estoque
  async validateStock(products) {
    for (const item of products) {
      const product = await this.productModel.getById(item.productId);
      if (!product) throw new Error(`Produto ${item.productId} não encontrado.`);
      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para o produto ${product.name}.`);
      }
    }
  }

  // Atualizar estoque após criação do pedido
  async updateStockAfterOrder(products) {
    for (const item of products) {
      await this.productModel.updateStock(item.productId, -item.quantity);
    }
  }

  // Calcular tempo de produção com base em material e dimensões
  async calculateProductionTime(products) {
    const PRODUCTION_TIME_BASE = 10; // minutos base por produto
    const MULTIPLIER_BY_MATERIAL = {
      aço: 1.2,
      alumínio: 1,
      galvanizado: 1.5,
    };

    let totalProductionTime = 0;
    for (const item of products) {
      const product = await this.productModel.getById(item.productId);
      const materialMultiplier = MULTIPLIER_BY_MATERIAL[product.material] || 1;
      const area = product.dimensions.width * product.dimensions.length;
      totalProductionTime += PRODUCTION_TIME_BASE * materialMultiplier * area * item.quantity;
    }

    return totalProductionTime;
  }

  // Calcular o total do pedido
  async calculateTotal(products) {
    let total = 0;
    for (const item of products) {
      const product = await this.productModel.getById(item.productId);
      if (!product) throw new Error(`Produto ${item.productId} não encontrado.`);
      total += product.unitPrice * item.quantity;
    }
    return total;
  }

  // Obter todos os pedidos com paginação
  async getAll(page = 1, limit = 10) {
    const orders = await this.fileOps.readFile();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: orders.slice(startIndex, endIndex),
      total: orders.length,
      page,
      totalPages: Math.ceil(orders.length / limit),
    };
  }

  // Obter pedido por ID
  async getById(id) {
    return this.fileOps.findById(id);
  }

  // Atualizar status do pedido
  async updateStatus(id, status) {
    const validStatuses = ['pendente', 'em produção', 'concluído', 'cancelado'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status inválido. Use: pendente, em produção, concluído, cancelado.');
    }

    return this.fileOps.update(id, {
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  // Deletar pedido
  async delete(id) {
    const order = await this.fileOps.findById(id);
    if (!order) throw new Error('Pedido não encontrado.');

    // Reverter estoque dos produtos
    for (const item of order.products) {
      await this.productModel.updateStock(item.productId, item.quantity);
    }

    return this.fileOps.delete(id);
  }

  // Gerar relatório de pedidos concluídos
  async generateReport(startDate, endDate) {
    const orders = await this.fileOps.readFile();

    const completedOrders = orders.filter(
      (order) =>
        order.status === 'concluído' &&
        order.orderDate >= startDate &&
        order.orderDate <= endDate
    );

    return {
      totalOrders: completedOrders.length,
      totalRevenue: completedOrders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue:
        completedOrders.length > 0
          ? completedOrders.reduce((sum, order) => sum + order.total, 0) /
            completedOrders.length
          : 0,
      averageProductionTime:
        completedOrders.length > 0
          ? completedOrders.reduce((sum, order) => sum + order.estimatedProductionTime, 0) /
            completedOrders.length
          : 0,
    };
  }
}

module.exports = Order;
