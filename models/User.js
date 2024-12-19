const { v4: uuidv4 } = require('uuid');
const FileOperations = require('../utils/fileOperations');

class User {
  constructor() {
    this.fileOps = new FileOperations('users.json');
  }

  async register(userData) {
    const users = await this.fileOps.readFile();
    
    // Checa se o email já existe
    if (users.some(user => user.email === userData.email)) {
      throw new Error('EMAIL JÁ REGISTRADO!!');
    }

    const newUser = {
      id: uuidv4(),
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password, // Armazena a senha diretamente
      role: userData.role || 'user',
      createdAt: new Date().toISOString()
    };

    await this.fileOps.create(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(email, password) {
    const users = await this.fileOps.readFile();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Credenciais INVÁLIDAS');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getById(id) {
    const user = await this.fileOps.findById(id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id, updates) {
    return this.fileOps.update(id, updates);
  }
}

module.exports = { User };  // Exportando a classe User
