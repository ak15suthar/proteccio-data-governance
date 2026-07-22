import { Router, Request, Response } from 'express';
import { calculateTrustScore } from '../services/trust';

const router = Router();

// Get trust score for a dataset
router.get('/:datasetId', async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const trustScore = await prisma.trustScore.findUnique({
      where: { datasetId: req.params.datasetId },
    });

    if (!trustScore) {
      return res.status(404).json({ error: 'Trust score not found' });
    }

    res.json(trustScore);
  } catch (error) {
    console.error('Get trust score error:', error);
    res.status(500).json({ error: 'Failed to fetch trust score' });
  }
});

// Recalculate trust score
router.post('/:datasetId/calculate', async (req: Request, res: Response) => {
  try {
    const trustScore = await calculateTrustScore(req.params.datasetId);
    res.json(trustScore);
  } catch (error) {
    console.error('Calculate trust score error:', error);
    res.status(500).json({ error: 'Failed to calculate trust score' });
  }
});

export default router;
