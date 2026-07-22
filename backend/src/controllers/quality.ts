import { Request, Response, NextFunction } from 'express';
import { runQualityChecks } from '../services/quality';
import { sendSuccess, sendNotFound } from '../utils/response';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getQualityCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const qualityCheck = await prisma.qualityCheck.findUnique({
      where: { datasetId: req.params.datasetId },
    });

    if (!qualityCheck) {
      sendNotFound(res, 'Quality check');
      return;
    }

    sendSuccess(res, qualityCheck);
  } catch (error) {
    next(error);
  }
}

export async function runQualityCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const qualityCheck = await runQualityChecks(req.params.datasetId);
    sendSuccess(res, qualityCheck);
  } catch (error) {
    next(error);
  }
}
