import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { inferDataType } from '../utils/typeInference';
import { SENSITIVE_PATTERNS } from '../utils/patterns';

const prisma = new PrismaClient();

export async function ingestDataset(filePath: string, filename: string) {
  const ext = path.extname(filename).toLowerCase();
  let records: Record<string, any>[] = [];
  let headers: string[] = [];

  if (ext === '.csv') {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
    records = parsed;
    headers = parsed.length > 0 ? Object.keys(parsed[0]) : [];
  } else if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    records = XLSX.utils.sheet_to_json(sheet);
    headers = records.length > 0 ? Object.keys(records[0]) : [];
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  const dataset = await prisma.dataset.create({
    data: {
      filename,
      rowCount: records.length,
      columnCount: headers.length,
      filePath,
    },
  });

  // Create columns with type inference and sensitivity detection
  for (const header of headers) {
    const columnValues = records.map(r => r[header]);
    const inferredType = inferDataType(columnValues);

    // Check for sensitive data
    let isSensitive = false;
    let sensitiveType: string | null = null;

    const sampleValues = columnValues.filter(v => v !== null && v !== undefined && v !== '').slice(0, 50);

    for (const [key, config] of Object.entries(SENSITIVE_PATTERNS)) {
      const matches = sampleValues.filter(v => config.pattern.test(String(v))).length;
      const confidence = matches / sampleValues.length;

      if (confidence >= config.confidence) {
        isSensitive = true;
        sensitiveType = config.type;
        break;
      }
    }

    // Also check column name for hints
    const lowerHeader = header.toLowerCase();
    if (!isSensitive) {
      if (lowerHeader.includes('email') || lowerHeader.includes('e-mail')) {
        isSensitive = true;
        sensitiveType = 'email';
      } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile')) {
        isSensitive = true;
        sensitiveType = 'phone';
      } else if (lowerHeader.includes('name') && !lowerHeader.includes('filename')) {
        isSensitive = true;
        sensitiveType = 'name';
      } else if (lowerHeader.includes('ssn') || lowerHeader.includes('social')) {
        isSensitive = true;
        sensitiveType = 'ssn';
      } else if (lowerHeader.includes('address') || lowerHeader.includes('location')) {
        isSensitive = true;
        sensitiveType = 'address';
      }
    }

    await prisma.column.create({
      data: {
        datasetId: dataset.id,
        name: header,
        inferredType,
        isSensitive,
        sensitiveType,
      },
    });
  }

  return dataset;
}

export async function getDatasetCatalog() {
  const datasets = await prisma.dataset.findMany({
    include: {
      columns: true,
      qualityChecks: true,
      trustScore: true,
      usage: true,
    },
    orderBy: { uploadTime: 'desc' },
  });

  return datasets;
}

export async function getDatasetById(id: string) {
  const dataset = await prisma.dataset.findUnique({
    where: { id },
    include: {
      columns: true,
      qualityChecks: true,
      trustScore: true,
      usage: true,
    },
  });

  if (!dataset) return null;

  // Increment view count
  await prisma.datasetUsage.upsert({
    where: { datasetId: id },
    update: {
      viewCount: { increment: 1 },
      lastAccessed: new Date(),
    },
    create: {
      datasetId: id,
      viewCount: 1,
      lastAccessed: new Date(),
    },
  });

  return dataset;
}
