# Gerenciador de Tarefas — API REST

## Integrantes
- Cahuan Gomes Gonçalves
- Darlan de Jesus Malta
- Jailton dos Santos Silva Junior
- Luiz Alberto Sousa da Silva
- Murilo Bastos Ferreira

## Descrição da API
API REST para gerenciamento de tarefas atribuídas a usuários. Permite cadastrar usuários, cadastrar tarefas vinculadas a um usuário responsável, consultar, atualizar, remover, alterar o status de uma tarefa (Pendente, Em andamento, Concluída), listar as tarefas de um usuário específico e filtrar tarefas por status.

## Tecnologias utilizadas
- Node.js
- Express
- MySQL (via `mysql2`)
- dotenv

## Pré-requisitos
- Node.js (versão 18 ou superior)
- MySQL instalado e rodando localmente

## Instruções para executar o projeto

1. Instalar as dependências:
   ```bash
   npm install
   ```

2. Configurar as variáveis de ambiente — copie `.env.example` para `.env` e ajuste usuário/senha do MySQL:
   ```bash
   cp .env.example .env
   ```

3. Rodar o servidor:
   ```bash
   npm start
   ```
   (ou `npm run dev` para reiniciar automaticamente a cada alteração, usando nodemon)

   O servidor sobe em `http://localhost:3000`.

## Configuração do banco de dados

O script `schema.sql` cria o banco `gerenciador_tarefas_db`, as tabelas `usuarios` e `tarefas` (com relacionamento via `usuario_id`) e insere alguns dados de exemplo.

Para executar:
```bash
mysql -u root -p < schema.sql
```

### Modelo de dados

**usuarios**
| Campo | Tipo |
|---|---|
| id | INT (PK, auto increment) |
| nome | VARCHAR(150) |
| email | VARCHAR(150), único |

**tarefas**
| Campo | Tipo |
|---|---|
| id | INT (PK, auto increment) |
| titulo | VARCHAR(150) |
| descricao | TEXT |
| status | ENUM('Pendente', 'Em andamento', 'Concluída') |
| data_criacao | TIMESTAMP (automático) |
| prazo | DATE |
| usuario_id | INT (FK → usuarios.id) |

## Principais endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| GET | /usuarios | Lista todos os usuários |
| POST | /usuarios | Cadastra um usuário |
| GET | /usuarios/:usuarioId/tarefas | Lista as tarefas de um usuário específico |
| GET | /tarefas | Lista todas as tarefas |
| GET | /tarefas?status=Pendente | Filtra tarefas por status |
| GET | /tarefas/:id | Consulta uma tarefa específica |
| POST | /tarefas | Cadastra uma tarefa |
| PUT | /tarefas/:id | Atualiza uma tarefa |
| PATCH | /tarefas/:id/status | Altera apenas o status de uma tarefa |
| DELETE | /tarefas/:id | Remove uma tarefa |

### Exemplo — cadastrar usuário (POST /usuarios)
```json
{
  "nome": "Murilo Bastos",
  "email": "murilo@exemplo.com"
}
```

### Exemplo — cadastrar tarefa (POST /tarefas)
```json
{
  "titulo": "Estudar para a prova",
  "descricao": "Revisar o conteúdo de banco de dados",
  "status": "Pendente",
  "prazo": "2026-09-01",
  "usuario_id": 1
}
```

### Exemplo — alterar status (PATCH /tarefas/1/status)
```json
{
  "status": "Concluída"
}
```

## Validações implementadas
- `titulo` e `usuario_id` são obrigatórios ao criar uma tarefa
- `nome` e `email` são obrigatórios ao criar um usuário, e o e-mail precisa ter formato válido e ser único
- `status` só aceita os valores `Pendente`, `Em andamento` ou `Concluída`
- Não é possível criar uma tarefa apontando para um `usuario_id` que não existe

## Tratamento de erros
- `400` — dados inválidos ou incompletos
- `404` — tarefa, usuário ou rota não encontrados
- `500` — erro interno da aplicação

## Estrutura do projeto
```
gerenciador-tarefas-api/
├── config/
│   └── db.js
├── controllers/
│   ├── usuariosController.js
│   └── tarefasController.js
├── routes/
│   ├── usuarios.js
│   └── tarefas.js
├── schema.sql
├── server.js
├── package.json
└── .env.example
```
