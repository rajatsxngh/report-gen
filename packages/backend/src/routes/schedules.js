import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { registerCronJob, unregisterCronJob } from '../scheduler.js';

const router = Router();

// POST /api/schedules - Create a schedule
router.post('/', (req, res) => {
  const { templateId, frequency, dayOfWeek, dayOfMonth, time } = req.body;

  if (!templateId || !frequency || !time) {
    return res.status(400).json({ error: 'templateId, frequency, and time are required' });
  }

  if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
    return res.status(400).json({ error: 'frequency must be daily, weekly, or monthly' });
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ error: 'time must be in HH:MM format' });
  }

  if (frequency === 'weekly' && (dayOfWeek === undefined || dayOfWeek === null)) {
    return res.status(400).json({ error: 'dayOfWeek is required for weekly frequency' });
  }

  if (frequency === 'monthly' && (dayOfMonth === undefined || dayOfMonth === null)) {
    return res.status(400).json({ error: 'dayOfMonth is required for monthly frequency' });
  }

  const db = getDb();

  // Verify template exists
  const template = db.prepare('SELECT id FROM templates WHERE id = ?').get(templateId);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  // Check if template already has a schedule
  const existing = db.prepare('SELECT id FROM schedules WHERE template_id = ?').get(templateId);
  if (existing) {
    return res.status(409).json({ error: 'Template already has a schedule' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO schedules (id, template_id, frequency, day_of_week, day_of_month, time)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, templateId, frequency, dayOfWeek ?? null, dayOfMonth ?? null, time);

  const schedule = db.prepare(`
    SELECT s.*, t.name as template_name
    FROM schedules s
    JOIN templates t ON t.id = s.template_id
    WHERE s.id = ?
  `).get(id);

  // Register cron job for the new schedule
  registerCronJob(schedule);

  res.status(201).json(formatSchedule(schedule));
});

// GET /api/schedules - List all schedules with next run time
router.get('/', (req, res) => {
  const db = getDb();
  const schedules = db.prepare(`
    SELECT s.*, t.name as template_name
    FROM schedules s
    JOIN templates t ON t.id = s.template_id
    ORDER BY s.created_at DESC
  `).all();

  res.json(schedules.map(s => ({
    ...formatSchedule(s),
    nextRunTime: calculateNextRun(s),
  })));
});

// PUT /api/schedules/:id - Update a schedule
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { frequency, dayOfWeek, dayOfMonth, time } = req.body;

  const db = getDb();
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Schedule not found' });
  }

  const newFrequency = frequency || existing.frequency;
  const newTime = time || existing.time;

  if (!['daily', 'weekly', 'monthly'].includes(newFrequency)) {
    return res.status(400).json({ error: 'frequency must be daily, weekly, or monthly' });
  }

  if (newTime && !/^\d{2}:\d{2}$/.test(newTime)) {
    return res.status(400).json({ error: 'time must be in HH:MM format' });
  }

  const newDayOfWeek = dayOfWeek !== undefined ? dayOfWeek : existing.day_of_week;
  const newDayOfMonth = dayOfMonth !== undefined ? dayOfMonth : existing.day_of_month;

  if (newFrequency === 'weekly' && (newDayOfWeek === undefined || newDayOfWeek === null)) {
    return res.status(400).json({ error: 'dayOfWeek is required for weekly frequency' });
  }

  if (newFrequency === 'monthly' && (newDayOfMonth === undefined || newDayOfMonth === null)) {
    return res.status(400).json({ error: 'dayOfMonth is required for monthly frequency' });
  }

  db.prepare(`
    UPDATE schedules
    SET frequency = ?, day_of_week = ?, day_of_month = ?, time = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(newFrequency, newDayOfWeek ?? null, newDayOfMonth ?? null, newTime, id);

  const schedule = db.prepare(`
    SELECT s.*, t.name as template_name
    FROM schedules s
    JOIN templates t ON t.id = s.template_id
    WHERE s.id = ?
  `).get(id);

  // Re-register cron job with updated schedule
  registerCronJob(schedule);

  res.json(formatSchedule(schedule));
});

// DELETE /api/schedules/:id - Remove a schedule
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Schedule not found' });
  }

  // Unregister cron job before deleting
  unregisterCronJob(id);

  db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
  res.status(204).end();
});

// GET /api/schedules/:id/history - Get run history for a schedule's template
router.get('/:id/history', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  if (!schedule) {
    return res.status(404).json({ error: 'Schedule not found' });
  }

  const runs = db.prepare(`
    SELECT * FROM run_history
    WHERE template_id = ?
    ORDER BY started_at DESC
  `).all(schedule.template_id);

  res.json(runs.map(r => ({
    id: r.id,
    templateId: r.template_id,
    status: r.status,
    pdfPath: r.pdf_path,
    error: r.error,
    emailLog: r.email_log,
    startedAt: r.started_at,
    completedAt: r.completed_at,
  })));
});

function formatSchedule(row) {
  return {
    id: row.id,
    templateId: row.template_id,
    templateName: row.template_name,
    frequency: row.frequency,
    dayOfWeek: row.day_of_week,
    dayOfMonth: row.day_of_month,
    time: row.time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function calculateNextRun(schedule) {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(':').map(Number);
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (schedule.frequency === 'daily') {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (schedule.frequency === 'weekly') {
    const targetDay = schedule.day_of_week;
    const currentDay = now.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0 || (daysUntil === 0 && next <= now)) {
      daysUntil += 7;
    }
    next.setDate(now.getDate() + daysUntil);
  } else if (schedule.frequency === 'monthly') {
    next.setDate(schedule.day_of_month);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next.toISOString();
}

export { calculateNextRun };
export default router;
