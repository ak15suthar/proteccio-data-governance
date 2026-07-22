import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getDatasetValue(datasetId: string) {
  const dataset = await prisma.dataset.findUnique({
    where: { id: datasetId },
    include: { usage: true },
  });

  if (!dataset) throw new Error('Dataset not found');

  const usage = dataset.usage;
  if (!usage) {
    return {
      datasetId,
      valueScore: 0,
      viewCount: 0,
      lastAccessed: null,
      status: 'unused',
    };
  }

  // Calculate value score based on usage patterns
  const viewCount = usage.viewCount;
  const lastAccessed = usage.lastAccessed;

  // Days since last access
  const daysSinceAccess = lastAccessed
    ? Math.floor((Date.now() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  // Value scoring logic
  let valueScore = 0;

  // View count contribution (0-50 points)
  if (viewCount >= 100) valueScore += 50;
  else if (viewCount >= 50) valueScore += 40;
  else if (viewCount >= 20) valueScore += 30;
  else if (viewCount >= 10) valueScore += 20;
  else if (viewCount >= 1) valueScore += 10;

  // Recency contribution (0-30 points)
  if (daysSinceAccess <= 1) valueScore += 30;
  else if (daysSinceAccess <= 7) valueScore += 25;
  else if (daysSinceAccess <= 30) valueScore += 20;
  else if (daysSinceAccess <= 90) valueScore += 10;
  else if (daysSinceAccess <= 365) valueScore += 5;

  // Dataset size contribution (0-20 points)
  if (dataset.rowCount >= 10000) valueScore += 20;
  else if (dataset.rowCount >= 1000) valueScore += 15;
  else if (dataset.rowCount >= 100) valueScore += 10;
  else if (dataset.rowCount >= 10) valueScore += 5;

  // Determine status
  let status: string;
  if (valueScore >= 70) status = 'high_value';
  else if (valueScore >= 40) status = 'medium_value';
  else if (valueScore >= 10) status = 'low_value';
  else status = 'unused';

  // Check for archival candidates
  if (daysSinceAccess > 180 && viewCount < 5) {
    status = 'archival_candidate';
  }

  return {
    datasetId,
    valueScore,
    viewCount,
    lastAccessed,
    status,
    daysSinceAccess,
  };
}

export async function trackUsage(datasetId: string) {
  return prisma.datasetUsage.upsert({
    where: { datasetId },
    update: {
      viewCount: { increment: 1 },
      lastAccessed: new Date(),
    },
    create: {
      datasetId,
      viewCount: 1,
      lastAccessed: new Date(),
    },
  });
}
