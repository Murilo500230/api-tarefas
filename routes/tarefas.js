const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefasController');

// Importante: a rota "/status" fica ANTES da rota "/:id" equivalente
// para o Express não confundir o parâmetro.
router.get('/', tarefasController.listarTarefas); // aceita ?status=Pendente
router.get('/:id', tarefasController.buscarTarefa);
router.post('/', tarefasController.criarTarefa);
router.put('/:id', tarefasController.atualizarTarefa);
router.patch('/:id/status', tarefasController.alterarStatus);
router.delete('/:id', tarefasController.excluirTarefa);

module.exports = router;
