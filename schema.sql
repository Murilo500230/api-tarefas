CREATE DATABASE IF NOT EXISTS gerenciador_tarefas_db;
USE gerenciador_tarefas_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tarefas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  status ENUM('Pendente', 'Em andamento', 'Concluída') NOT NULL DEFAULT 'Pendente',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  prazo DATE,
  usuario_id INT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Dados de exemplo
INSERT INTO usuarios (nome, email) VALUES
('Murilo Bastos', 'murilo@exemplo.com'),
('Ana Souza', 'ana.souza@exemplo.com');

INSERT INTO tarefas (titulo, descricao, status, prazo, usuario_id) VALUES
('Estudar para a prova de BD', 'Revisar modelagem e normalização', 'Em andamento', '2026-08-25', 1),
('Entregar API de tarefas', 'Finalizar CRUD e README', 'Pendente', '2026-08-23', 1),
('Configurar ambiente MySQL', 'Instalar e testar conexão', 'Concluída', '2026-08-15', 2);
