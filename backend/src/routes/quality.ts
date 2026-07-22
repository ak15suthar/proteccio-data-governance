import { Router } from 'express';
import { getQualityCheck, runQualityCheck } from '../controllers/quality';

const router = Router();

router.get('/:datasetId', getQualityCheck);
router.post('/:datasetId/run', runQualityCheck);

export default router;
