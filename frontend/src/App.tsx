import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DatasetDetail from './components/DatasetDetail';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Data Governance Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage, classify, and monitor your datasets
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Proteccio</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dataset/:id" element={<DatasetDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
