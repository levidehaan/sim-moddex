<p align="center">
  <h1 align="center">🚀 SIM Moddex</h1>
</p>

<p align="center">
  <strong>Open-source AI agent workflow builder with 150+ integrations</strong>
</p>

<p align="center">
  Build, deploy, and scale agentic workflows with visual drag-and-drop canvas, MCP server support, and enterprise-ready features.
</p>

<p align="center">
  <a href="https://sim.ai" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/sim.ai-6F3DFA" alt="Sim.ai"></a>
  <a href="https://discord.gg/Hr4UWYEcTT" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Discord-Join%20Server-5865F2?logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/simdotai" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/twitter/follow/simstudioai?style=social" alt="Twitter"></a>
  <a href="https://docs.sim.ai" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Docs-6F3DFA.svg" alt="Documentation"></a>
</p>

---

## ✨ Features

### 🎨 Visual Workflow Builder
- Drag-and-drop canvas for building AI agent workflows
- 150+ pre-built blocks and integrations
- Real-time collaboration with team members
- Version control and workflow templates

### 🤖 AI-Powered Development
- **Copilot**: Generate workflows from natural language
- **Auto-fix**: Intelligent error detection and resolution
- **Smart suggestions**: Context-aware block recommendations
- **Code execution**: Sandboxed Python and JavaScript runtime

### 🔌 Extensive Integrations
- **APIs**: GitHub, Linear, Jira, Slack, Discord, Notion, Airtable
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis, Supabase
- **AI Models**: OpenAI, Anthropic, Google, Mistral, local models (llama.cpp, vLLM)
- **MCP Servers**: Model Context Protocol support with 14+ verified servers
- **Triggers**: Webhooks, schedules, API calls, chat interfaces

### 🧠 Knowledge & Memory
- Vector database integration (Pinecone, Qdrant, Supabase)
- Document upload and semantic search
- Persistent memory with knowledge graphs
- RAG (Retrieval Augmented Generation) support

### 🔒 Enterprise Ready
- Self-hosted deployment options
- SOC2 and HIPAA compliance ready
- Role-based access control
- Audit logging and monitoring

### 📱 Multi-Platform
- Web application
- Android support via Termux
- Docker deployment
- Kubernetes/Helm charts

## Quickstart

### Cloud-hosted: [sim.ai](https://sim.ai)

