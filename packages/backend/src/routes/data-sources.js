import { Router } from 'express';
import { getAllDataSources, getDataSourceById } from '../data-sources/index.js';

const router = Router();

// GET /api/data-sources - List all available datasets with their schemas
router.get('/', (req, res) => {
  res.json(getAllDataSources());
});

// GET /api/data-sources/:id - Return schema and rows for a specific dataset
router.get('/:id', (req, res) => {
  const dataSource = getDataSourceById(req.params.id);
  if (!dataSource) {
    return res.status(404).json({ error: `Data source '${req.params.id}' not found` });
  }
  res.json(dataSource);
});

export default router;
