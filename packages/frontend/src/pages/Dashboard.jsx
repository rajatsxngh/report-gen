import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchTemplates as apiFetchTemplates,
  deleteTemplate as apiDeleteTemplate,
} from '../api.js';
import './Dashboard.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function formatSchedule(schedule) {
  if (!schedule) return null;
  const freq = schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1);
  const time = schedule.time;

  if (schedule.frequency === 'weekly') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[schedule.day_of_week] || '';
    return `${freq} - ${day} at ${time}`;
  }
  if (schedule.frequency === 'monthly') {
    const dom = schedule.day_of_month;
    const suffix = dom === 1 ? 'st' : dom === 2 ? 'nd' : dom === 3 ? 'rd' : 'th';
    return `${freq} - ${dom}${suffix} at ${time}`;
  }
  return `${freq} at ${time}`;
}

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function Dashboard() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [runningIds, setRunningIds] = useState(new Set());
  const navigate = useNavigate();

  const loadTemplates = useCallback(async () => {
    try {
      const data = await apiFetchTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleRunNow = async (templateId) => {
    setRunningIds(prev => new Set(prev).add(templateId));
    try {
      const res = await fetch(`${API_BASE}/reports/${templateId}/run`, { method: 'POST' });
      if (!res.ok) throw new Error('Run failed');
      await loadTemplates();
    } catch (err) {
      console.error('Run failed:', err);
    } finally {
      setRunningIds(prev => {
        const next = new Set(prev);
        next.delete(templateId);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDeleteTemplate(deleteTarget.id);
      setDeleteTarget(null);
      await loadTemplates();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) {
    return <div className="dashboard"><div className="dashboard-loading">Loading templates...</div></div>;
  }

  if (error) {
    return <div className="dashboard"><div className="dashboard-error">Error: {error}</div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Report Templates</h2>
        <Link to="/templates/new" className="btn-new-template">+ New Template</Link>
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#x1F4CB;</div>
          <h3>No report templates yet</h3>
          <p>Create your first report template to get started with automated report generation.</p>
          <Link to="/templates/new" className="btn-new-template">+ Create Template</Link>
        </div>
      ) : (
        <div className="template-list">
          {templates.map(t => {
            const isRunning = runningIds.has(t.id);
            const scheduleText = formatSchedule(t.schedule);
            const lastRun = t.last_run;

            return (
              <div className="template-card" key={t.id}>
                <div className="template-info">
                  <div className="template-name">{t.name}</div>
                  <div className="template-meta">
                    <span className="meta-item">
                      Schedule: {scheduleText || 'No schedule'}
                    </span>
                    <span className="meta-item">
                      Last run:{' '}
                      {isRunning ? (
                        <span className="status-badge status-running">Running...</span>
                      ) : lastRun ? (
                        <>
                          <span className={`status-badge status-${lastRun.status}`}>
                            {lastRun.status === 'completed' ? 'Completed' : 'Failed'}
                          </span>
                          {' '}{formatTimestamp(lastRun.completed_at || lastRun.started_at)}
                        </>
                      ) : (
                        <span className="status-badge status-never">Never run</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="template-actions">
                  <button
                    className="btn-action run"
                    onClick={() => handleRunNow(t.id)}
                    disabled={isRunning}
                  >
                    {isRunning ? 'Running...' : 'Run Now'}
                  </button>
                  <button
                    className="btn-action edit"
                    onClick={() => navigate(`/templates/${t.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-action schedule"
                    onClick={() => navigate(`/templates/${t.id}/schedule`)}
                  >
                    Schedule
                  </button>
                  <button
                    className="btn-action delete"
                    onClick={() => setDeleteTarget(t)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <div className="confirm-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Delete Template</h3>
            <p>
              Are you sure you want to delete &ldquo;{deleteTarget.name}&rdquo;?
              This will also remove its schedule and all run history. This action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-confirm-delete" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
