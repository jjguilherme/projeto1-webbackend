const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Armazena a senha diretamente 
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

class UserService {
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new Error('EMAIL JÁ REGISTRADO!!');
    
    const newUser = new User(userData);
    await newUser.save();
    
    const { password, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword;
  }

  async login(email, password) {
    const user = await User.findOne({ email, password });
    if (!user) throw new Error('Credenciais INVÁLIDAS');
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async getById(id) {
    const user = await User.findOne({ id });
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async updateUser(id, updates) {
    return User.findOneAndUpdate({ id }, updates, { new: true });
  }
}

module.exports = new UserService();
