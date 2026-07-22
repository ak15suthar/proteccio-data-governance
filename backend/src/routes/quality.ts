import { Router, Request, Response } from 'express';
import { runQualityChecks } from '../services/quality';

const router = Router();

// Get quality checks for a dataset
router.get('/:datasetId', async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const qualityCheck = await prisma.qualityCheck.findUnique({
      where: { datasetId: req.params.datasetId },
    });

    if (!qualityCheck) {
      return res.status(404).json({ error: 'Quality check not found' });
    }

    res.json(qualityCheck);
  } catch (error) {
    console.error('Get quality check error:', error);
    res.status(500).json({ error: 'Failed to fetch quality check' });
  }
});

// Re-run quality checks for a dataset
router.post('/:datasetId/run', async (req: Request, res: Response) => {
  try {
    const qualityCheck = await runQualityChecks(req.params.datasetId);
    res.json(qualityCheck);
  } catch (error) {
    console.error('Run quality check error:', error);
    res.status(500).json({ error: 'Failed to run quality check' });
  }
});

export default router;
