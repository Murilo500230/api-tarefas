const db = require('../config/db');

const STATUS_VALIDOS = ['Pendente', 'Em andamento', 'Concluída'];

async function usuarioExiste(usuarioId) {
  const [usuarios] = await db.query('SELECT id FROM usuarios WHERE id = ?', [usuarioId]);
  return usuarios.length > 0;
}

const CAMPOS_ORDENACAO_VALIDOS = ['id', 'titulo', 'prazo', 'status', 'data_criacao'];

// GET /tarefas -> lista tarefas, com suporte a:
//   ?status=Pendente          filtra por status
//   ?busca=texto              busca no título ou na descrição
//   ?ordenar=prazo&direcao=asc  ordena pelo campo informado (padrão: id desc)
//   ?page=1&limit=10          pagina os resultados
exports.listarTarefas = async (req, res) => {
  try {
    const { status, busca, ordenar, direcao, page, limit } = req.query;

    const condicoes = [];
    const valores = [];

    if (status) {
      if (!STATUS_VALIDOS.includes(status)) {
        return res.status(400).json({
          erro: `Status inválido. Use um dos valores: ${STATUS_VALIDOS.join(', ')}`
        });
      }
      condicoes.push('status = ?');
      valores.push(status);
    }

    if (busca) {
      condicoes.push('(titulo LIKE ? OR descricao LIKE ?)');
      valores.push(`%${busca}%`, `%${busca}%`);
    }

    let campoOrdenacao = 'id';
    if (ordenar) {
      if (!CAMPOS_ORDENACAO_VALIDOS.includes(ordenar)) {
        return res.status(400).json({
          erro: `Campo de ordenação inválido. Use um dos valores: ${CAMPOS_ORDENACAO_VALIDOS.join(', ')}`
        });
      }
      campoOrdenacao = ordenar;
    }

    const direcaoOrdenacao = direcao && direcao.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    let sql = 'SELECT * FROM tarefas';
    if (condicoes.length > 0) {
      sql += ' WHERE ' + condicoes.join(' AND ');
    }
    sql += ` ORDER BY ${campoOrdenacao} ${direcaoOrdenacao}`;

    if (page || limit) {
      const paginaAtual = Math.max(parseInt(page) || 1, 1);
      const itensPorPagina = Math.max(parseInt(limit) || 10, 1);
      const offset = (paginaAtual - 1) * itensPorPagina;

      let sqlContagem = 'SELECT COUNT(*) AS total FROM tarefas';
      if (condicoes.length > 0) {
        sqlContagem += ' WHERE ' + condicoes.join(' AND ');
      }
      const [[{ total }]] = await db.query(sqlContagem, valores);

      const sqlPaginada = sql + ' LIMIT ? OFFSET ?';
      const valoresPaginados = [...valores, itensPorPagina, offset];
      const [tarefas] = await db.query(sqlPaginada, valoresPaginados);

      return res.json({
        dados: tarefas,
        paginacao: {
          pagina_atual: paginaAtual,
          itens_por_pagina: itensPorPagina,
          total_itens: total,
          total_paginas: Math.ceil(total / itensPorPagina)
        }
      });
    }

    const [tarefas] = await db.query(sql, valores);
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