import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';
import dataSourcesRouter from './routes/data-sources.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database on startup
initDatabase();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/data-sources', dataSourcesRouter);

app.listen(PORT, () => {
  console.log(`ReportGen backend running on http://localhost:${PORT}`);
});
