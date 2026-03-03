import { useState, useEffect } from 'react';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export default function ScheduleForm({ templates, schedule, onSubmit, onCancel }) {
  const [templateId, setTemplateId] = useState(schedule?.templateId || '');
  const [frequency, setFrequency] = useState(schedule?.frequency || 'daily');
  const [dayOfWeek, setDayOfWeek] = useState(schedule?.dayOfWeek ?? 1);
  const [dayOfMonth, setDayOfMonth] = useState(schedule?.dayOfMonth ?? 1);
  const [time, setTime] = useState(schedule?.time || '09:00');
  const [error, setError] = useState('');

  const isEditing = !!schedule;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const data = { frequency, time };
    if (!isEditing) {
      if (!templateId) {
        setError('Please select a template');
        return;
      }
      data.templateId = templateId;
    }
    if (frequency === 'weekly') data.dayOfWeek = Number(dayOfWeek);
    if (frequency === 'monthly') data.dayOfMonth = Number(dayOfMonth);

    onSubmit(data);
  }

  // Filter out templates that already have schedules (unless editing)
  const availableTemplates = isEditing
    ? templates
    : templates.filter(t => !t.hasSchedule);

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.heading}>{isEditing ? 'Edit Schedule' : 'Create Schedule'}</h3>

      {error && <div style={styles.error}>{error}</div>}

      {!isEditing && (
        <div style={styles.field}>
          <label style={styles.label}>Template</label>
          <select
            value={templateId}
            onChange={e => setTemplateId(e.target.value)}
            style={styles.input}
          >
            <option value="">Select a template...</option>
            {availableTemplates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      <div style={styles.field}>
        <label style={styles.label}>Frequency</label>
        <select
          value={frequency}
          onChange={e => setFrequency(e.target.value)}
          style={styles.input}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {frequency === 'weekly' && (
        <div style={styles.field}>
          <label style={styles.label}>Day of Week</label>
          <select
            value={dayOfWeek}
            onChange={e => setDayOfWeek(e.target.value)}
            style={styles.input}
          >
            {DAYS_OF_WEEK.map((day, i) => (
              <option key={i} value={i}>{day}</option>
            ))}
          </select>
        </div>
      )}

      {frequency === 'monthly' && (
        <div style={styles.field}>
          <label style={styles.label}>Day of Month</label>
          <select
            value={dayOfMonth}
            onChange={e => setDayOfMonth(e.target.value)}
            style={styles.input}
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      <div style={styles.field}>
        <label style={styles.label}>Time</label>
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.actions}>
        <button type="submit" style={styles.submitBtn}>
          {isEditing ? 'Update' : 'Create'} Schedule
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={styles.cancelBtn}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

const styles = {
  form: {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  heading: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    color: '#333',
  },
  field: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: '600',
    fontSize: '0.875rem',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '0.875rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  submitBtn: {
    padding: '0.5rem 1rem',
    background: '#0d6efd',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  error: {
    background: '#f8d7da',
    color: '#842029',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
};
