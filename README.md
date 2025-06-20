# Prompt Vault

A local-first web application for storing, organizing, and searching your LLM prompts. Built with React, FastAPI, and PostgreSQL.

## Features

- 🔍 **Full-text search** across prompt titles, content, and tags
- 🏷️ **Flexible tagging system** with autocomplete
- 📝 **Rich text editing** for prompt content
- 🎨 **Modern, responsive UI** built with React
- 🐳 **Dockerized deployment** with docker-compose
- 💾 **Persistent data storage** with PostgreSQL

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PromptVault
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Project Structure
```
PromptVault/
├── frontend/          # React frontend application
├── backend/           # FastAPI backend application
├── database/          # Database initialization scripts
└── docker-compose.yml # Docker orchestration
```

### Local Development

**Frontend (React + Vite)**
```bash
cd frontend
npm install
npm run dev
```

**Backend (FastAPI)**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Database**
```bash
docker run --name promptvault-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=promptvault -e POSTGRES_USER=promptvault -p 5432:5432 -d postgres:15-alpine
```

## API Endpoints

- `GET /api/prompts` - List all prompts with optional search and filtering
- `POST /api/prompts` - Create a new prompt
- `GET /api/prompts/{id}` - Get a specific prompt
- `PUT /api/prompts/{id}` - Update a prompt
- `DELETE /api/prompts/{id}` - Delete a prompt
- `GET /api/tags` - Get all available tags

## Environment Variables

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 