const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const tarefasController = require('../controllers/tarefasController');

router.get('/', usuariosController.listarUsuarios);
router.post('/', usuariosController.criarUsuario);

// Consulta extra: tarefas de um usuário específico
router.get('/:usuarioId/tarefas', tarefasController.listarTarefasPorUsuario);

module.exports = router;
