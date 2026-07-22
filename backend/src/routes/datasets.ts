import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ingestDataset, getDatasetCatalog, getDatasetById } from '../services/ingestion';
import { runQualityChecks } from '../services/quality';
import { calculateTrustScore } from '../services/trust';

const router = Router();

// Configure multer for file uploads
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

const upload = multer({
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
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Upload and ingest a dataset
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dataset = await ingestDataset(req.file.path, req.file.originalname);

    // Run quality checks and trust scoring
    await runQualityChecks(dataset.id);
    await calculateTrustScore(dataset.id);

    const fullDataset = await getDatasetById(dataset.id);
    res.status(201).json(fullDataset);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

// Get all datasets (catalog)
router.get('/', async (req: Request, res: Response) => {
  try {
    const datasets = await getDatasetCatalog();
    res.json(datasets);
  } catch (error) {
    console.error('Catalog error:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// Get dataset by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const dataset = await getDatasetById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    res.json(dataset);
  } catch (error) {
    console.error('Get dataset error:', error);
    res.status(500).json({ error: 'Failed to fetch dataset' });
  }
});

// Update column sensitivity tag
router.patch('/:id/columns/:columnName', async (req: Request, res: Response) => {
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

    // Recalculate trust score after manual override
    await calculateTrustScore(req.params.id);

    res.json(column);
  } catch (error) {
    console.error('Update column error:', error);
    res.status(500).json({ error: 'Failed to update column' });
  }
});

export default router;
