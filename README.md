# Simple API

API REST de tarefas com Django REST Framework, PostgreSQL e testes automatizados.

## Executar localmente

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Sem `POSTGRES_HOST`, o projeto usa SQLite para desenvolvimento local. Para usar PostgreSQL, inicie `docker compose up -d db` e exporte as variaveis `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_HOST=localhost`.

## Endpoints

- `GET /api/tasks/` lista tarefas
- `POST /api/tasks/` cria uma tarefa
- `GET /api/tasks/<id>/` consulta uma tarefa
- `PATCH /api/tasks/<id>/` atualiza uma tarefa
- `DELETE /api/tasks/<id>/` remove uma tarefa

Exemplo de payload:

```json
{"title": "Estudar CI", "description": "Configurar o pipeline"}
```

## Qualidade e testes

```bash
black .
flake8 .
pytest
```

O workflow em `.github/workflows/ci.yml` roda em todo `push` e `pull_request`, inicia PostgreSQL como service container, verifica Black e Flake8, aplica migrations e executa os testes.
