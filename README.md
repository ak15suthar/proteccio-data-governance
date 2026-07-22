# Data Governance Dashboard

A full-stack web application for ingesting, classifying, and monitoring datasets. Built for the Proteccio Full Stack Developer Assignment.

## Features

- **Data Ingestion**: Upload CSV/Excel files with automatic metadata capture
- **Data Discovery**: Auto-detect column names and inferred data types
- **Data Classification**: Auto-tag sensitive fields (email, phone, name, SSN, etc.)
- **Data Quality**: Calculate missing values, duplicates, and quality scores
- **Data Trust**: Generate trust scores based on quality, completeness, and classification
- **Data Value**: Track usage patterns and identify dataset value
- **Dashboard**: Browse all datasets with column-level detail

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React, TypeScript, Tailwind CSS, Vite

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (local or cloud like Neon/Render)

### Backend Setup

```bash
cd backend
npm install

# Create .env file with your database URL
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

The backend will run on http://localhost:3001

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

The frontend will run on http://localhost:5173

### Running Tests

```bash
cd backend
npm test
```

## API Endpoints

### Datasets
- `POST /api/datasets/upload` - Upload a CSV/Excel file
- `GET /api/datasets` - Get all datasets (catalog)
- `GET /api/datasets/:id` - Get dataset by ID
- `PATCH /api/datasets/:id/columns/:columnName` - Update column sensitivity

### Quality
- `GET /api/quality/:datasetId` - Get quality checks
- `POST /api/quality/:datasetId/run` - Re-run quality checks

### Trust
- `GET /api/trust/:datasetId` - Get trust score
- `POST /api/trust/:datasetId/calculate` - Recalculate trust score

### Value
- `GET /api/value/:datasetId` - Get value assessment
- `POST /api/value/:datasetId/access` - Track dataset access

## Design Decisions

### Data Classification
- Uses pattern matching to detect sensitive data types (email, phone, SSN, etc.)
- Also checks column names for hints (e.g., "email", "phone" in the name)
- Users can manually override auto-detected tags

### Trust Score Calculation
Weighted average of:
- Quality Score (30%)
- Completeness (25%)
- Accuracy (20%)
- Consistency (15%)
- Classification (10%)

### Value Assessment
Based on:
- View count (0-50 points)
- Recency of last access (0-30 points)
- Dataset size (0-20 points)

Status categories: high_value, medium_value, low_value, unused, archival_candidate

## Assumptions

1. Files are CSV or Excel format (.csv, .xlsx, .xls)
2. CSV files use standard comma delimiter
3. First row of CSV/Excel contains headers
4. Maximum file size is 50MB
5. No authentication required (single-user scenario)
6. Free-tier hosting may have cold start delays (20-30 seconds)

## Sample Data

The `sample-data/` directory contains `sample_employees.csv` for testing the application.

## Deployment

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variable: `DATABASE_URL`
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `npm start`

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable: `VITE_API_URL` (your backend URL)

### Database (Neon/Render)
1. Create a free PostgreSQL database
2. Copy the connection string to your backend `.env`
