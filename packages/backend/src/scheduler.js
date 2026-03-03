import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db.js';

// Map of schedule ID -> cron task
const cronJobs = new Map();

/**
 * Build a cron expression from a schedule record.
 * Format: minute hour dayOfMonth month dayOfWeek
 */
function buildCronExpression(schedule) {
  const [hours, minutes] = schedule.time.split(':').map(Number);

  if (schedule.frequency === 'daily') {
    return `${minutes} ${hours} * * *`;
  } else if (schedule.frequency === 'weekly') {
    return `${minutes} ${hours} * * ${schedule.day_of_week}`;
  } else if (schedule.frequency === 'monthly') {
    return `${minutes} ${hours} ${schedule.day_of_month} * *`;
  }

  throw new Error(`Unknown frequency: ${schedule.frequency}`);
}

/**
 * Execute a scheduled report run for a template.
 * Creates a run_history record and simulates PDF generation.
 */
function executeScheduledRun(templateId) {
  const db = getDb();
  const runId = uuidv4();
  const startedAt = new Date().toISOString();

  try {
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Simulate PDF generation (actual Puppeteer integration is in a separate issue)
    const pdfPath = `data/reports/${templateId}-${Date.now()}.pdf`;

    db.prepare(`
      INSERT INTO run_history (id, template_id, status, pdf_path, email_log, started_at, completed_at)
      VALUES (?, ?, 'completed', ?, ?, ?, datetime('now'))
    `).run(runId, templateId, pdfPath, `Simulated run for template "${template.name}"`, startedAt);

    console.log(`Scheduled run completed: template="${template.name}" runId=${runId}`);
  } catch (err) {
    db.prepare(`
      INSERT INTO run_history (id, template_id, status, error, started_at, completed_at)
      VALUES (?, ?, 'failed', ?, ?, datetime('now'))
    `).run(runId, templateId, err.message, startedAt);

    console.error(`Scheduled run failed: templateId=${templateId} error=${err.message}`);
  }
}

/**
 * Register a single cron job for a schedule.
 */
export function registerCronJob(schedule) {
  // Stop existing job for this schedule if any
  unregisterCronJob(schedule.id);

  const expression = buildCronExpression(schedule);

  if (!cron.validate(expression)) {
    console.error(`Invalid cron expression "${expression}" for schedule ${schedule.id}`);
    return;
  }

  const task = cron.schedule(expression, () => {
    console.log(`Cron triggered for schedule ${schedule.id} (template: ${schedule.template_id})`);
    executeScheduledRun(schedule.template_id);
  });

  cronJobs.set(schedule.id, task);
  console.log(`Registered cron job: schedule=${schedule.id} cron="${expression}"`);
}

/**
 * Unregister (stop) a cron job for a schedule.
 */
export function unregisterCronJob(scheduleId) {
  const existing = cronJobs.get(scheduleId);
  if (existing) {
    existing.stop();
    cronJobs.delete(scheduleId);
    console.log(`Unregistered cron job: schedule=${scheduleId}`);
  }
}

/**
 * Load all schedules from the database and register cron jobs.
 * Called on server startup.
 */
export function loadSchedules() {
  const db = getDb();
  const schedules = db.prepare('SELECT * FROM schedules').all();

  console.log(`Loading ${schedules.length} schedule(s) from database...`);

  for (const schedule of schedules) {
    registerCronJob(schedule);
  }
}

/**
 * Stop all running cron jobs.
 */
export function stopAllJobs() {
  for (const [id, task] of cronJobs) {
    task.stop();
    console.log(`Stopped cron job: schedule=${id}`);
  }
  cronJobs.clear();
}
