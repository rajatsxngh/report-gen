import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ScheduleForm from '../components/ScheduleForm.jsx';
import RunHistory from '../components/RunHistory.jsx';
import {
  fetchTemplate,
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  fetchRunHistory,
} from '../api.js';

export default function TemplateSchedulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [tmpl, allSchedules] = await Promise.all([
        fetchTemplate(id),
        fetchSchedules(),
      ]);
      setTemplate(tmpl);
      const match = allSchedules.find(s => s.templateId === id);
      setSchedule(match || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreate(data) {
    try {
      setError('');
      await createSchedule({ ...data, templateId: id });
      setEditing(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(data) {
    try {
      setError('');
      await updateSchedule(schedule.id, data);
      setEditing(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to remove this schedule?')) return;
    try {
      setError('');
      await deleteSchedule(schedule.id);
      setSchedule(null);
      setEditing(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewHistory() {
    if (!schedule) return;
    try {
      setError('');
      const runs = await fetchRunHistory(schedule.id);
      setHistoryData({ runs, scheduleName: template.name });
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading schedule configuration...</div>;
  }

  if (!template) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Template not found.</div>
        <Link to="/" style={styles.backLink}>Back to Dashboard</Link>
      </div>
    );
  }

  const fmtSchedule = schedule
    ? `${schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} at ${schedule.time}`
    : null;

  return (
    <div style={styles.container}>
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.backLink}>Dashboard</Link>
        <span style={styles.sep}>/</span>
        <Link to={`/templates/${id}`} style={styles.backLink}>{template.name}</Link>
        <span style={styles.sep}>/</span>
        <span>Schedule</span>
      </div>

      <h2 style={styles.title}>Schedule: {template.name}</h2>

      {error && <div style={styles.error}>{error}</div>}

      {!schedule && !editing && (
        <div style={styles.emptyState}>
          <p>No schedule configured for this template.</p>
          <button onClick={() => setEditing(true)} style={styles.primaryBtn}>
            + Create Schedule
          </button>
        </div>
      )}

      {!schedule && editing && (
        <ScheduleForm
          templates={[{ id, name: template.name, hasSchedule: false }]}
          onSubmit={handleCreate}
          onCancel={() => setEditing(false)}
        />
      )}

      {schedule && !editing && (
        <div style={styles.scheduleCard}>
          <div style={styles.scheduleInfo}>
            <div style={styles.scheduleLabel}>Current Schedule</div>
            <div style={styles.scheduleDetail}>{fmtSchedule}</div>
          </div>
          <div style={styles.scheduleActions}>
            <button onClick={() => setEditing(true)} style={styles.editBtn}>Edit</button>
            <button onClick={handleViewHistory} style={styles.historyBtn}>View History</button>
            <button onClick={handleDelete} style={styles.deleteBtn}>Remove</button>
          </div>
        </div>
      )}

      {schedule && editing && (
        <ScheduleForm
          templates={[{ id, name: template.name, hasSchedule: true }]}
          schedule={schedule}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      )}

      {historyData && (
        <RunHistory
          runs={historyData.runs}
          scheduleName={historyData.scheduleName}
          onClose={() => setHistoryData(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '1.5rem',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  backLink: {
    color: '#2563eb',
    textDecoration: 'none',
  },
  sep: {
    color: '#9ca3af',
  },
  title: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.5rem',
    color: '#111827',
  },
  error: {
    background: '#f8d7da',
    color: '#842029',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px dashed #d1d5db',
    color: '#6b7280',
  },
  primaryBtn: {
    marginTop: '0.75rem',
    padding: '0.5rem 1rem',
    background: '#198754',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  scheduleCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  scheduleInfo: {},
  scheduleLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  scheduleDetail: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#111827',
  },
  scheduleActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    padding: '0.375rem 0.75rem',
    background: '#0d6efd',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  historyBtn: {
    padding: '0.375rem 0.75rem',
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  deleteBtn: {
    padding: '0.375rem 0.75rem',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
};
