import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { getDb } from '../db.js';
import { getDataSourceRows } from '../data/mockData.js';
import { renderReportHtml } from '../services/htmlRenderer.js';
import { generatePdf } from '../services/pdfGenerator.js';

const router = Router();

/**
 * Resolve all data sources referenced by a template's elements.
 * Returns a map of dataSourceId → rows.
 */
function resolveData(elements) {
  const parsed = typeof elements === 'string' ? JSON.parse(elements) : elements;
  const dataMap = {};

  for (const element of parsed) {
    if (element.dataSourceId && !(element.dataSourceId in dataMap)) {
      dataMap[element.dataSourceId] = getDataSourceRows(element.dataSourceId);
    }
  }

  return dataMap;
}

/**
 * POST /api/reports/:id/run
 * Trigger a report run: resolve data, render HTML, generate PDF, log result.
 * Optionally accepts { email } in body for simulated email delivery.
 */
router.post('/:id/run', async (req, res) => {
  const db = getDb();
  const templateId = req.params.id;
  const { email } = req.body || {};

  // Verify template exists
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const runId = uuidv4();
  const startedAt = new Date().toISOString();

  // Insert pending run record
  db.prepare(
    'INSERT INTO run_history (id, template_id, status, started_at) VALUES (?, ?, ?, ?)'
  ).run(runId, templateId, 'completed', startedAt);

  try {
    // Resolve data bindings
    const dataMap = resolveData(template.elements);

    // Render HTML
    const html = renderReportHtml(template, dataMap);

    // Generate PDF
    const pdfFilename = `${runId}.pdf`;
    const pdfPath = await generatePdf(html, pdfFilename);

    // Build email log if email is configured
    let emailLog = null;
    if (email) {
      const timestamp = new Date().toISOString();
      emailLog = JSON.stringify({
        recipient: email,
        subject: `Report: ${template.name}`,
        timestamp,
        status: 'sent (simulated)',
        message: `Email simulated to ${email} at ${timestamp}`,
      });
    }

    // Update run record with success
    const completedAt = new Date().toISOString();
    db.prepare(
      'UPDATE run_history SET status = ?, pdf_path = ?, email_log = ?, completed_at = ? WHERE id = ?'
    ).run('completed', pdfPath, emailLog, completedAt, runId);

    const run = db.prepare('SELECT * FROM run_history WHERE id = ?').get(runId);
    res.status(201).json(formatRun(run));
  } catch (err) {
    // Update run record with failure
    const completedAt = new Date().toISOString();
    db.prepare(
      'UPDATE run_history SET status = ?, error = ?, completed_at = ? WHERE id = ?'
    ).run('failed', err.message, completedAt, runId);

    const run = db.prepare('SELECT * FROM run_history WHERE id = ?').get(runId);
    res.status(500).json(formatRun(run));
  }
});

/**
 * GET /api/reports/:id/runs
 * List run history for a template, ordered by most recent first.
 */
router.get('/:id/runs', (req, res) => {
  const db = getDb();
  const templateId = req.params.id;

  // Verify template exists
  const template = db.prepare('SELECT id FROM templates WHERE id = ?').get(templateId);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const runs = db
    .prepare('SELECT * FROM run_history WHERE template_id = ? ORDER BY started_at DESC')
    .all(templateId);

  res.json(runs.map(formatRun));
});

/**
 * GET /api/reports/:id/runs/:runId/pdf
 * Serve the generated PDF file for download.
 */
router.get('/:id/runs/:runId/pdf', (req, res) => {
  const db = getDb();
  const { id: templateId, runId } = req.params;

  const run = db
    .prepare('SELECT * FROM run_history WHERE id = ? AND template_id = ?')
    .get(runId, templateId);

  if (!run) {
    return res.status(404).json({ error: 'Run not found' });
  }

  if (run.status !== 'completed' || !run.pdf_path) {
    return res.status(404).json({ error: 'PDF not available for this run' });
  }

  if (!fs.existsSync(run.pdf_path)) {
    return res.status(404).json({ error: 'PDF file not found on disk' });
  }

  const filename = `report-${templateId}-${runId}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  fs.createReadStream(run.pdf_path).pipe(res);
});

/**
 * Format a run_history row for API response.
 */
function formatRun(run) {
  return {
    id: run.id,
    templateId: run.template_id,
    status: run.status,
    pdfPath: run.pdf_path || null,
    error: run.error || null,
    emailLog: run.email_log ? JSON.parse(run.email_log) : null,
    startedAt: run.started_at,
    completedAt: run.completed_at || null,
  };
}

export default router;
