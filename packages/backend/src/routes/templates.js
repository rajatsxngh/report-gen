import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

// POST /api/templates - Create a new template
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const db = getDb();
  const id = uuidv4();
  const elements = '[]';

  const stmt = db.prepare(
    'INSERT INTO templates (id, name, elements) VALUES (?, ?, ?)'
  );
  stmt.run(id, name.trim(), elements);

  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);

  res.status(201).json(template);
});

// GET /api/templates - List all templates
router.get('/', (req, res) => {
  const db = getDb();
  const templates = db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all();
  res.json(templates);
});

// GET /api/templates/:id - Get a single template
router.get('/:id', (req, res) => {
  const db = getDb();
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  res.json(template);
});

// PUT /api/templates/:id - Update template name and/or elements
router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const { name, elements } = req.body;

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ error: 'name must be a non-empty string' });
  }

  if (elements !== undefined && !Array.isArray(elements)) {
    return res.status(400).json({ error: 'elements must be an array' });
  }

  const updatedName = name !== undefined ? name.trim() : existing.name;
  const updatedElements = elements !== undefined ? JSON.stringify(elements) : existing.elements;

  const stmt = db.prepare(
    `UPDATE templates SET name = ?, elements = ?, updated_at = datetime('now') WHERE id = ?`
  );
  stmt.run(updatedName, updatedElements, req.params.id);

  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

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
