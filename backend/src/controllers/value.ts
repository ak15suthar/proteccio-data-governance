import { Request, Response, NextFunction } from 'express';
import { getDatasetValue, trackUsage } from '../services/value';
import { sendSuccess, sendNotFound } from '../utils/response';

export async function getValueAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const value = await getDatasetValue(req.params.datasetId);
    sendSuccess(res, value);
  } catch (error) {
    next(error);
  }
}

export async function trackDatasetAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usage = await trackUsage(req.params.datasetId);
    sendSuccess(res, usage);
  } catch (error) {
    next(error);
  }
}
