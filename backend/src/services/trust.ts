import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function calculateTrustScore(datasetId: string) {
  const dataset = await prisma.dataset.findUnique({
    where: { id: datasetId },
    include: {
      columns: true,
      qualityChecks: true,
    },
  });

  if (!dataset) throw new Error('Dataset not found');

  // Get quality score (0-100)
  const qualityScore = dataset.qualityChecks?.qualityScore ?? 0;

  // Calculate completeness (based on missing values)
  const completeness = Math.max(0, 100 - (dataset.qualityChecks?.missingPercentage ?? 100));

  // Calculate accuracy (based on invalid values)
  const totalCells = dataset.rowCount * dataset.columnCount;
  const invalidValues = dataset.qualityChecks?.invalidValues ?? 0;
  const accuracy = totalCells > 0 ? ((totalCells - invalidValues) / totalCells) * 100 : 0;

  // Calculate consistency (based on duplicate rows)
  const duplicateRows = dataset.qualityChecks?.duplicateRows ?? 0;
  const consistency = dataset.rowCount > 0
    ? ((dataset.rowCount - duplicateRows) / dataset.rowCount) * 100
    : 0;

  // Calculate classification (based on sensitivity tagging)
  const totalColumns = dataset.columns.length;
  const classifiedColumns = dataset.columns.filter(c => c.isSensitive || c.manualOverride).length;
  const classification = totalColumns > 0 ? (classifiedColumns / totalColumns) * 100 : 0;

  // Calculate overall trust score (weighted average)
  const trustScore = (
    qualityScore * 0.3 +
    completeness * 0.25 +
    accuracy * 0.2 +
    consistency * 0.15 +
    classification * 0.1
  );

  // Upsert trust score
  return prisma.trustScore.upsert({
    where: { datasetId },
    update: {
      score: trustScore,
      qualityScore,
      completeness,
      accuracy,
      consistency,
      classification,
    },
    create: {
      datasetId,
      score: trustScore,
      qualityScore,
      completeness,
      accuracy,
      consistency,
      classification,
    },
  });
}
