import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import datasetRoutes from './routes/datasets';
import qualityRoutes from './routes/quality';
import trustRoutes from './routes/trust';
import valueRoutes from './routes/value';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/datasets', datasetRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/value', valueRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

export default app;
