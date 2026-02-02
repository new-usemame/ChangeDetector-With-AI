import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { logger } from './utils/logger';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', routes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'changedetector-ai-wrapper',
    version: '1.0.0',
    endpoints: {
      'POST /extract-price': 'Extract price from HTML using AI',
      'POST /validate-change': 'Validate if a change is meaningful',
      'POST /repair-selector': 'Generate new selector when old one breaks',
      'POST /match-product': 'Match products across URL/ID changes',
      'POST /webhook/changedetection': 'Webhook for changedetection.io integration',
      'POST /webhook/price-check': 'Simple price check endpoint',
      'GET /health': 'Health check endpoint',
    },
    docs: 'https://github.com/new-usemame/ChangeDetector-With-AI',
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Start server
const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`OpenRouter model: ${config.openrouter.model}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
