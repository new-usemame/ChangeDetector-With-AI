import { Router, Request, Response } from 'express';
import { changeValidator } from '../services/validator';
import { logger } from '../utils/logger';

const router = Router();

interface ValidateChangeRequest {
  oldValue: string;
  newValue: string;
  context?: string;
}

router.post('/validate-change', async (req: Request, res: Response) => {
  try {
    const { oldValue, newValue, context = 'price' }: ValidateChangeRequest = req.body;

    if (!oldValue || !newValue) {
      return res.status(400).json({
        error: 'Missing required fields: oldValue, newValue',
      });
    }

    logger.info(`Validating change: ${oldValue} -> ${newValue} (context: ${context})`);

    const result = await changeValidator.validateChange(oldValue, newValue, context);

    res.json(result);
  } catch (error) {
    logger.error('Error in validate-change endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
