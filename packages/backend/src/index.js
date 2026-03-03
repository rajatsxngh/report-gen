import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';
import dataSourcesRouter from './routes/data-sources.js';
import templateRoutes from './routes/templates.js';
import reportsRouter from './routes/reports.js';
import { loadSchedules } from './scheduler.js';
import schedulesRouter from './routes/schedules.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database on startup
initDatabase();

// Load saved schedules and register cron jobs
loadSchedules();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/data-sources', dataSourcesRouter);
app.use('/api/templates', templateRoutes);

// Report run & history routes
app.use('/api/reports', reportsRouter);

app.use('/api/schedules', schedulesRouter);

app.listen(PORT, () => {
  console.log(`ReportGen backend running on http://localhost:${PORT}`);
});
