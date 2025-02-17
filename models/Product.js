const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome do produto é obrigatório.']
  },
  material: {
    type: String,
    required: [true, 'O material é obrigatório.'],
    enum: {
      values: ['aluminio', 'aço', 'galvanizado', 'pvc'],
      message: 'Material inválido. Escolha entre: aluminio, aço, galvanizado ou pvc.'
    }
  },
  dimensions: {
    type: String,
    required: [true, 'As dimensões são obrigatórias.'],
    match: [/^\d+x\d+(mm|cm|m)$/, 'As dimensões devem estar no formato correto, por exemplo: "200x50mm".']
  },
  unitPrice: {
    type: Number,
    required: [true, 'O preço unitário é obrigatório.'],
    min: [0, 'O preço unitário deve ser um número positivo.']
  },
  stock: {
    type: Number,
    required: [true, 'O estoque é obrigatório.'],
    min: [0, 'O estoque deve ser um número não negativo.']
  },
  type: {
    type: String,
    required: [true, 'O tipo de produto é obrigatório.'],
    enum: {
      values: ['calha', 'rufo', 'condutor', 'outro'],
      message: 'Tipo inválido. Escolha entre: calha, rufo, condutor ou outro.'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método para atualizar o estoque
productSchema.methods.updateStock = async function (quantity) {
  if (typeof quantity !== 'number') {
    throw new Error('A quantidade deve ser um número.');
  }

  const newStock = this.stock + quantity;
  if (newStock < 0) throw new Error('Estoque insuficiente.');

  this.stock = newStock;
  await this.save();
};

// Método para calcular o custo de fabricação
productSchema.methods.calculateManufacturingCost = function () {
  const materialCostFactors = {
    aluminio: 1.5,
    aço: 1.2,
    galvanizado: 1.0,
    pvc: 0.8
  };

  const dimensions = this.dimensions.match(/\d+/g).map(Number);
  const area = dimensions[0] * dimensions[1];
  const materialFactor = materialCostFactors[this.material.toLowerCase()] || 1.0;
  const baseCost = area * 0.01;
  const manufacturingCost = baseCost * materialFactor;
  const profitMargin = 1.3; // Margem de lucro

  return manufacturingCost * profitMargin;
};

// Definindo o modelo
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
