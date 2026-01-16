<p align="center">
  <h1 align="center">🚀 SIM Moddex</h1>
</p>

<p align="center">
  <strong>Open-source AI agent workflow builder with 150+ integrations</strong>
</p>

<p align="center">
  Build, deploy, and scale agentic workflows with visual drag-and-drop canvas, advanced MCP 2026 server support, ComfyUI integration, and enterprise-ready features.
</p>

For questions about this mod, contact @levidehaan on twitter.

---

## 🙏 Attribution

**SIM Moddex** is a heavily modified fork of the original [SIM Studio](https://github.com/simstudioai/sim) project.
<p align="center">
  <a href="https://sim.ai" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/sim.ai-6F3DFA" alt="Sim.ai"></a>
  <a href="https://discord.gg/Hr4UWYEcTT" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Discord-Join%20Server-5865F2?logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/simdotai" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/twitter/follow/simstudioai?style=social" alt="Twitter"></a>
  <a href="https://docs.sim.ai" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Docs-6F3DFA.svg" alt="Documentation"></a>
</p>

We are deeply grateful to the SIM Studio team for creating the foundational open-source AI agent workflow builder that made this project possible. All original work and credit belongs to the [SIM Studio team](https://github.com/simstudioai).

This fork is a **total rebuild** with extensive new functionality including MCP 2026 server management, OAuth provider integration, ComfyUI workflows, enhanced Kafka processing, advanced image generation, and 27+ new integration blocks.

---

## 📚 Table of Contents

- [What's New in This Fork](#-whats-new-in-this-fork)
- [OAuth Provider Setup](#-oauth-provider-setup)
- [MCP 2026 Server Integration](#-mcp-2026-server-integration)
- [Features](#-features)
- [New Integrations](#-sim-moddex-additions)
- [Requirements](#️-requirements)
- [Quickstart](#-quickstart)
- [Advanced Guides](#-advanced-guides)
- [Environment Variables](#-environment-variables)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🆕 What's New in This Fork

This is a **complete rebuild** of SIM Studio with massive new capabilities:

### 🔐 Self-Hosted OAuth Integration
- **25+ OAuth providers** ready to configure for self-hosted deployments
- Complete setup guides for Google, Microsoft, GitHub, Slack, and more
- Detailed difficulty ratings and time estimates for each provider
- See [OAuth Provider Setup](#-oauth-provider-setup) below

### 🤖 MCP 2026 Server Management
- **14+ pre-configured MCP servers** with one-click installation
- Support for NPM, Python, Node.js, and remote servers
- Built-in repository browser with search and filtering
- Auto-deploy and auto-restart capabilities
- Dynamic configuration forms
- See [MCP 2026 Integration](#-mcp-2026-server-integration) below

### 🎨 ComfyUI Integration
- Full ComfyUI workflow support for advanced image generation
- Queue prompts, upload images, monitor generation
- System stats and resource monitoring
- See [ComfyUI Integration Guide](COMFYUI_INTEGRATION.md)

### 📊 Enhanced Kafka Processing
- Advanced field extraction from Kafka messages
- Mathematical and text transformations
- Real-time aggregations (sum, avg, min, max, count)
- JavaScript-based message filtering
- See [Kafka Enhanced Guide](KAFKA_ENHANCED_GUIDE.md)

### 🖼️ Advanced Image Generation
- **Text-to-Image** - Generate from descriptions
- **Image-to-Image** - Modify existing images with AI
- **Image+Text Reference** - Use images as style references
- Support for Flux, Gemini, DALL-E, and more
- See [Image Generation Guide](IMAGE_GENERATION_GUIDE.md)

### 📈 27+ New Integration Blocks
- Trading: Alpaca, Webull, CoinGecko, DeFi Llama, Finnhub, FRED
- Weather: Open-Meteo, National Weather Service, USGS Earthquake
- Government: Congress.gov, OpenFDA
- E-Commerce: Best Buy, Kroger
- Media: ComfyUI, TMDB, Hacker News
- Smart Home: Home Assistant, Ntfy
- Transportation: OpenSky Network
- Security: Shodan
- And more...

---

## 🔐 OAuth Provider Setup

For **self-hosted deployments**, you'll need to configure OAuth providers for integrations like Google, Microsoft, GitHub, Slack, and more.

### Quick Start Guide

We provide **two comprehensive guides** to help you set up OAuth providers:

#### 📖 [Self-Hosted OAuth Setup Guide](docs/SELF_HOSTED_OAUTH_SETUP.md)
Complete step-by-step instructions for configuring 25+ OAuth providers including:
- Google (Gmail, Drive, Docs, Sheets, Calendar)
- Microsoft (Outlook, OneDrive, Teams, SharePoint)
- GitHub, Slack, Notion, Linear, Airtable
- Atlassian (Jira, Confluence)
- And 15+ more providers

#### 🎯 [OAuth Provider Reality Check](docs/OAUTH_PROVIDER_REALITY_CHECK.md)
Honest, practical information about OAuth setup including:
- **Difficulty ratings** for each provider (Easy/Medium/Hard)
- **Time estimates** for setup
- **Cost information** (most are free!)
- **Approval requirements** and waiting times
- **Local development tips** for testing
- **Minimum viable setup** recommendations

### Provider Difficulty Overview

| Difficulty | Providers | Setup Time |
|------------|-----------|------------|
| **Very Easy** | GitHub, Linear | 5 minutes |
| **Easy** | Google, Microsoft, Slack, Notion, Airtable, Asana, HubSpot, Dropbox | 10-15 minutes |
| **Medium** | Atlassian, Salesforce, Shopify, Zoom, Reddit, Pipedrive, Webflow | 15-30 minutes |
| **Hard** | LinkedIn, X/Twitter, Spotify, Wealthbox | 30+ minutes or $$$ |

### Recommended Setup Order

**Phase 1 - Easy Wins (30 minutes):**
1. GitHub (5 min)
2. Google (10 min)
3. Slack (5 min)
4. Notion (5 min)
5. Linear (5 min)

**Phase 2 - Useful Additions (1 hour):**
- Microsoft, Airtable, Dropbox, Asana, HubSpot

**Phase 3 - As Needed:**
- Atlassian (Jira/Confluence), Salesforce, Zoom

### Environment Variables

All OAuth credentials are configured via environment variables. See the [Environment Variables](#-environment-variables) section below for the complete list.

For detailed setup instructions, see:
- **[docs/SELF_HOSTED_OAUTH_SETUP.md](docs/SELF_HOSTED_OAUTH_SETUP.md)** - Step-by-step guides
- **[docs/OAUTH_PROVIDER_REALITY_CHECK.md](docs/OAUTH_PROVIDER_REALITY_CHECK.md)** - Practical tips and reality check

---

## 🤖 MCP 2026 Server Integration

SIM Moddex includes **comprehensive MCP (Model Context Protocol) 2026 support** with a built-in server repository, launcher, and management system.

### What's New in MCP 2026

- ✅ **14+ Pre-configured Servers** - One-click installation from repository
- ✅ **Multiple Server Types** - NPM, Python, Node.js, Docker, Remote HTTP
- ✅ **Repository Browser** - Search, filter, and install servers
- ✅ **Dynamic Configuration** - Auto-generated forms for server setup
- ✅ **Auto-Deploy** - Servers launch automatically on workspace load
- ✅ **Process Management** - Start, stop, restart, monitor servers
- ✅ **Security & Sandboxing** - Filesystem and network restrictions
- ✅ **Health Monitoring** - Auto-restart on failure

### Available MCP Servers

| Server | Category | Description |
|--------|----------|-------------|
| **Filesystem** | File System | File operations (read, write, search) |
| **GitHub** | Development | Repository management, issues, PRs |
| **PostgreSQL** | Database | Database queries and management |
| **Brave Search** | Search | Web search capabilities |
| **Google Drive** | Cloud Storage | Cloud storage access |
| **Slack** | Communication | Team communication integration |
| **Memory** | AI/ML | Knowledge graph and memory management |
| **Puppeteer** | Automation | Browser automation and scraping |
| **Sequential Thinking** | AI/ML | Problem-solving workflows |
| **Fetch** | Network | HTTP requests and API calls |
| **SQLite** | Database | Local database operations |
| **Google Maps** | Location | Location and mapping services |
| **Everything** | File System | Windows file search |
| **AWS KB Retrieval** | AI/ML | Bedrock knowledge base integration |

### How to Use

1. **Open Settings** → Tools → MCP
2. **Click "Repository"** button to browse available servers
3. **Search or filter** by category
4. **Click "Install"** on any server
5. **Configure** using the auto-generated form
6. **Server launches automatically** and is ready to use

### Documentation

For complete MCP 2026 documentation, see:
- **[WHAT_CHANGED_MCP.md](WHAT_CHANGED_MCP.md)** - Quick overview of changes
- **[MCP_2026_UPGRADE_GUIDE.md](MCP_2026_UPGRADE_GUIDE.md)** - Comprehensive upgrade guide
- **[MCP_2026_IMPLEMENTATION_SUMMARY.md](MCP_2026_IMPLEMENTATION_SUMMARY.md)** - Implementation details

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
- **APIs**: GitHub, Linear, Jira, Slack, Discord, Notion, Airtable, and 25+ OAuth providers
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis, Supabase, SQLite
- **AI Models**: OpenAI, Anthropic, Google, Mistral, local models (llama.cpp, vLLM)
- **MCP Servers**: Model Context Protocol 2026 support with 14+ verified servers
- **Image Generation**: ComfyUI, Flux, DALL-E, Gemini, Stable Diffusion
- **Triggers**: Webhooks, schedules, API calls, chat interfaces, Kafka streams

### 🧠 Knowledge & Memory
- Vector database integration (Pinecone, Qdrant, Supabase)
- Document upload and semantic search
- Persistent memory with knowledge graphs
- RAG (Retrieval Augmented Generation) support
- MCP Memory server for persistent knowledge

## 🆕 SIM Moddex Additions

This fork includes extensive enhancements beyond the original SIM Studio:

### 🚀 MCP Server Integration
- **Built-in MCP Server Launcher**: Install and manage MCP servers directly from the UI
- **14+ Verified MCP Servers**: Filesystem, Git, Memory, Puppeteer, GitHub, PostgreSQL, and more
- **Stdio Transport Support**: Run local MCP servers with automatic process management
- **Repository Browser**: Browse and install MCP servers with one click

### 📈 Trading & Finance Integrations
- **Alpaca Trading**: Real-time stock/options data, order execution, portfolio management
- **Alpaca Scanner**: Advanced stock scanning with technical indicators
- **Alpaca Price Triggers**: Monitor stock/option prices and trigger workflows
- **Webull Trading**: Stock/options data and price monitoring
- **Webull Price Triggers**: Real-time price alerts and automation
- **CoinGecko**: Cryptocurrency market data and price tracking
- **DeFi Llama**: DeFi protocol analytics and TVL data
- **Finnhub**: Stock market data, news, and financial metrics
- **FRED**: Federal Reserve Economic Data integration

### 🌤️ Weather & Environmental Data
- **Open-Meteo**: Comprehensive weather forecasting and historical data
- **National Weather Service (NWS)**: Official US weather alerts and forecasts
- **USGS Earthquake**: Real-time earthquake data and monitoring

### 🏛️ Government & Public Data
- **Congress.gov**: US Congressional bills, votes, and legislative data
- **OpenFDA**: FDA drug, device, and food recall information

### 🛒 E-Commerce & Retail
- **Best Buy**: Product search, pricing, and availability
- **Kroger**: Grocery product data and store information

### 🎨 Media & Content
- **ComfyUI**: Advanced AI image generation workflows
- **Image Processing**: Built-in image manipulation and transformation
- **TMDB**: Movie and TV show database integration
- **Hacker News**: Tech news aggregation and monitoring

### 🏠 Smart Home & IoT
- **Home Assistant**: Smart home device control and automation
- **Ntfy**: Push notification service integration

### ✈️ Transportation & Travel
- **OpenSky Network**: Real-time flight tracking and aviation data

### 🔒 Security & Research
- **Shodan**: Internet-connected device search and security research

### 🔒 Security & Research
- **Shodan**: Internet-connected device search and security research

### ⚡ New Triggers
- **Kafka Trigger**: Advanced buffering, schema discovery, and JSON path filtering
- **Pushover Trigger**: Real-time notification monitoring with text/priority filtering and device support

### 🛠️ Utility Blocks
- **Math Operations**: Advanced mathematical calculations
- **JSON Transform**: Complex JSON data manipulation and transformation
- **Enhanced Kafka**: Improved Kafka integration with better consumer management
- **Enhanced DateTime**: Advanced date/time operations and formatting

### 📊 Total New Integrations
- **27+ new blocks** added to the original platform
- **150+ total integrations** including original SIM Studio blocks
- **Real-time triggers** for trading, weather, and data monitoring
- **Enhanced API coverage** across finance, government, weather, and more

## ⚙️ Requirements

### OpenRouter.ai Account
**SIM Moddex requires an [OpenRouter.ai](https://openrouter.ai) account** for AI model access. You'll need to:
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Generate an API key
3. Configure it in your environment variables

**Note**: If you prefer not to use OpenRouter, you'll need to modify the codebase to use alternative AI providers (OpenAI, Anthropic, etc.).

### Local Model Support (Experimental)
SIM Moddex includes support for local AI models via:
- **llama.cpp server** - Run local GGUF models
- **vLLM** - High-performance inference server

⚠️ **These features have not been fully tested yet.** Use at your own risk and expect potential issues.

## Quickstart

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
git clone https://github.com/levidehaan/sim-moddex.git

# Navigate to the project directory
cd sim-moddex

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
git clone https://github.com/levidehaan/sim-moddex.git
cd sim-moddex
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

### Core Application

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string with pgvector |
| `BETTER_AUTH_SECRET` | Yes | Auth secret (`openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | Yes | Your app URL (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL (same as above) |
| `ENCRYPTION_KEY` | Yes | Encryption key (`openssl rand -hex 32`) |

### AI Models

| Variable | Required | Description |
|----------|----------|-------------|
| `LLAMACPP_BASE_URL` | No | llama.cpp server URL for local models |
| `LLAMACPP_API_KEY` | No | Optional API key for llama.cpp server |
| `VLLM_BASE_URL` | No | vLLM server URL for self-hosted models |
| `COPILOT_API_KEY` | No | API key from sim.ai for Copilot features |

### OAuth Providers (Tier 1 - Easy Setup)

| Variable | Provider | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub | GitHub OAuth client secret |
| `SLACK_CLIENT_ID` | Slack | Slack OAuth client ID |
| `SLACK_CLIENT_SECRET` | Slack | Slack OAuth client secret |
| `NOTION_CLIENT_ID` | Notion | Notion OAuth client ID |
| `NOTION_CLIENT_SECRET` | Notion | Notion OAuth client secret |
| `LINEAR_CLIENT_ID` | Linear | Linear OAuth client ID |
| `LINEAR_CLIENT_SECRET` | Linear | Linear OAuth client secret |
| `AIRTABLE_CLIENT_ID` | Airtable | Airtable OAuth client ID |
| `AIRTABLE_CLIENT_SECRET` | Airtable | Airtable OAuth client secret |
| `ASANA_CLIENT_ID` | Asana | Asana OAuth client ID |
| `ASANA_CLIENT_SECRET` | Asana | Asana OAuth client secret |

### OAuth Providers (Tier 2 - Moderate Setup)

| Variable | Provider | Description |
|----------|----------|-------------|
| `MICROSOFT_CLIENT_ID` | Microsoft | Microsoft OAuth client ID |
| `MICROSOFT_CLIENT_SECRET` | Microsoft | Microsoft OAuth client secret |
| `JIRA_CLIENT_ID` | Jira | Jira OAuth client ID |
| `JIRA_CLIENT_SECRET` | Jira | Jira OAuth client secret |
| `CONFLUENCE_CLIENT_ID` | Confluence | Confluence OAuth client ID |
| `CONFLUENCE_CLIENT_SECRET` | Confluence | Confluence OAuth client secret |
| `HUBSPOT_CLIENT_ID` | HubSpot | HubSpot OAuth client ID |
| `HUBSPOT_CLIENT_SECRET` | HubSpot | HubSpot OAuth client secret |
| `SALESFORCE_CLIENT_ID` | Salesforce | Salesforce OAuth client ID |
| `SALESFORCE_CLIENT_SECRET` | Salesforce | Salesforce OAuth client secret |
| `DROPBOX_CLIENT_ID` | Dropbox | Dropbox OAuth client ID |
| `DROPBOX_CLIENT_SECRET` | Dropbox | Dropbox OAuth client secret |
| `SHOPIFY_CLIENT_ID` | Shopify | Shopify OAuth client ID |
| `SHOPIFY_CLIENT_SECRET` | Shopify | Shopify OAuth client secret |
| `ZOOM_CLIENT_ID` | Zoom | Zoom OAuth client ID |
| `ZOOM_CLIENT_SECRET` | Zoom | Zoom OAuth client secret |
| `REDDIT_CLIENT_ID` | Reddit | Reddit OAuth client ID |
| `REDDIT_CLIENT_SECRET` | Reddit | Reddit OAuth client secret |
| `PIPEDRIVE_CLIENT_ID` | Pipedrive | Pipedrive OAuth client ID |
| `PIPEDRIVE_CLIENT_SECRET` | Pipedrive | Pipedrive OAuth client secret |
| `WEBFLOW_CLIENT_ID` | Webflow | Webflow OAuth client ID |
| `WEBFLOW_CLIENT_SECRET` | Webflow | Webflow OAuth client secret |

### OAuth Providers (Tier 3 - Challenging)

| Variable | Provider | Description |
|----------|----------|-------------|
| `X_CLIENT_ID` | X/Twitter | X OAuth client ID |
| `X_CLIENT_SECRET` | X/Twitter | X OAuth client secret |
| `LINKEDIN_CLIENT_ID` | LinkedIn | LinkedIn OAuth client ID |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn | LinkedIn OAuth client secret |
| `SPOTIFY_CLIENT_ID` | Spotify | Spotify OAuth client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify | Spotify OAuth client secret |
| `WORDPRESS_CLIENT_ID` | WordPress | WordPress OAuth client ID |
| `WORDPRESS_CLIENT_SECRET` | WordPress | WordPress OAuth client secret |
| `WEALTHBOX_CLIENT_ID` | Wealthbox | Wealthbox OAuth client ID |
| `WEALTHBOX_CLIENT_SECRET` | Wealthbox | Wealthbox OAuth client secret |

For complete OAuth setup instructions, see:
- **[docs/SELF_HOSTED_OAUTH_SETUP.md](docs/SELF_HOSTED_OAUTH_SETUP.md)** - Detailed setup guides
- **[docs/OAUTH_PROVIDER_REALITY_CHECK.md](docs/OAUTH_PROVIDER_REALITY_CHECK.md)** - Practical tips and difficulty ratings

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

## 📖 Advanced Guides

SIM Moddex includes comprehensive documentation for all major features:

### OAuth & Authentication
- **[Self-Hosted OAuth Setup Guide](docs/SELF_HOSTED_OAUTH_SETUP.md)** - Step-by-step OAuth provider configuration for 25+ services
- **[OAuth Provider Reality Check](docs/OAUTH_PROVIDER_REALITY_CHECK.md)** - Practical guide with difficulty ratings, costs, and time estimates

### MCP Server Integration
- **[What Changed - MCP 2026](WHAT_CHANGED_MCP.md)** - Quick overview of MCP 2026 changes and new features
- **[MCP 2026 Upgrade Guide](MCP_2026_UPGRADE_GUIDE.md)** - Comprehensive guide to MCP 2026 features and usage
- **[MCP 2026 Implementation Summary](MCP_2026_IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

### Image Generation & Processing
- **[ComfyUI Integration Guide](COMFYUI_INTEGRATION.md)** - Complete guide to ComfyUI workflow integration
- **[Image Generation Guide](IMAGE_GENERATION_GUIDE.md)** - Text-to-Image, Image-to-Image, and reference-based generation

### Data Processing
- **[Kafka Enhanced Guide](KAFKA_ENHANCED_GUIDE.md)** - Advanced Kafka message processing with extraction, transformation, and aggregation

### Additional Documentation
- **[ADDITIONS.md](ADDITIONS.md)** - Complete list of all new blocks and integrations
- **[CLAUDE.md](CLAUDE.md)** - Claude-specific integration notes

---

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
