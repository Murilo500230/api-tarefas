const express = require('express');
require('dotenv').config();

const tarefasRoutes = require('./routes/tarefas');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const PORTA = process.env.PORT || 3000;

app.use(express.json());

app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do Gerenciador de Tarefas rodando! Use /tarefas e /usuarios para acessar os endpoints.'
  });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
