import { Router, Request, Response } from 'express';
import { getDatasetValue, trackUsage } from '../services/value';

const router = Router();

// Get value assessment for a dataset
router.get('/:datasetId', async (req: Request, res: Response) => {
  try {
    const value = await getDatasetValue(req.params.datasetId);
    res.json(value);
  } catch (error) {
    console.error('Get value error:', error);
    res.status(500).json({ error: 'Failed to fetch value assessment' });
  }
});

// Track dataset access
router.post('/:datasetId/access', async (req: Request, res: Response) => {
  try {
    const usage = await trackUsage(req.params.datasetId);
    res.json(usage);
  } catch (error) {
    console.error('Track usage error:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

export default router;
