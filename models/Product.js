const { v4: uuidv4 } = require('uuid');
const FileOperations = require('../utils/fileOperations');

class Product {
  constructor() {
    this.fileOps = new FileOperations('products.json');
  }

  // Criação de um novo produto com validações específicas para calhas e rufos
  async create(productData) {
    // Validações obrigatórias
    if (!productData.name || !productData.material || !productData.dimensions || !productData.unitPrice || !productData.stock || !productData.type) {
      throw new Error('Todos os campos são obrigatórios: nome, material, dimensões, preço, estoque e tipo.');
    }

    // Validação do preço unitário
    if (typeof productData.unitPrice !== 'number' || productData.unitPrice <= 0) {
      throw new Error('O preço unitário deve ser um número positivo.');
    }

    // Validação do estoque
    if (typeof productData.stock !== 'number' || productData.stock < 0) {
      throw new Error('O estoque deve ser um número não negativo.');
    }

    // Validação do tipo de produto (calha ou rufo)
    const validTypes = ['calha', 'rufo', 'condutor', 'outro'];
    if (!validTypes.includes(productData.type)) {
      throw new Error(`O tipo de produto deve ser um dos seguintes: ${validTypes.join(', ')}`);
    }

    // Validação das dimensões (exemplo: "200x50mm")
    const dimensionPattern = /^\d+x\d+(mm|cm|m)$/;
    if (!dimensionPattern.test(productData.dimensions)) {
      throw new Error('As dimensões devem estar no formato correto, por exemplo: "200x50mm".');
    }

    // Criação do novo produto
    const newProduct = {
      id: uuidv4(),
      name: productData.name,
      material: productData.material,
      dimensions: productData.dimensions,
      unitPrice: productData.unitPrice,
      stock: productData.stock,
      type: productData.type,
      createdAt: new Date().toISOString()
    };

    return this.fileOps.create(newProduct);
  }

  // Obter todos os produtos com paginação
  async getAll(page = 1, limit = 10) {
    const products = await this.fileOps.readFile();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: products.slice(startIndex, endIndex),
      total: products.length,
      page,
      totalPages: Math.ceil(products.length / limit)
    };
  }

  // Obter um produto pelo ID
  async getById(id) {
    const product = await this.fileOps.findById(id);
    if (!product) throw new Error('Produto não encontrado');
    return product;
  }

  // Atualizar um produto
  async update(id, updates) {
    const product = await this.fileOps.findById(id);
    if (!product) throw new Error('Produto não encontrado');

    // Validações opcionais para atualização
    if (updates.unitPrice && (typeof updates.unitPrice !== 'number' || updates.unitPrice <= 0)) {
      throw new Error('O preço unitário deve ser um número positivo.');
    }
    if (updates.stock && (typeof updates.stock !== 'number' || updates.stock < 0)) {
      throw new Error('O estoque deve ser um número não negativo.');
    }

    return this.fileOps.update(id, updates);
  }

  // Deletar um produto
  async delete(id) {
    const product = await this.fileOps.findById(id);
    if (!product) throw new Error('Produto não encontrado');

    return this.fileOps.delete(id);
  }

  // Atualizar o estoque de um produto
  async updateStock(id, quantity) {
    const product = await this.fileOps.findById(id);
    if (!product) throw new Error('Produto não encontrado');

    // Verifica se a quantidade é válida
    if (typeof quantity !== 'number') {
      throw new Error('A quantidade deve ser um número.');
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) throw new Error('Estoque insuficiente');

    return this.fileOps.update(id, { stock: newStock });
  }

  // Calcular custo de fabricação com base no material e dimensões
  calculateManufacturingCost(product) {
    const materialCostFactors = {
      aluminio: 1.5,
      aço: 1.2,
      galvanizado:1.0,
      pvc: 1.0
    };

    const dimensions = product.dimensions.match(/\d+/g).map(Number); // Extrai números das dimensões
    const area = dimensions[0] * dimensions[1]; // Área base em mm²

    const materialFactor = materialCostFactors[product.material.toLowerCase()] || 1.0;

    // Cálculo de custo: base + material + margem de lucro
    const baseCost = area * 0.01; 
    const manufacturingCost = baseCost * materialFactor;
    const profitMargin = 1.3; // Margem de lucro de 30%

    return manufacturingCost * profitMargin;
  }
}

module.exports = Product;
