import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

export async function runQualityChecks(datasetId: string) {
  const dataset = await prisma.dataset.findUnique({
    where: { id: datasetId },
    include: { columns: true },
  });

  if (!dataset) throw new Error('Dataset not found');

  // Read the data file
  const ext = path.extname(dataset.filename).toLowerCase();
  let records: Record<string, any>[] = [];

  if (ext === '.csv') {
    const content = fs.readFileSync(dataset.filePath, 'utf-8');
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  } else if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.readFile(dataset.filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    records = XLSX.utils.sheet_to_json(sheet);
  }

  const totalRows = records.length;
  if (totalRows === 0) {
    return prisma.qualityCheck.create({
      data: {
        datasetId,
        missingPercentage: 100,
        duplicateRows: 0,
        invalidValues: 0,
        qualityScore: 0,
        columnStats: {},
      },
    });
  }

  // Calculate missing values
  let totalCells = 0;
  let missingCells = 0;

  for (const record of records) {
    for (const col of dataset.columns) {
      totalCells++;
      const value = record[col.name];
      if (value === null || value === undefined || value === '') {
        missingCells++;
      }
    }
  }

  const missingPercentage = totalCells > 0 ? (missingCells / totalCells) * 100 : 0;

  // Calculate duplicate rows
  const rowStrings = records.map(r => JSON.stringify(r));
  const uniqueRows = new Set(rowStrings);
  const duplicateRows = totalRows - uniqueRows.size;

  // Calculate invalid values (basic validation)
  let invalidValues = 0;
  for (const record of records) {
    for (const col of dataset.columns) {
      const value = record[col.name];
      if (value !== null && value !== undefined && value !== '') {
        // Basic type validation
        if (col.inferredType === 'integer' && !/^-?\d+$/.test(String(value))) {
          invalidValues++;
        } else if (col.inferredType === 'float' && !/^-?\d+\.\d+$/.test(String(value))) {
          invalidValues++;
        } else if (col.inferredType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          invalidValues++;
        }
      }
    }
  }

  // Calculate quality score (0-100)
  const completenessScore = Math.max(0, 100 - missingPercentage);
  const uniquenessScore = totalRows > 0 ? ((totalRows - duplicateRows) / totalRows) * 100 : 0;
  const validityScore = totalCells > 0 ? ((totalCells - invalidValues) / totalCells) * 100 : 0;

  const qualityScore = (completenessScore * 0.4 + uniquenessScore * 0.3 + validityScore * 0.3);

  // Column-level stats
  const columnStats: Record<string, any> = {};
  for (const col of dataset.columns) {
    const values = records.map(r => r[col.name]);
    const missing = values.filter(v => v === null || v === undefined || v === '').length;
    const unique = new Set(values.map(String)).size;

    columnStats[col.name] = {
      missing: (missing / totalRows) * 100,
      unique,
      type: col.inferredType,
    };
  }

  // Upsert quality check
  return prisma.qualityCheck.upsert({
    where: { datasetId },
    update: {
      missingPercentage,
      duplicateRows,
      invalidValues,
      qualityScore,
      columnStats,
    },
    create: {
      datasetId,
      missingPercentage,
      duplicateRows,
      invalidValues,
      qualityScore,
      columnStats,
    },
  });
}
