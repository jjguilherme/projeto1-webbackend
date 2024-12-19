const fs = require('fs').promises;
const path = require('path');

class FileOperations {
  constructor(fileName) {
    // Define o caminho do arquivo onde os dados serão armazenados
    this.filePath = path.join(__dirname, '..', 'data', fileName);
  }

  // Lê o conteúdo do arquivo
  async readFile() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Caso o arquivo não exista, cria o arquivo com um array vazio
      if (error.code === 'ENOENT') {
        await this.writeFile([]);
        return [];
      }
      // Lança erro se outro tipo de falha ocorrer
      throw new Error(`Erro ao ler o arquivo: ${error.message}`);
    }
  }

  // Escreve dados no arquivo
  async writeFile(data) {
    try {
      // Cria o diretório 'data' caso não exista
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      // Escreve os dados no arquivo com formatação legível (2 espaços de indentação)
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error(`Erro ao gravar no arquivo: ${error.message}`);
    }
  }

  // Encontra um item no arquivo pelo ID
  async findById(id) {
    const data = await this.readFile();
    return data.find(item => item.id === id);
  }

  // Cria um novo item (produto) e o adiciona ao arquivo
  async create(item) {
    const data = await this.readFile();
    data.push(item);
    await this.writeFile(data);
    return item;
  }

  // Atualiza um item existente com novos dados
  async update(id, updates) {
    const data = await this.readFile();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null; // Retorna null se o item não for encontrado
    
    data[index] = { ...data[index], ...updates }; // Atualiza os dados do item
    await this.writeFile(data);
    return data[index];
  }

  // Deleta um item do arquivo pelo ID
  async delete(id) {
    const data = await this.readFile();
    const filteredData = data.filter(item => item.id !== id);
    await this.writeFile(filteredData);
  }
}

module.exports = FileOperations;
