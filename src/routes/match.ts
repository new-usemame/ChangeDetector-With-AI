import { Router, Request, Response } from 'express';
import { productMatcher, ProductInfo } from '../services/matcher';
import { logger } from '../utils/logger';

const router = Router();

interface MatchProductRequest {
  product1: ProductInfo;
  product2: ProductInfo;
}

router.post('/match-product', async (req: Request, res: Response) => {
  try {
    const { product1, product2 }: MatchProductRequest = req.body;

    if (!product1 || !product2) {
      return res.status(400).json({
        error: 'Missing required fields: product1, product2',
      });
    }

    logger.info('Matching products');

    const result = await productMatcher.matchProducts(product1, product2);

    res.json(result);
  } catch (error) {
    logger.error('Error in match-product endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
