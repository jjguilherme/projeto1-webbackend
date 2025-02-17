# PROJETO PROGRAMAÇÃO WEB BACK-END
# ALUNO: JOAO GUILHERME DE SOUZA / RA:2479516
# Sistema de Gestão de Produção de Chapas Galvanizadas

Este projeto simula o processo de encomenda e produção de chapas galvanizadas e outros produtos relacionados à fabricação de calhas. O sistema é baseado em uma API REST que permite a interação entre diferentes usuários (clientes e administradores), com funcionalidades como criação de pedidos, gerenciamento de produtos, cálculo de tempo de produção, e geração de relatórios.


## Tecnologias Utilizadas

- **Express.js**: Framework para desenvolvimento da API REST.
- **Node.js**: Ambiente de execução para o JavaScript no backend.
- **JSON**: Persistência dos dados utilizando arquivos JSON.
- **JWT (JSON Web Token)**: Sistema de autenticação baseado em token.

## Funcionalidades

### Usuários

O sistema suporta dois tipos de usuários:

- **Administrador**: Pode gerenciar produtos, pedidos, gerar relatórios e modificar status dos pedidos.
- **Cliente**: Pode criar pedidos e consultar o status de seus pedidos.

### Operações CRUD

O sistema implementa operações CRUD (Criar, Ler, Atualizar, Deletar) para as seguintes entidades:

- **Produtos**: Representam as chapas galvanizadas, calhas, rufos e outros produtos fabricados pela empresa.
  - Atributos: ID, Nome, Descrição, Preço Unitário, Estoque.
  
- **Pedidos**: Representam as encomendas feitas pelos clientes.
  - Atributos: ID, Cliente, Data do Pedido, Produtos, Status, Total.

### Lógica de Produção

- **Cálculo de tempo de produção**: O sistema calcula automaticamente o tempo necessário para fabricar os produtos com base na quantidade solicitada e na capacidade de produção (ex.: 10 minutos por chapa).
- **Verificação de estoque**: Antes de aceitar um pedido, o sistema verifica se há produtos suficientes no estoque.
  - Caso contrário, o pedido é colocado como "aguardando reposição" ou o sistema simula a produção para repor o estoque.

### Status do Pedido

Os pedidos podem ter os seguintes status:

- **Pendente**: Pedido recebido e aguardando início da produção.
- **Em Produção**: Pedido sendo fabricado.
- **Concluído**: Pedido finalizado e pronto para entrega.

### Relatórios

O sistema gera relatórios com informações como:

- Pedidos concluídos em um período específico.
- Produtos mais pedidos.
- Tempo médio de produção por pedido.

### Notificação de Status

Quando o status de um pedido é alterado, o cliente é notificado com uma mensagem informando sobre a mudança.

### Sistema de Autenticação

- **Cadastro de Usuários**: Permite que os usuários se registrem com nome, e-mail, senha e tipo de usuário.
- **Login**: Geração de token JWT para autenticação de usuários.
- **Permissões**: Usuários comuns podem consultar e criar pedidos, enquanto administradores têm permissões avançadas para gerenciar produtos, pedidos e usuários.

## Endpoints da API

### Autenticação

- `POST /auth/register`: Cadastro de novo usuário.
- `POST /auth/login`: Realiza o login e retorna um token JWT.

### Produtos

- `GET /products`: Listar todos os produtos disponíveis.
- `POST /products`: Criar um novo produto (somente administradores).
- `PUT /products/:id`: Atualizar um produto (somente administradores).
- `DELETE /products/:id`: Excluir um produto (somente administradores).

### Pedidos

- `GET /orders`: Listar todos os pedidos (com paginação e filtros).
- `POST /orders`: Criar um novo pedido.
- `GET /orders/:id`: Consultar detalhes de um pedido específico.
- `PUT /orders/:id`: Alterar o status de um pedido (somente administradores).

### Relatórios

- `GET /reports`: Gerar relatórios de pedidos e produção.

### Usuários

- `GET /users`: Listar todos os usuários (somente administradores).
- `POST /users`: Criar um novo usuário (somente administradores).
- `DELETE /users/:id`: Excluir um usuário (somente administradores).