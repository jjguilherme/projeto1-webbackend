const express = require('express');
const app = express();
require('dotenv').config(); // Para variáveis de ambiente
const swaggerUi = require('swagger-ui-express'); // Para exibir a documentação interativa do Swagger
const swaggerJSDoc = require('swagger-jsdoc'); // Para gerar a documentação automaticamente a partir de anotações no código

// Middleware
app.use(express.json());

// Configuração do Swagger
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'API de Cadastramento de Calhas, RUfos, produtos em geral',
      version: '1.0.0',
      description: 'API para gerenciar autenticação, produtos e pedidos',
    },
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Insira o token JWT no formato "Bearer <token>"',
      },
    },
    basePath: '/',
  },
  apis: ['./routes/*.js'], // Caminho swagger
};

// Inicializando o Swagger JSDoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Middleware para servir a documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

app.get('/test', (req, res) => {
    res.send('Server is running!');
});

// Middleware de log
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.path}`);
    next();
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
