import { Router, Request, Response } from 'express';
import { priceExtractor } from '../services/extractor';
import { changeValidator } from '../services/validator';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Webhook endpoint for changedetection.io
 * This receives the full notification payload and enhances it with AI
 */
interface ChangeDetectionWebhook {
  watch_url?: string;
  watch_uuid?: string;
  watch_title?: string;
  current_snapshot?: string;
  previous_snapshot?: string;
  diff?: string;
  diff_full?: string;
  triggered_text?: string;
}

router.post('/webhook/changedetection', async (req: Request, res: Response) => {
  try {
    const payload: ChangeDetectionWebhook = req.body;
    
    logger.info(`Received webhook for: ${payload.watch_url || 'unknown'}`);

    // Extract current snapshot HTML if available
    const html = payload.current_snapshot || '';
    const previousHtml = payload.previous_snapshot || '';

    // Extract prices from both snapshots
    const [currentPrice, previousPrice] = await Promise.all([
      html ? priceExtractor.extractPrice(html, payload.watch_url) : Promise.resolve(null),
      previousHtml ? priceExtractor.extractPrice(previousHtml, payload.watch_url) : Promise.resolve(null),
    ]);

    // Validate if this is a real price change
    let validation = null;
    if (currentPrice?.price && previousPrice?.price) {
      validation = await changeValidator.validateChange(
        previousPrice.price,
        currentPrice.price,
        'price'
      );
    }

    const response = {
      watch_url: payload.watch_url,
      watch_title: payload.watch_title,
      current_price: currentPrice,
      previous_price: previousPrice,
      price_changed: currentPrice?.price !== previousPrice?.price,
      validation,
      is_valid_change: validation?.isValid ?? true,
      timestamp: new Date().toISOString(),
    };

    logger.info(`Webhook processed: ${JSON.stringify({
      url: payload.watch_url,
      currentPrice: currentPrice?.price,
      previousPrice: previousPrice?.price,
      isValid: validation?.isValid,
    })}`);

    res.json(response);
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Simple endpoint to check if a URL's price has dropped
 * Can be used as a notification filter
 */
router.post('/webhook/price-check', async (req: Request, res: Response) => {
  try {
    const { html, url, threshold_percent = 5 } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'Missing html field' });
    }

    const priceData = await priceExtractor.extractPrice(html, url);

    res.json({
      ...priceData,
      should_notify: priceData.price !== null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in price-check:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
