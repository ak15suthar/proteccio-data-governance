import { Router } from 'express';
import { uploadDataset, getAllDatasets, getDataset, updateColumnSensitivity, upload } from '../controllers/datasets';

const router = Router();

router.post('/upload', upload.single('file'), uploadDataset);
router.get('/', getAllDatasets);
router.get('/:id', getDataset);
router.patch('/:id/columns/:columnName', updateColumnSensitivity);

export default router;
