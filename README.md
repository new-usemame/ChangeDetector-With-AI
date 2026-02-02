# AI-Enhanced Price Tracker

A full-stack price monitoring solution combining [changedetection.io](https://changedetection.io) with AI-powered extraction. Monitor any product page and get intelligent notifications when prices drop.

## Features

- **Visual Web GUI** - Easy-to-use interface from changedetection.io
- **AI Price Extraction** - Finds prices without brittle CSS selectors
- **Smart Notifications** - Filters out false positives (ads, timestamps)
- **Auto-Healing Selectors** - AI repairs broken selectors automatically
- **JavaScript Support** - Handles dynamic sites via Playwright browser
- **Multi-Site Support** - Works on any e-commerce site

## Quick Start (Docker Compose)

### 1. Clone and configure

```bash
git clone https://github.com/new-usemame/ChangeDetector-With-AI.git
cd ChangeDetector-With-AI

# Copy and edit environment file
cp env.example .env
```

### 2. Add your OpenRouter API key

Edit `.env` and add your API key from [openrouter.ai/keys](https://openrouter.ai/keys):

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 3. Start the stack

```bash
docker-compose up -d
```

### 4. Access the UI

Open **http://localhost:5000** in your browser.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Browser                              │
│                    http://localhost:5000                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│              changedetection.io (Port 5000)                      │
│  • Web UI for managing watches                                   │
│  • Scheduling & notifications                                    │
│  • Stores watch history                                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
┌─────────▼─────────┐         ┌──────────▼──────────┐
│  Playwright       │         │  AI Wrapper         │
│  (Headless Chrome)│         │  (Port 3000)        │
│  • Renders JS     │         │  • Price extraction │
│  • Screenshots    │         │  • Selector repair  │
└───────────────────┘         │  • False positive   │
                              │    filtering        │
                              └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │  OpenRouter API     │
                              │  • GPT-4o-mini      │
                              │  • Claude           │
                              │  • Other LLMs       │
                              └─────────────────────┘
```

## How to Use

### Adding a Price Watch

1. Open **http://localhost:5000**
2. Click **"Add Watch"** or **"Edit" → "Watches"**
3. Enter the product URL you want to monitor
4. Click **"Watch"**

### Configuring AI-Enhanced Extraction

For each watch, you can configure it to use the AI wrapper:

1. Click on a watch to edit it
2. Go to **"Notifications"** tab
3. Add a webhook notification pointing to:
   ```
   http://ai-wrapper:3000/webhook/changedetection
   ```
4. The AI will process each change and extract price data

### Using AI Price Extraction Directly

You can also call the AI wrapper API directly:

```bash
# Extract price from HTML
curl -X POST http://localhost:3000/extract-price \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><span class=\"price\">$29.99</span></body></html>",
    "url": "https://example.com/product"
  }'

# Response:
{
  "price": "29.99",
  "currency": "USD",
  "productName": "Product Name",
  "available": true,
  "confidence": 0.95
}
```

## Railway Deployment

To deploy on Railway:

### Option 1: Deploy Both Services

1. **Deploy AI Wrapper** (already done):
   - Your service at: `https://your-ai-wrapper.railway.app`

2. **Deploy changedetection.io**:
   - Create new Railway project
   - Use Docker image: `ghcr.io/dgtlmoon/changedetection.io:latest`
   - Add volume for `/datastore`
   - Set `BASE_URL` to your Railway URL

3. **Connect them**:
   - In changedetection.io, configure webhook URL to your AI wrapper

### Option 2: Use Docker Compose on a VPS

```bash
# On your VPS
git clone https://github.com/new-usemame/ChangeDetector-With-AI.git
cd ChangeDetector-With-AI
cp .env.docker .env
# Edit .env with your OPENROUTER_API_KEY
docker-compose up -d
```

## API Endpoints (AI Wrapper)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/extract-price` | POST | Extract price from HTML using AI |
| `/validate-change` | POST | Check if a change is real or noise |
| `/repair-selector` | POST | Generate new selector when old breaks |
| `/match-product` | POST | Match products across URL changes |
| `/webhook/changedetection` | POST | Webhook for changedetection.io |
| `/webhook/price-check` | POST | Simple price check endpoint |
| `/health` | GET | Health check |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key | Required |
| `OPENROUTER_MODEL` | LLM model to use | `openai/gpt-4o-mini` |
| `PORT` | AI wrapper port | `3000` |
| `CHANGEDETECTION_URL` | Public URL for changedetection.io | `http://localhost:5000` |

## Services

| Service | Port | Description |
|---------|------|-------------|
| changedetection.io | 5000 | Main web UI |
| AI Wrapper | 3000 | AI extraction API |
| Playwright Chrome | - | Headless browser (internal) |

## Troubleshooting

### "No price found"
- The page might need JavaScript rendering
- In changedetection.io, enable "Fetch with Browser" for that watch

### Webhook not working
- Ensure AI wrapper is running: `curl http://localhost:3000/health`
- Check logs: `docker-compose logs ai-wrapper`

### High API costs
- Switch to a cheaper model: `OPENROUTER_MODEL=openai/gpt-4o-mini`
- Reduce check frequency in changedetection.io

## Recommended Models

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| `openai/gpt-4o-mini` | Fast | Low | Default, most cases |
| `anthropic/claude-3-haiku` | Fast | Low | Alternative |
| `openai/gpt-4o` | Medium | Medium | Complex pages |
| `anthropic/claude-3.5-sonnet` | Medium | Medium | High accuracy |

## License

MIT
