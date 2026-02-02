import { Router, Request, Response } from 'express';
import { selectorRepairService } from '../services/selector-repair';
import { logger } from '../utils/logger';

const router = Router();

interface RepairSelectorRequest {
  html: string;
  targetDescription: string;
  oldSelector?: string;
  selectorType?: 'css' | 'xpath';
}

router.post('/repair-selector', async (req: Request, res: Response) => {
  try {
    const {
      html,
      targetDescription,
      oldSelector,
      selectorType = 'css',
    }: RepairSelectorRequest = req.body;

    if (!html || !targetDescription) {
      return res.status(400).json({
        error: 'Missing required fields: html, targetDescription',
      });
    }

    logger.info(`Repairing selector for: ${targetDescription}`);

    const result = await selectorRepairService.repairSelector(
      html,
      targetDescription,
      oldSelector,
      selectorType
    );

    res.json(result);
  } catch (error) {
    logger.error('Error in repair-selector endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
