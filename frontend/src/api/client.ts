const API_BASE = '/api';

export interface Dataset {
  id: string;
  filename: string;
  uploadTime: string;
  rowCount: number;
  columnCount: number;
  columns: Column[];
  qualityChecks?: QualityCheck;
  trustScore?: TrustScore;
  usage?: DatasetUsage;
}

export interface Column {
  id: string;
  name: string;
  inferredType: string;
  isSensitive: boolean;
  sensitiveType?: string;
  manualOverride: boolean;
}

export interface QualityCheck {
  id: string;
  datasetId: string;
  missingPercentage: number;
  duplicateRows: number;
  invalidValues: number;
  qualityScore: number;
  columnStats?: Record<string, any>;
}

export interface TrustScore {
  id: string;
  datasetId: string;
  score: number;
  qualityScore: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  classification: number;
}

export interface DatasetUsage {
  id: string;
  datasetId: string;
  viewCount: number;
  lastAccessed?: string;
}

export interface ValueAssessment {
  datasetId: string;
  valueScore: number;
  viewCount: number;
  lastAccessed: string | null;
  status: string;
  daysSinceAccess: number;
}

export const api = {
  async uploadDataset(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  async getDatasets(): Promise<Dataset[]> {
    const response = await fetch(`${API_BASE}/datasets`);
    if (!response.ok) {
      throw new Error('Failed to fetch datasets');
    }
    return response.json();
  },

  async getDataset(id: string): Promise<Dataset> {
    const response = await fetch(`${API_BASE}/datasets/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch dataset');
    }
    return response.json();
  },

  async updateColumnSensitivity(
    datasetId: string,
    columnName: string,
    isSensitive: boolean,
    sensitiveType: string | null
  ): Promise<any> {
    const response = await fetch(`${API_BASE}/datasets/${datasetId}/columns/${columnName}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSensitive, sensitiveType }),
    });

    if (!response.ok) {
      throw new Error('Failed to update column');
    }

    return response.json();
  },

  async getQualityCheck(datasetId: string): Promise<QualityCheck> {
    const response = await fetch(`${API_BASE}/quality/${datasetId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch quality check');
    }
    return response.json();
  },

  async runQualityChecks(datasetId: string): Promise<QualityCheck> {
    const response = await fetch(`${API_BASE}/quality/${datasetId}/run`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to run quality checks');
    }
    return response.json();
  },

  async getTrustScore(datasetId: string): Promise<TrustScore> {
    const response = await fetch(`${API_BASE}/trust/${datasetId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch trust score');
    }
    return response.json();
  },

  async calculateTrustScore(datasetId: string): Promise<TrustScore> {
    const response = await fetch(`${API_BASE}/trust/${datasetId}/calculate`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to calculate trust score');
    }
    return response.json();
  },

  async getValueAssessment(datasetId: string): Promise<ValueAssessment> {
    const response = await fetch(`${API_BASE}/value/${datasetId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch value assessment');
    }
    return response.json();
  },

  async trackAccess(datasetId: string): Promise<void> {
    await fetch(`${API_BASE}/value/${datasetId}/access`, {
      method: 'POST',
    });
  },
};
