import { Request, Response, NextFunction } from 'express';
import { ingestDataset, getDatasetCatalog, getDatasetById } from '../services/ingestion';
import { runQualityChecks } from '../services/quality';
import { calculateTrustScore } from '../services/trust';
import { sendSuccess, sendError, sendCreated, sendNotFound } from '../utils/response';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

export async function uploadDataset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }

    const dataset = await ingestDataset(req.file.path, req.file.originalname);
    await runQualityChecks(dataset.id);
    await calculateTrustScore(dataset.id);

    const fullDataset = await getDatasetById(dataset.id);
    sendCreated(res, fullDataset);
  } catch (error) {
    next(error);
  }
}

export async function getAllDatasets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const datasets = await getDatasetCatalog();
    sendSuccess(res, datasets);
  } catch (error) {
    next(error);
  }
}

export async function getDataset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dataset = await getDatasetById(req.params.id);
    if (!dataset) {
      sendNotFound(res, 'Dataset');
      return;
    }
    sendSuccess(res, dataset);
  } catch (error) {
    next(error);
  }
}

export async function updateColumnSensitivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { isSensitive, sensitiveType } = req.body;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const column = await prisma.column.update({
      where: {
        datasetId_name: {
          datasetId: req.params.id,
          name: req.params.columnName,
        },
      },
      data: {
        isSensitive,
        sensitiveType,
        manualOverride: true,
      },
    });

    await calculateTrustScore(req.params.id);
    sendSuccess(res, column);
  } catch (error) {
    next(error);
  }
}
