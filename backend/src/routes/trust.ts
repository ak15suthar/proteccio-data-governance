import { Router } from 'express';
import { getTrustScore, recalculateTrustScore } from '../controllers/trust';

const router = Router();

router.get('/:datasetId', getTrustScore);
router.post('/:datasetId/calculate', recalculateTrustScore);

export default router;
