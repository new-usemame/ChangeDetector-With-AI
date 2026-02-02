# AI Wrapper for changedetection.io

An AI-powered wrapper service that enhances [changedetection.io](https://changedetection.io) with semantic price extraction, automatic selector repair, false positive filtering, and product matching capabilities. Uses OpenRouter to access various LLM models for intelligent web scraping.

## Features

- **Semantic Price Extraction**: Extract product prices from HTML without relying on brittle CSS/XPath selectors
- **Automatic Selector Repair**: Detect broken selectors and generate new ones using AI
- **False Positive Filtering**: Distinguish real price changes from noise (ads, timestamps, layout changes)
- **Product Matching**: Match products across URL/ID changes using semantic similarity
- **OpenRouter Integration**: Access hundreds of AI models through a single API

## Architecture

The service acts as a standalone HTTP API that changedetection.io can call to enhance its monitoring capabilities. It uses OpenRouter to access LLM models for semantic understanding of web pages.

```
changedetection.io → AI Wrapper Service → OpenRouter API
```

## Prerequisites

- Node.js 18+ 
- OpenRouter API key ([Get one here](https://openrouter.ai/keys))
- Railway account (for deployment)

## Installation

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd changedetector_with_ai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=3000
OPENROUTER_MODEL=openai/gpt-4o-mini
LOG_LEVEL=info
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Railway Deployment

1. **Create a Railway project** and connect it to your repository

2. **Add environment variables** in Railway dashboard:
   - `OPENROUTER_API_KEY` - Your OpenRouter API key (required)
   - `PORT` - Server port (default: 3000, Railway will set this automatically)
   - `OPENROUTER_MODEL` - Model to use (default: `openai/gpt-4o-mini`)
   - `LOG_LEVEL` - Logging level (default: `info`)

3. **Deploy**: Railway will automatically detect the Dockerfile and deploy your service

4. **Get your service URL**: Railway will provide a public URL for your service

## API Endpoints

### POST /extract-price

Extract product price and information from HTML using AI.

**Request:**
```json
{
  "html": "<html>...</html>",
  "url": "https://example.com/product",
  "previousPrice": "29.99"
}
```

**Response:**
```json
{
  "price": "24.99",
  "currency": "USD",
  "productName": "Product Name",
  "available": true,
  "confidence": 0.95
}
```

### POST /validate-change

Validate if a detected change is meaningful or a false positive.

**Request:**
```json
{
  "oldValue": "29.99",
  "newValue": "24.99",
  "context": "price"
}
```

**Response:**
```json
{
  "isValid": true,
  "reason": "Price decreased by 16.7%",
  "confidence": 0.92
}
```

### POST /repair-selector

Generate a new CSS/XPath selector when the old one breaks.

**Request:**
```json
{
  "html": "<html>...</html>",
  "targetDescription": "the main product price",
  "oldSelector": ".price-old",
  "selectorType": "css"
}
```

**Response:**
```json
{
  "selector": ".product-price-main",
  "selectorType": "css",
  "confidence": 0.85,
  "explanation": "Found stable class name for price element"
}
```

### POST /match-product

Match products across different URLs or IDs to determine if they're the same product.

**Request:**
```json
{
  "product1": {
    "name": "Product Name",
    "url": "https://store1.com/product/123",
    "price": "29.99",
    "sku": "SKU123"
  },
  "product2": {
    "name": "Product Name",
    "url": "https://store1.com/product/456",
    "price": "29.99",
    "sku": "SKU456"
  }
}
```

**Response:**
```json
{
  "isMatch": true,
  "confidence": 0.92,
  "reason": "Same product name and price, likely variant",
  "similarityScore": 0.95
}
```

### GET /health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "changedetector-ai-wrapper"
}
```

## Integration with changedetection.io

### Option 1: Webhook Integration

Configure changedetection.io to call the wrapper service via webhooks before sending notifications:

1. In changedetection.io, set up a webhook notification
2. Point it to your wrapper service URL: `https://your-service.railway.app/validate-change`
3. The wrapper will validate changes and filter false positives

### Option 2: Custom Filter

Use the wrapper as a custom filter in changedetection.io:

1. Configure changedetection.io to use your service URL
2. Set up filters that call the wrapper endpoints
3. The wrapper will process changes and return validation results

### Option 3: External Service

Call the wrapper service directly from changedetection.io's custom scripts or filters:

```javascript
// Example: Validate a change before notification
const response = await fetch('https://your-service.railway.app/validate-change', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    oldValue: oldPrice,
    newValue: newPrice,
    context: 'price'
  })
});

const result = await response.json();
if (result.isValid && result.confidence > 0.8) {
  // Proceed with notification
}
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key | - | Yes |
| `PORT` | Server port | 3000 | No |
| `OPENROUTER_MODEL` | OpenRouter model to use | `openai/gpt-4o-mini` | No |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` | No |

### Model Selection

You can use any model available on OpenRouter. Recommended models:

- `openai/gpt-4o-mini` - Fast and cost-effective (default)
- `openai/gpt-4o` - More accurate but slower
- `anthropic/claude-3-haiku` - Good balance of speed and accuracy
- `google/gemini-pro` - Alternative option

See [OpenRouter Models](https://openrouter.ai/models) for the full list.

## Development

### Project Structure

```
/
├── src/
│   ├── server.ts              # Express server setup
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic services
│   ├── utils/                 # Utility functions
│   └── config/                # Configuration
├── Dockerfile                 # Docker configuration
├── railway.json               # Railway deployment config
└── package.json
```

### Running Tests

```bash
npm run type-check  # TypeScript type checking
```

### Building

```bash
npm run build  # Compile TypeScript to JavaScript
```

## Troubleshooting

### Service won't start

- Check that `OPENROUTER_API_KEY` is set correctly
- Verify Node.js version is 18+
- Check logs for specific error messages

### API calls failing

- Verify OpenRouter API key is valid and has credits
- Check that the model name is correct
- Review logs for detailed error messages

### Selector repair not working

- Ensure HTML content is provided in the request
- Check that target description is clear and specific
- Verify the model has enough context (HTML might be too large)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions:
- Open an issue on GitHub
- Check changedetection.io documentation
- Review OpenRouter documentation