<a href="https://sim.ai" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/sim.ai-6F3DFA?logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iNjE2IiBoZWlnaHQ9IjYxNiIgdmlld0JveD0iMCAwIDYxNiA2MTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xMTU5XzMxMykiPgo8cGF0aCBkPSJNNjE2IDBIMFY2MTZINjE2VjBaIiBmaWxsPSIjNkYzREZBIi8+CjxwYXRoIGQ9Ik04MyAzNjUuNTY3SDExM0MxMTMgMzczLjgwNSAxMTYgMzgwLjM3MyAxMjIgMzg1LjI3MkMxMjggMzg5Ljk0OCAxMzYuMTExIDM5Mi4yODUgMTQ2LjMzMyAzOTIuMjg1QzE1Ny40NDQgMzkyLjI4NSAxNjYgMzkwLjE3MSAxNzIgMzg1LjkzOUMxNzcuOTk5IDM4MS40ODcgMTgxIDM3NS41ODYgMTgxIDM2OC4yMzlDMTgxIDM2Mi44OTUgMTc5LjMzMyAzNTguNDQyIDE3NiAzNTQuODhDMTcyLjg4OSAzNTEuMzE4IDE2Ny4xMTEgMzQ4LjQyMiAxNTguNjY3IDM0Ni4xOTZMMTMwIDMzOS41MTdDMTE1LjU1NSAzMzUuOTU1IDEwNC43NzggMzMwLjQ5OSA5Ny42NjY1IDMyMy4xNTFDOTAuNzc3NSAzMTUuODA0IDg3LjMzMzQgMzA2LjExOSA4Ny4zMzM0IDI5NC4wOTZDODcuMzMzNCAyODQuMDc2IDg5Ljg4OSAyNzUuMzkyIDk0Ljk5OTYgMjY4LjA0NUMxMDAuMzMzIDI2MC42OTcgMTA3LjU1NSAyNTUuMDIgMTE2LjY2NiAyNTEuMDEyQzEyNiAyNDcuMDA0IDEzNi42NjcgMjQ1IDE0OC42NjYgMjQ1QzE2MC42NjcgMjQ1IDE3MSAyNDcuMTE2IDE3OS42NjcgMjUxLjM0NkMxODguNTU1IDI1NS41NzYgMTk1LjQ0NCAyNjEuNDc3IDIwMC4zMzMgMjY5LjA0N0MyMDUuNDQ0IDI3Ni42MTcgMjA4LjExMSAyODUuNjM0IDIwOC4zMzMgMjk2LjA5OUgxNzguMzMzQzE3OC4xMTEgMjg3LjYzOCAxNzUuMzMzIDI4MS4wNyAxNjkuOTk5IDI3Ni4zOTRDMTY0LjY2NiAyNzEuNzE5IDE1Ny4yMjIgMjY5LjM4MSAxNDcuNjY3IDI2OS4zODFDMTM3Ljg4OSAyNjkuMzgxIDEzMC4zMzMgMjcxLjQ5NiAxMjUgMjc1LjcyNkMxMTkuNjY2IDI3OS45NTcgMTE3IDI4NS43NDYgMTE3IDI5My4wOTNDMTE3IDMwNC4wMDMgMTI1IDMxMS40NjIgMTQxIDMxNS40N0wxNjkuNjY3IDMyMi40ODNDMTgzLjQ0NSAzMjUuNiAxOTMuNzc4IDMzMC43MjIgMjAwLjY2NyAzMzcuODQ3QzIwNy41NTUgMzQ0Ljc0OSAyMTEgMzU0LjIxMiAyMTEgMzY2LjIzNUMyMTEgMzc2LjQ3NyAyMDguMjIyIDM4NS40OTQgMjAyLjY2NiAzOTMuMjg3QzE5Ny4xMTEgNDAwLjg1NyAxODkuNDQ0IDQwNi43NTggMTc5LjY2NyA0MTAuOTg5QzE3MC4xMTEgNDE0Ljk5NiAxNTguNzc4IDQxNyAxNDUuNjY3IDQxN0MxMjYuNTU1IDQxNyAxMTEuMzMzIDQxMi4zMjUgOTkuOTk5NyA0MDIuOTczQzg4LjY2NjggMzkzLjYyMSA4MyAzODEuMTUzIDgzIDM2NS41NjdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjMyLjI5MSA0MTNWMjUwLjA4MkMyNDQuNjg0IDI1NC42MTQgMjUwLjE0OCAyNTQuNjE0IDI2My4zNzEgMjUwLjA4MlY0MTNIMjMyLjI5MVpNMjQ3LjUgMjM5LjMxM0MyNDEuOTkgMjM5LjMxMyAyMzcuMTQgMjM3LjMxMyAyMzIuOTUyIDIzMy4zMTZDMjI4Ljk4NCAyMjkuMDk1IDIyNyAyMjQuMjA5IDIyNyAyMTguNjU2QzIyNyAyMTIuODgyIDIyOC45ODQgMjA3Ljk5NSAyMzIuOTUyIDIwMy45OTdDMjM3LjE0IDE5OS45OTkgMjQxLjk5IDE5OCAyNDcuNSAxOThDMjUzLjIzMSAxOTggMjU4LjA4IDE5OS45OTkgMjYyLjA0OSAyMDMuOTk3QzI2Ni4wMTYgMjA3Ljk5NSAyNjggMjEyLjg4MiAyNjggMjE4LjY1NkMyNjggMjI0LjIwOSAyNjYuMDE2IDIyOS4wOTUgMjYyLjA0OSAyMzMuMzE2QzI1OC4wOCAyMzcuMzEzIDI1My4yMzEgMjM5LjMxMyAyNDcuNSAyMzkuMzEzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTMxOS4zMzMgNDEzSDI4OFYyNDkuNjc2SDMxNlYyNzcuMjMzQzMxOS4zMzMgMjY4LjEwNCAzMjUuNzc4IDI2MC4zNjQgMzM0LjY2NyAyNTQuMzUyQzM0My43NzggMjQ4LjExNyAzNTQuNzc4IDI0NSAzNjcuNjY3IDI0NUMzODIuMTExIDI0NSAzOTQuMTEyIDI0OC44OTcgNDAzLjY2NyAyNTYuNjlDNDEzLjIyMiAyNjQuNDg0IDQxOS40NDQgMjc0LjgzNyA0MjIuMzM0IDI4Ny43NTJINDE2LjY2N0M0MTguODg5IDI3NC44MzcgNDI1IDI2NC40ODQgNDM1IDI1Ni42OUM0NDUgMjQ4Ljg5NyA0NTcuMzM0IDI0NSA0NzIgMjQ1QzQ5MC42NjYgMjQ1IDUwNS4zMzQgMjUwLjQ1NSA1MTYgMjYxLjM2NkM1MjYuNjY3IDI3Mi4yNzYgNTMyIDI4Ny4xOTUgNTMyIDMwNi4xMjFWNDEzSDUwMS4zMzNWMzEzLjgwNEM1MDEuMzMzIDMwMC44ODkgNDk4IDI5MC45ODEgNDkxLjMzMyAyODQuMDc4QzQ4NC44ODkgMjc2Ljk1MiA0NzYuMTExIDI3My4zOSA0NjUgMjczLjM5QzQ1Ny4yMjIgMjczLjM5IDQ1MC4zMzMgMjc1LjE3MSA0NDQuMzM0IDI3OC43MzRDNDM4LjU1NiAyODIuMDc0IDQzNCAyODYuOTcyIDQzMC42NjcgMjkzLjQzQzQyNy4zMzMgMjk5Ljg4NyA0MjUuNjY3IDMwNy40NTcgNDI1LjY2NyAzMTYuMTQxVjQxM0gzOTQuNjY3VjMxMy40NjlDMzk0LjY2NyAzMDAuNTU1IDM5MS40NDUgMjkwLjc1OCAzODUgMjg0LjA3OEMzNzguNTU2IDI3Ny4xNzUgMzY5Ljc3OCAyNzMuNzI0IDM1OC42NjcgMjczLjcyNEMzNTAuODg5IDI3My43MjQgMzQ0IDI3NS41MDUgMzM4IDI3OS4wNjhDMzMyLjIyMiAyODIuNDA4IDMyNy42NjcgMjg3LjMwNyAzMjQuMzMzIDI5My43NjNDMzIxIDI5OS45OTggMzE5LjMzMyAzMDcuNDU3IDMxOS4zMzMgMzE2LjE0MVY0MTNaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzExNTlfMzEzIj4KPHJlY3Qgd2lkdGg9IjYxNiIgaGVpZ2h0PSI2MTYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==&logoColor=white" alt="Sim.ai"></a>

