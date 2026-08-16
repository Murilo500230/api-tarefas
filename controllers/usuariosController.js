const db = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /usuarios -> cadastra um usuário
exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ erro: 'Os campos "nome" e "email" são obrigatórios' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ erro: 'O e-mail informado não possui um formato válido' });
    }

    const [existente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(400).json({ erro: 'Já existe um usuário cadastrado com esse e-mail' });
    }

    const [resultado] = await db.query(
      'INSERT INTO usuarios (nome, email) VALUES (?, ?)',
      [nome, email]
    );

    const [novoUsuario] = await db.query('SELECT * FROM usuarios WHERE id = ?', [resultado.insertId]);
    res.status(201).json(novoUsuario[0]);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar usuário', detalhes: erro.message });
  }
};

// GET /usuarios -> lista todos os usuários
exports.listarUsuarios = async (req, res) => {
  try {
    const [usuarios] = await db.query('SELECT * FROM usuarios ORDER BY id');
    res.json(usuarios);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar usuários', detalhes: erro.message });
  }
};
