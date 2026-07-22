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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Request failed');
  }

  return json.data as T;
}

export const api = {
  async uploadDataset(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });

    return handleResponse<Dataset>(response);
  },

  async getDatasets(): Promise<Dataset[]> {
    const response = await fetch(`${API_BASE}/datasets`);
    return handleResponse<Dataset[]>(response);
  },

  async getDataset(id: string): Promise<Dataset> {
    const response = await fetch(`${API_BASE}/datasets/${id}`);
    return handleResponse<Dataset>(response);
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

    return handleResponse<any>(response);
  },

  async getQualityCheck(datasetId: string): Promise<QualityCheck> {
    const response = await fetch(`${API_BASE}/quality/${datasetId}`);
    return handleResponse<QualityCheck>(response);
  },

  async runQualityChecks(datasetId: string): Promise<QualityCheck> {
    const response = await fetch(`${API_BASE}/quality/${datasetId}/run`, {
      method: 'POST',
    });
    return handleResponse<QualityCheck>(response);
  },

  async getTrustScore(datasetId: string): Promise<TrustScore> {
    const response = await fetch(`${API_BASE}/trust/${datasetId}`);
    return handleResponse<TrustScore>(response);
  },

  async calculateTrustScore(datasetId: string): Promise<TrustScore> {
    const response = await fetch(`${API_BASE}/trust/${datasetId}/calculate`, {
      method: 'POST',
    });
    return handleResponse<TrustScore>(response);
  },

  async getValueAssessment(datasetId: string): Promise<ValueAssessment> {
    const response = await fetch(`${API_BASE}/value/${datasetId}`);
    return handleResponse<ValueAssessment>(response);
  },

  async trackAccess(datasetId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/value/${datasetId}/access`, {
      method: 'POST',
    });
    await handleResponse<any>(response);
  },
};