### Self-hosted: NPM Package

```bash
npx simstudio
```
→ http://localhost:3000

#### Note
Docker must be installed and running on your machine.

#### Options

| Flag | Description |
|------|-------------|
| `-p, --port <port>` | Port to run Sim on (default `3000`) |
| `--no-pull` | Skip pulling latest Docker images |

### Self-hosted: Docker Compose

```bash
# Clone the repository
git clone https://github.com/simstudioai/sim.git

# Navigate to the project directory
cd sim

# Start Sim
docker compose -f docker-compose.prod.yml up -d
```

Access the application at [http://localhost:3000/](http://localhost:3000/)

#### Using Local Models with llama.cpp

Run Sim with local AI models using [llama.cpp](https://github.com/ggerganov/llama.cpp):

```bash
# Start llama.cpp server with a model
llama-server -m your-model.gguf --port 8080

# Or with llama-cli
llama-cli --server -m your-model.gguf --port 8080
```

Set the environment variable to point to your llama.cpp server:
```bash
LLAMACPP_BASE_URL=http://localhost:8080
LLAMACPP_API_KEY=your_optional_api_key  # Only if your server requires auth
```

When running with Docker, use `host.docker.internal` if llama.cpp is on your host machine:
```bash
# Docker Desktop (macOS/Windows)
LLAMACPP_BASE_URL=http://host.docker.internal:8080 docker compose -f docker-compose.prod.yml up -d

# Linux (use your host's IP)
LLAMACPP_BASE_URL=http://192.168.1.100:8080 docker compose -f docker-compose.prod.yml up -d
```

#### Using vLLM

Sim also supports [vLLM](https://docs.vllm.ai/) for self-hosted models with OpenAI-compatible API:

```bash
# Set these environment variables
VLLM_BASE_URL=http://your-vllm-server:8000
VLLM_API_KEY=your_optional_api_key  # Only if your vLLM instance requires auth
```

When running with Docker, use `host.docker.internal` if vLLM is on your host machine (same as llama.cpp above).

### Self-hosted: Dev Containers

1. Open VS Code with the [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the project and click "Reopen in Container" when prompted
3. Run `bun run dev:full` in the terminal or use the `sim-start` alias
   - This starts both the main application and the realtime socket server

### Self-hosted: Manual Setup

**Requirements:**
- [Bun](https://bun.sh/) runtime
- [Node.js](https://nodejs.org/) v20+ (required for sandboxed code execution)
- PostgreSQL 12+ with [pgvector extension](https://github.com/pgvector/pgvector) (required for AI embeddings)

**Note:** Sim uses vector embeddings for AI features like knowledge bases and semantic search, which requires the `pgvector` PostgreSQL extension.

1. Clone and install dependencies:

```bash
git clone https://github.com/simstudioai/sim.git
cd sim
bun install
```

2. Set up PostgreSQL with pgvector:

You need PostgreSQL with the `vector` extension for embedding support. Choose one option:

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL with pgvector extension
docker run --name simstudio-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=simstudio \
  -p 5432:5432 -d \
  pgvector/pgvector:pg17
```

**Option B: Manual Installation**
- Install PostgreSQL 12+ and the pgvector extension
- See [pgvector installation guide](https://github.com/pgvector/pgvector#installation)

3. Set up environment:

```bash
cd apps/sim
cp .env.example .env  # Configure with required variables (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL)
```

Update your `.env` file with the database URL:
```bash
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/simstudio"
```

4. Set up the database:

First, configure the database package environment:
```bash
cd packages/db
cp .env.example .env 
```

Update your `packages/db/.env` file with the database URL:
```bash
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/simstudio"
```

Then run the migrations:
```bash
cd packages/db # Required so drizzle picks correct .env file
bunx drizzle-kit migrate --config=./drizzle.config.ts
```

5. Start the development servers:

**Recommended approach - run both servers together (from project root):**

```bash
bun run dev:full
```

This starts both the main Next.js application and the realtime socket server required for full functionality.

**Alternative - run servers separately:**

Next.js app (from project root):
```bash
bun run dev
```

Realtime socket server (from `apps/sim` directory in a separate terminal):
```bash
cd apps/sim
bun run dev:sockets
```

### Self-hosted: Android (Termux)

Run SIM Moddex directly on your Android device using [Termux](https://f-droid.org/packages/com.termux/). This enables mobile workflows with access to Android sensors, notifications, GPS, and more.

**Requirements:**
- Android device (ARM64 recommended)
- [Termux](https://f-droid.org/packages/com.termux/) from F-Droid (not Play Store)
- [Termux:API](https://f-droid.org/packages/com.termux.api/) for Android integration

**One-liner install:**

```bash
curl -fsSL https://raw.githubusercontent.com/levidehaan/sim-moddex/main/scripts/termux/install.sh | bash
```

Or with wget:
```bash
wget -qO- https://raw.githubusercontent.com/levidehaan/sim-moddex/main/scripts/termux/install.sh | bash
```

The installer will:
- Install Node.js, PostgreSQL, and all dependencies
- Clone and configure the repository
- Set up the database with migrations
- Create a control menu accessible via `sim` command

**After installation:**

```bash
sim              # Open control menu
sim start        # Start the server
sim stop         # Stop the server
sim logs         # View server logs
sim open         # Open in browser
```

**Optional:** Install [Termux:Boot](https://f-droid.org/packages/com.termux.boot/) to auto-start SIM Moddex when your device boots.

**Android Integration:**
When running on Android, SIM Moddex can access device features through workflow blocks:
- 📍 GPS location and geofencing
- 📱 Device sensors (accelerometer, gyroscope, light, proximity)
- 🔔 Android notifications
- 🔋 Battery status monitoring
- 📋 Clipboard read/write
- 🔊 Text-to-speech
- 📶 WiFi scanning and status
- 📳 Vibration patterns

## Copilot API Keys

Copilot is a Sim-managed service. To use Copilot on a self-hosted instance:

- Go to https://sim.ai → Settings → Copilot and generate a Copilot API key
- Set `COPILOT_API_KEY` environment variable in your self-hosted apps/sim/.env file to that value

## Environment Variables

Key environment variables for self-hosted deployments (see `apps/sim/.env.example` for full list):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string with pgvector |
| `BETTER_AUTH_SECRET` | Yes | Auth secret (`openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | Yes | Your app URL (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL (same as above) |
| `ENCRYPTION_KEY` | Yes | Encryption key (`openssl rand -hex 32`) |
| `LLAMACPP_BASE_URL` | No | llama.cpp server URL for local models |
| `LLAMACPP_API_KEY` | No | Optional API key for llama.cpp server |
| `VLLM_BASE_URL` | No | vLLM server URL for self-hosted models |
| `COPILOT_API_KEY` | No | API key from sim.ai for Copilot features |

## Troubleshooting

### Local models not showing in dropdown (Docker)

If you're running llama.cpp or vLLM on your host machine and Sim in Docker, change the URL from `localhost` to `host.docker.internal`:

```bash
LLAMACPP_BASE_URL=http://host.docker.internal:8080 docker compose -f docker-compose.prod.yml up -d
# Or for vLLM:
VLLM_BASE_URL=http://host.docker.internal:8000 docker compose -f docker-compose.prod.yml up -d
```

See [Using Local Models with llama.cpp](#using-local-models-with-llamacpp) for details.

### Database connection issues

Ensure PostgreSQL has the pgvector extension installed. When using Docker, wait for the database to be healthy before running migrations.

### Port conflicts

If ports 3000, 3002, or 5432 are in use, configure alternatives:

```bash
# Custom ports
NEXT_PUBLIC_APP_URL=http://localhost:3100 POSTGRES_PORT=5433 docker compose up -d
```

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Runtime**: [Bun](https://bun.sh/)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [Better Auth](https://better-auth.com)
- **UI**: [Shadcn](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Flow Editor**: [ReactFlow](https://reactflow.dev/)
- **Docs**: [Fumadocs](https://fumadocs.vercel.app/)
- **Monorepo**: [Turborepo](https://turborepo.org/)
- **Realtime**: [Socket.io](https://socket.io/)
- **Background Jobs**: [Trigger.dev](https://trigger.dev/)
- **Remote Code Execution**: [E2B](https://www.e2b.dev/)

## Contributing

We welcome contributions! Please see our [Contributing Guide](.github/CONTRIBUTING.md) for details.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

<p align="center">Made with ❤️ by the SIM Moddex Team</p>
