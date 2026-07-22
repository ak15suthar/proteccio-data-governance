import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Dataset, ValueAssessment } from '../api/client';

function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [valueAssessment, setValueAssessment] = useState<ValueAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  const fetchDataset = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getDataset(id);
      setDataset(data);
      const value = await api.getValueAssessment(id);
      setValueAssessment(value);
    } catch (err) {
      console.error('Failed to load dataset');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset]);

  const handleSensitivityToggle = async (columnName: string, currentValue: boolean) => {
    if (!id) return;
    try {
      await api.updateColumnSensitivity(id, columnName, !currentValue, !currentValue ? 'manual' : null);
      await fetchDataset();
    } catch (err) {
      console.error('Failed to update column');
    }
    setEditingColumn(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high_value': return 'text-green-600 bg-green-100';
      case 'medium_value': return 'text-blue-600 bg-blue-100';
      case 'low_value': return 'text-yellow-600 bg-yellow-100';
      case 'unused': return 'text-gray-600 bg-gray-100';
      case 'archival_candidate': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dataset details...</div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Dataset not found</p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const sensitiveCount = dataset.columns.filter(c => c.isSensitive).length;
  const qualityScore = dataset.qualityChecks?.qualityScore ?? 0;
  const trustScore = dataset.trustScore?.score ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          &larr; Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{dataset.filename}</h2>
        <p className="text-gray-500 mt-1">
          Uploaded {new Date(dataset.uploadTime).toLocaleString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Rows / Columns</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {dataset.rowCount.toLocaleString()} / {dataset.columnCount}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Sensitive Fields</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {sensitiveCount} / {dataset.columnCount}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Quality Score</div>
          <div className={`text-2xl font-bold mt-1 ${getScoreColor(qualityScore).split(' ')[0]}`}>
            {qualityScore.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Trust Score</div>
          <div className={`text-2xl font-bold mt-1 ${getScoreColor(trustScore).split(' ')[0]}`}>
            {trustScore.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Trust Score Breakdown */}
      {dataset.trustScore && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Score Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm text-gray-500">Quality</div>
              <div className="text-lg font-semibold">{dataset.trustScore.qualityScore.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Completeness</div>
              <div className="text-lg font-semibold">{dataset.trustScore.completeness.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Accuracy</div>
              <div className="text-lg font-semibold">{dataset.trustScore.accuracy.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Consistency</div>
              <div className="text-lg font-semibold">{dataset.trustScore.consistency.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Classification</div>
              <div className="text-lg font-semibold">{dataset.trustScore.classification.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Value Assessment */}
      {valueAssessment && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Value Assessment</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Value Score</div>
              <div className="text-lg font-semibold">{valueAssessment.valueScore}/100</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Views</div>
              <div className="text-lg font-semibold">{valueAssessment.viewCount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Last Accessed</div>
              <div className="text-lg font-semibold">
                {valueAssessment.lastAccessed
                  ? new Date(valueAssessment.lastAccessed).toLocaleDateString()
                  : 'Never'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(valueAssessment.status)}`}>
                {formatStatus(valueAssessment.status)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quality Details */}
      {dataset.qualityChecks && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Check Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Missing Values</div>
              <div className="text-lg font-semibold">
                {dataset.qualityChecks.missingPercentage.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Duplicate Rows</div>
              <div className="text-lg font-semibold">{dataset.qualityChecks.duplicateRows}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Invalid Values</div>
              <div className="text-lg font-semibold">{dataset.qualityChecks.invalidValues}</div>
            </div>
          </div>
        </div>
      )}

      {/* Columns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Column Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inferred Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sensitive
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Override
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataset.columns.map((column) => (
                <tr key={column.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {column.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {column.inferredType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      column.isSensitive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {column.isSensitive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {column.sensitiveType || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {column.manualOverride ? 'Manual' : 'Auto'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingColumn === column.name ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSensitivityToggle(column.name, column.isSensitive)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {column.isSensitive ? 'Remove Tag' : 'Mark Sensitive'}
                        </button>
                        <button
                          onClick={() => setEditingColumn(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingColumn(column.name)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DatasetDetail;
