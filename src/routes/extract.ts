import { Router, Request, Response } from 'express';
import { priceExtractor } from '../services/extractor';
import { logger } from '../utils/logger';

const router = Router();

interface ExtractPriceRequest {
  html: string;
  url?: string;
  previousPrice?: string;
}

router.post('/extract-price', async (req: Request, res: Response) => {
  try {
    const { html, url, previousPrice }: ExtractPriceRequest = req.body;

    if (!html) {
      return res.status(400).json({
        error: 'Missing required field: html',
      });
    }

    logger.info(`Extracting price from ${url || 'unknown URL'}`);

    const result = await priceExtractor.extractPrice(html, url, previousPrice);

    res.json(result);
  } catch (error) {
    logger.error('Error in extract-price endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
