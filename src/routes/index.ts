import { Router } from 'express';
import extractRoutes from './extract';
import validateRoutes from './validate';
import repairRoutes from './repair';
import matchRoutes from './match';
import healthRoutes from './health';

const router = Router();

router.use(extractRoutes);
router.use(validateRoutes);
router.use(repairRoutes);
router.use(matchRoutes);
router.use(healthRoutes);

export default router;
