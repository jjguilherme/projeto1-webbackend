const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Product = require('./Product');

const orderSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  customerId: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  status: { type: String, enum: ['pendente', 'em produção', 'concluído', 'cancelado'], default: 'pendente' },
  orderDate: { type: Date, default: Date.now },
  estimatedProductionTime: { type: Number, required: true },
  total: { type: Number, required: true },
}, { timestamps: true });

const OrderModel = mongoose.model('Order', orderSchema);

class Order {
  // Criar novo pedido
  async create(orderData) {
    if (!orderData.customerId || !orderData.products || orderData.products.length === 0) {
      throw new Error('Os campos customerId e products são obrigatórios.');
    }

    await this.validateStock(orderData.products);
    const estimatedProductionTime = await this.calculateProductionTime(orderData.products);
    const total = await this.calculateTotal(orderData.products);

    const newOrder = new OrderModel({
      customerId: orderData.customerId,
      products: orderData.products,
      estimatedProductionTime,
      total,
    });

    await this.updateStockAfterOrder(orderData.products);
    return newOrder.save();
  }

  async validateStock(products) {
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Produto ${item.productId} não encontrado.`);
      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para o produto ${product.name}.`);
      }
    }
  }

  async updateStockAfterOrder(products) {
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }
  }

  async calculateProductionTime(products) {
    const PRODUCTION_TIME_BASE = 10;
    const MULTIPLIER_BY_MATERIAL = { aço: 1.2, alumínio: 1, galvanizado: 1.5 };
    let totalProductionTime = 0;
    
    for (const item of products) {
      const product = await Product.findById(item.productId);
      const materialMultiplier = MULTIPLIER_BY_MATERIAL[product.material] || 1;
      const area = product.dimensions.width * product.dimensions.length;
      totalProductionTime += PRODUCTION_TIME_BASE * materialMultiplier * area * item.quantity;
    }
    return totalProductionTime;
  }

  async calculateTotal(products) {
    let total = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      total += product.unitPrice * item.quantity;
    }
    return total;
  }

  async getAll(page = 1, limit = 10) {
    const orders = await OrderModel.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await OrderModel.countDocuments();
    return { data: orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getById(id) {
    return OrderModel.findById(id);
  }

  async updateStatus(id, status) {
    if (!['pendente', 'em produção', 'concluído', 'cancelado'].includes(status)) {
      throw new Error('Status inválido.');
    }
    return OrderModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  async delete(id) {
    const order = await OrderModel.findById(id);
    if (!order) throw new Error('Pedido não encontrado.');
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    return OrderModel.findByIdAndDelete(id);
  }

  async generateReport(startDate, endDate) {
    const orders = await OrderModel.find({ status: 'concluído', orderDate: { $gte: startDate, $lte: endDate } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    return {
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
      averageProductionTime: orders.length ? orders.reduce((sum, order) => sum + order.estimatedProductionTime, 0) / orders.length : 0,
    };
  }
}

module.exports = new Order();
