const express = require('express');
const app = express();
require('dotenv').config(); // Carrega variáveis de ambiente
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const mustacheExpress = require('mustache-express'); // Adicionando mustache-express
const path = require('path'); // Para gerenciar o caminho das views

// Importando a configuração do banco de dados
const { connectDB } = require('./config/db');

// Middleware
app.use(express.json()); // Permite que o corpo da requisição seja processado como JSON

// Configuração do Swagger
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'API de Cadastramento de Calhas, Rufos, Produtos em Geral',
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
  apis: ['./routes/*.js'], // Caminho das rotas Swagger
};

// Inicializando o Swagger JSDoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Conectar ao MongoDB antes de iniciar o servidor
connectDB().catch((error) => {
  console.error('Erro ao conectar ao banco de dados:', error);
  process.exit(1);
});

// Configuração do Mustache para renderização de views
app.engine('mustache', mustacheExpress()); // Define Mustache como motor de templates
app.set('view engine', 'mustache'); // Define o motor como mustache
app.set('views', path.join(__dirname, 'views')); // Define o diretório de views (você cria essa pasta)


// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Endpoint de Teste
app.get('/test', (req, res) => {
  res.send('Server is running!');
});

// Rota para renderizar uma página com Mustache
app.get('/', (req, res) => {
  const data = {
    title: 'Minha Interface Web',
    description: 'Esta é uma interface simples usando Mustache e Express!',
    users: [
      { name: 'João', age: 30 },
      { name: 'Maria', age: 25 },
      { name: 'Pedro', age: 35 }
    ]
  };
  
  res.render('index', data); // Renderiza o template 'index.mustache' com os dados
});

// Middleware para Capturar Erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado no servidor!' });
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

