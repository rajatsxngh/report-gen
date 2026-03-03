import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'reportgen.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      elements TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL UNIQUE,
      frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
      day_of_week INTEGER,
      day_of_month INTEGER,
      time TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS run_history (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('completed', 'failed')),
      pdf_path TEXT,
      error TEXT,
      email_log TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );
  `);

  console.log('Database initialized successfully');
}
