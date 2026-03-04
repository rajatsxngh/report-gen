import { useState, useEffect, useCallback } from 'react';
import ScheduleForm from '../components/ScheduleForm.jsx';
import ScheduleList from '../components/ScheduleList.jsx';
import RunHistory from '../components/RunHistory.jsx';
import {
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  fetchRunHistory,
  fetchTemplates,
} from '../api.js';

export default function SchedulerPage() {
  const [schedules, setSchedules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [historyData, setHistoryData] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [schedulesData, templatesData] = await Promise.all([
        fetchSchedules(),
        fetchTemplates().catch(() => []),
      ]);

      // Mark templates that already have schedules
      const scheduledTemplateIds = new Set(schedulesData.map(s => s.templateId));
      const enrichedTemplates = templatesData.map(t => ({
        ...t,
        hasSchedule: scheduledTemplateIds.has(t.id),
      }));

      setSchedules(schedulesData);
      setTemplates(enrichedTemplates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreate(data) {
    try {
      setError('');
      await createSchedule(data);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(data) {
    try {
      setError('');
      await updateSchedule(editingSchedule.id, data);
      setEditingSchedule(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this schedule? Past run history will be preserved.')) {
      return;
    }
    try {
      setError('');
      await deleteSchedule(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(schedule) {
    setEditingSchedule(schedule);
    setShowForm(false);
  }

  async function handleViewHistory(schedule) {
    try {
      setError('');
      const runs = await fetchRunHistory(schedule.id);
      setHistoryData({ runs, scheduleName: schedule.templateName });
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading schedules...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Schedules</h2>
        {!showForm && !editingSchedule && (
          <button onClick={() => setShowForm(true)} style={styles.addBtn}>
            + New Schedule
          </button>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <ScheduleForm
          templates={templates}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingSchedule && (
        <ScheduleForm
          templates={templates}
          schedule={editingSchedule}
          onSubmit={handleUpdate}
          onCancel={() => setEditingSchedule(null)}
        />
      )}

      {historyData && (
        <RunHistory
          runs={historyData.runs}
          scheduleName={historyData.scheduleName}
          onClose={() => setHistoryData(null)}
        />
      )}

      <ScheduleList
        schedules={schedules}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewHistory={handleViewHistory}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#333',
  },
  addBtn: {
    padding: '0.5rem 1rem',
    background: '#198754',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
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
};
