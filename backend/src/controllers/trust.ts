import { Request, Response, NextFunction } from 'express';
import { calculateTrustScore } from '../services/trust';
import { sendSuccess, sendNotFound } from '../utils/response';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getTrustScore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trustScore = await prisma.trustScore.findUnique({
      where: { datasetId: req.params.datasetId },
    });

    if (!trustScore) {
      sendNotFound(res, 'Trust score');
      return;
    }

    sendSuccess(res, trustScore);
  } catch (error) {
    next(error);
  }
}

export async function recalculateTrustScore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trustScore = await calculateTrustScore(req.params.datasetId);
    sendSuccess(res, trustScore);
  } catch (error) {
    next(error);
  }
}
