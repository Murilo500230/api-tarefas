# Gerenciador de Tarefas — API REST

API REST para gerenciamento de tarefas atribuídas a usuários, desenvolvida com Node.js, Express e MySQL.

## Integrantes
- Cahuan Gomes Gonçalves
- Darlan de Jesus Malta
- Jailton dos Santos Silva Junior
- Luiz Alberto Sousa da Silva
- Murilo Bastos Ferreira

## Descrição da API
Permite cadastrar usuários, cadastrar tarefas vinculadas a um usuário responsável, consultar, atualizar, remover e alterar o status de uma tarefa (Pendente, Em andamento, Concluída). Também é possível listar as tarefas de um usuário específico e filtrar tarefas por status, além de recursos extras de busca, paginação e ordenação.

## Tecnologias utilizadas
- Node.js
- Express
- MySQL (via `mysql2`)
- dotenv

## Pré-requisitos
Antes de começar, é necessário ter instalado na máquina:
- **Node.js** (versão 18 ou superior)
- **MySQL** instalado e em execução localmente

---

## Como executar o projeto (passo a passo)

### 1. Clonar o repositório
```bash
git clone https://github.com/Murilo500230/api-tarefas.git
cd api-tarefas
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as variáveis de ambiente
Copie o arquivo de exemplo e ajuste com o usuário/senha do seu MySQL:
```bash
cp .env.example .env
```
Abra o `.env` criado e edite os valores conforme o seu ambiente:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=gerenciador_tarefas_db
PORT=3000
```

### 4. Criar o banco de dados
Execute o script `schema.sql` no MySQL. Ele cria o banco `gerenciador_tarefas_db`, as tabelas `usuarios` e `tarefas` (já relacionadas) e insere alguns dados de exemplo:
```bash
mysql -u root -p < schema.sql
```

### 5. Rodar o servidor
```bash
npm start
```
Ou, para reiniciar automaticamente a cada alteração (usando nodemon):
```bash
npm run dev
```

Se tudo deu certo, o terminal deve mostrar:
```
Servidor rodando em http://localhost:3000
```

### 6. Testar a API
Acesse `http://localhost:3000` no navegador — deve aparecer uma mensagem de boas-vindas confirmando que o servidor está no ar. Para testar os demais endpoints (POST, PUT, PATCH, DELETE), utilize uma ferramenta como **Postman** ou **Thunder Client**, apontando para `http://localhost:3000`.

---

## Modelo de dados

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
| atualizada_em | TIMESTAMP (atualizado automaticamente a cada alteração) |
| prazo | DATE |
| usuario_id | INT (FK → usuarios.id, ON DELETE CASCADE) |

---

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
| PUT | /tarefas/:id | Atualiza uma tarefa (todos os campos) |
| PATCH | /tarefas/:id/status | Altera apenas o status de uma tarefa |
| DELETE | /tarefas/:id | Remove uma tarefa |

### Exemplo — cadastrar usuário
`POST /usuarios`
```json
{
  "nome": "Murilo Bastos",
  "email": "murilo@exemplo.com"
}
```

### Exemplo — cadastrar tarefa
`POST /tarefas`
```json
{
  "titulo": "Estudar para a prova",
  "descricao": "Revisar o conteúdo de banco de dados",
  "status": "Pendente",
  "prazo": "2026-09-01",
  "usuario_id": 1
}
```

### Exemplo — atualizar tarefa (todos os campos)
`PUT /tarefas/1`
```json
{
  "titulo": "Estudar para a prova (revisado)",
  "descricao": "Revisar modelagem e normalização",
  "status": "Em andamento",
  "prazo": "2026-09-05",
  "usuario_id": 1
}
```

### Exemplo — alterar apenas o status
`PATCH /tarefas/1/status`
```json
{
  "status": "Concluída"
}
```

---

## Recursos extras (desafio adicional)

O endpoint `GET /tarefas` aceita, de forma combinável, os seguintes parâmetros de consulta:

| Parâmetro | Exemplo | O que faz |
|---|---|---|
| `status` | `?status=Pendente` | Filtra pelo status da tarefa |
| `busca` | `?busca=prova` | Busca o texto no título ou na descrição |
| `ordenar` | `?ordenar=prazo` | Ordena por `id`, `titulo`, `prazo`, `status` ou `data_criacao` |
| `direcao` | `?direcao=asc` | Direção da ordenação (`asc` ou `desc`, padrão `desc`) |
| `page` e `limit` | `?page=1&limit=10` | Pagina os resultados |

Exemplo combinando tudo:
```
GET /tarefas?status=Pendente&busca=prova&ordenar=prazo&direcao=asc&page=1&limit=5
```

Quando `page` ou `limit` são usados, a resposta vem no formato:
```json
{
  "dados": [ /* tarefas da página */ ],
  "paginacao": {
    "pagina_atual": 1,
    "itens_por_pagina": 5,
    "total_itens": 12,
    "total_paginas": 3
  }
}
```

Também foi adicionado o campo `atualizada_em`, que registra automaticamente a data/hora da última alteração de cada tarefa.

---

## Validações implementadas
- `titulo` e `usuario_id` são obrigatórios ao criar uma tarefa
- `nome` e `email` são obrigatórios ao criar um usuário, e o e-mail precisa ter formato válido e ser único
- `status` só aceita os valores `Pendente`, `Em andamento` ou `Concluída`
- Não é possível criar ou atualizar uma tarefa apontando para um `usuario_id` que não existe

## Tratamento de erros
| Código | Quando ocorre |
|---|---|
| 200 | Operação realizada com sucesso |
| 201 | Registro criado com sucesso |
| 204 | Registro removido com sucesso (sem conteúdo de resposta) |
| 400 | Dados inválidos ou incompletos |
| 404 | Tarefa, usuário ou rota não encontrados |
| 500 | Erro interno da aplicação |

---

## Estrutura do projeto
```
gerenciador-tarefas-api/
├── config/
│   └── db.js                   # Conexão com o MySQL
├── controllers/
│   ├── usuariosController.js   # Lógica de cadastro/listagem de usuários
│   └── tarefasController.js    # Lógica do CRUD de tarefas
├── routes/
│   ├── usuarios.js             # Rotas de usuários
│   └── tarefas.js              # Rotas de tarefas
├── schema.sql                  # Script de criação do banco e dados de exemplo
├── server.js                   # Arquivo principal do servidor
├── package.json
├── .env.example                # Modelo de variáveis de ambiente
└── .gitignore
```
