import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

// GET /api/templates - List all templates with schedule and last run info
router.get('/', (req, res) => {
  const db = getDb();

  const templates = db.prepare(`
    SELECT
      t.id,
      t.name,
      t.elements,
      t.created_at,
      t.updated_at,
      s.id AS schedule_id,
      s.frequency,
      s.day_of_week,
      s.day_of_month,
      s.time AS schedule_time,
      rh.id AS last_run_id,
      rh.status AS last_run_status,
      rh.started_at AS last_run_started_at,
      rh.completed_at AS last_run_completed_at,
      rh.error AS last_run_error
    FROM templates t
    LEFT JOIN schedules s ON s.template_id = t.id
    LEFT JOIN (
      SELECT rh1.*
      FROM run_history rh1
      INNER JOIN (
        SELECT template_id, MAX(started_at) AS max_started
        FROM run_history
        GROUP BY template_id
      ) rh2 ON rh1.template_id = rh2.template_id AND rh1.started_at = rh2.max_started
    ) rh ON rh.template_id = t.id
    ORDER BY t.updated_at DESC
  `).all();

  const result = templates.map(row => ({
    id: row.id,
    name: row.name,
    elements: JSON.parse(row.elements),
    created_at: row.created_at,
    updated_at: row.updated_at,
    schedule: row.schedule_id ? {
      id: row.schedule_id,
      frequency: row.frequency,
      day_of_week: row.day_of_week,
      day_of_month: row.day_of_month,
      time: row.schedule_time,
    } : null,
    last_run: row.last_run_id ? {
      id: row.last_run_id,
      status: row.last_run_status,
      started_at: row.last_run_started_at,
      completed_at: row.last_run_completed_at,
      error: row.last_run_error,
    } : null,
  }));

  res.json(result);
});

// GET /api/templates/:id - Get a single template
router.get('/:id', (req, res) => {
  const db = getDb();
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  template.elements = JSON.parse(template.elements);
  res.json(template);
});

// POST /api/templates - Create a new template
router.post('/', (req, res) => {
  const { name, elements } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const db = getDb();
  const id = uuidv4();

  db.prepare(
    'INSERT INTO templates (id, name, elements) VALUES (?, ?, ?)'
  ).run(id, name.trim(), JSON.stringify(elements || []));

  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
  template.elements = JSON.parse(template.elements);
  res.status(201).json(template);
});

// PUT /api/templates/:id - Update a template
router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, elements } = req.body;

  const existing = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Template not found' });
  }

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ error: 'name must be a non-empty string' });
  }

  const updatedName = name !== undefined ? name.trim() : existing.name;
  const updatedElements = elements !== undefined ? JSON.stringify(elements) : existing.elements;

  db.prepare(
    "UPDATE templates SET name = ?, elements = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(updatedName, updatedElements, req.params.id);

  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  template.elements = JSON.parse(template.elements);
  res.json(template);
});

// DELETE /api/templates/:id - Delete a template (cascades to schedules and run_history)
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: 'Template not found' });
  }

  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
