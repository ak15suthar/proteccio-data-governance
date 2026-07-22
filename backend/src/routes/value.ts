import { Router } from 'express';
import { getValueAssessment, trackDatasetAccess } from '../controllers/value';

const router = Router();

router.get('/:datasetId', getValueAssessment);
router.post('/:datasetId/access', trackDatasetAccess);

export default router;
