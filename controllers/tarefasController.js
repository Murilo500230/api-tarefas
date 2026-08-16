const db = require('../config/db');

const STATUS_VALIDOS = ['Pendente', 'Em andamento', 'Concluída'];

async function usuarioExiste(usuarioId) {
  const [usuarios] = await db.query('SELECT id FROM usuarios WHERE id = ?', [usuarioId]);
  return usuarios.length > 0;
}

// GET /tarefas -> lista todas as tarefas (aceita ?status= para filtrar)
exports.listarTarefas = async (req, res) => {
  try {
    const { status } = req.query;

    if (status) {
      if (!STATUS_VALIDOS.includes(status)) {
        return res.status(400).json({
          erro: `Status inválido. Use um dos valores: ${STATUS_VALIDOS.join(', ')}`
        });
      }
      const [tarefas] = await db.query(
        'SELECT * FROM tarefas WHERE status = ? ORDER BY id DESC',
        [status]
      );
      return res.json(tarefas);
    }

    const [tarefas] = await db.query('SELECT * FROM tarefas ORDER BY id DESC');
    res.json(tarefas);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar tarefas', detalhes: erro.message });
  }
};

// GET /tarefas/:id -> busca uma tarefa específica
exports.buscarTarefa = async (req, res) => {
  try {
    const { id } = req.params;
    const [tarefas] = await db.query('SELECT * FROM tarefas WHERE id = ?', [id]);

    if (tarefas.length === 0) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    res.json(tarefas[0]);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar tarefa', detalhes: erro.message });
  }
};

// GET /usuarios/:usuarioId/tarefas -> lista as tarefas de um usuário específico
exports.listarTarefasPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    if (!(await usuarioExiste(usuarioId))) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const [tarefas] = await db.query(
      'SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY id DESC',
      [usuarioId]
    );
    res.json(tarefas);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar tarefas do usuário', detalhes: erro.message });
  }
};

// POST /tarefas -> cria uma nova tarefa
exports.criarTarefa = async (req, res) => {
  try {
    const { titulo, descricao, status, prazo, usuario_id } = req.body;

    if (!titulo || !usuario_id) {
      return res.status(400).json({ erro: 'Os campos "titulo" e "usuario_id" são obrigatórios' });
    }

    if (status && !STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({
        erro: `Status inválido. Use um dos valores: ${STATUS_VALIDOS.join(', ')}`
      });
    }

    if (!(await usuarioExiste(usuario_id))) {
      return res.status(400).json({ erro: 'O usuário informado em "usuario_id" não existe' });
    }

    const [resultado] = await db.query(
      'INSERT INTO tarefas (titulo, descricao, status, prazo, usuario_id) VALUES (?, ?, ?, ?, ?)',
      [titulo, descricao || null, status || 'Pendente', prazo || null, usuario_id]
    );

    const [novaTarefa] = await db.query('SELECT * FROM tarefas WHERE id = ?', [resultado.insertId]);
    res.status(201).json(novaTarefa[0]);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar tarefa', detalhes: erro.message });
  }
};

// PUT /tarefas/:id -> atualiza uma tarefa existente
exports.atualizarTarefa = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, status, prazo, usuario_id } = req.body;

    const [existente] = await db.query('SELECT * FROM tarefas WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    if (status && !STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({
        erro: `Status inválido. Use um dos valores: ${STATUS_VALIDOS.join(', ')}`
      });
    }

    if (usuario_id && !(await usuarioExiste(usuario_id))) {
      return res.status(400).json({ erro: 'O usuário informado em "usuario_id" não existe' });
    }

    await db.query(
      'UPDATE tarefas SET titulo = ?, descricao = ?, status = ?, prazo = ?, usuario_id = ? WHERE id = ?',
      [
        titulo ?? existente[0].titulo,
        descricao ?? existente[0].descricao,
        status ?? existente[0].status,
        prazo ?? existente[0].prazo,
        usuario_id ?? existente[0].usuario_id,
        id
      ]
    );

    const [atualizada] = await db.query('SELECT * FROM tarefas WHERE id = ?', [id]);
    res.json(atualizada[0]);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar tarefa', detalhes: erro.message });
  }
};

// PATCH /tarefas/:id/status -> altera somente o status da tarefa
exports.alterarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ erro: 'O campo "status" é obrigatório' });
    }

    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({
        erro: `Status inválido. Use um dos valores: ${STATUS_VALIDOS.join(', ')}`
      });
    }

    const [existente] = await db.query('SELECT * FROM tarefas WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    await db.query('UPDATE tarefas SET status = ? WHERE id = ?', [status, id]);

    const [atualizada] = await db.query('SELECT * FROM tarefas WHERE id = ?', [id]);
    res.json(atualizada[0]);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao alterar status da tarefa', detalhes: erro.message });
  }
};

// DELETE /tarefas/:id -> remove uma tarefa
exports.excluirTarefa = async (req, res) => {
  try {
    const { id } = req.params;

    const [existente] = await db.query('SELECT * FROM tarefas WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    await db.query('DELETE FROM tarefas WHERE id = ?', [id]);
    res.status(204).send();
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao excluir tarefa', detalhes: erro.message });
  }
};
