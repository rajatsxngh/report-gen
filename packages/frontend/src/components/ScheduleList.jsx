const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatFrequency(schedule) {
  if (schedule.frequency === 'daily') return 'Daily';
  if (schedule.frequency === 'weekly') return `Weekly on ${DAYS_OF_WEEK[schedule.dayOfWeek]}`;
  if (schedule.frequency === 'monthly') return `Monthly on day ${schedule.dayOfMonth}`;
  return schedule.frequency;
}

function formatNextRun(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ScheduleList({ schedules, onEdit, onDelete, onViewHistory }) {
  if (schedules.length === 0) {
    return (
      <div style={styles.empty}>
        No schedules configured yet. Create one to get started.
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {schedules.map(schedule => (
        <div key={schedule.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.templateName}>{schedule.templateName}</div>
              <div style={styles.frequency}>{formatFrequency(schedule)} at {schedule.time}</div>
            </div>
            <div style={styles.nextRun}>
              <span style={styles.nextRunLabel}>Next run:</span>
              <span>{formatNextRun(schedule.nextRunTime)}</span>
            </div>
          </div>
          <div style={styles.cardActions}>
            <button onClick={() => onEdit(schedule)} style={styles.editBtn}>Edit</button>
            <button onClick={() => onViewHistory(schedule)} style={styles.historyBtn}>History</button>
            <button onClick={() => onDelete(schedule.id)} style={styles.deleteBtn}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  card: {
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '1rem',
    background: '#fff',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  templateName: {
    fontWeight: '600',
    fontSize: '1rem',
    color: '#333',
  },
  frequency: {
    fontSize: '0.875rem',
    color: '#666',
    marginTop: '0.25rem',
  },
  nextRun: {
    textAlign: 'right',
    fontSize: '0.875rem',
    color: '#555',
  },
  nextRunLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '0.125rem',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
    borderTop: '1px solid #eee',
    paddingTop: '0.75rem',
  },
  editBtn: {
    padding: '0.375rem 0.75rem',
    background: '#0d6efd',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  historyBtn: {
    padding: '0.375rem 0.75rem',
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  deleteBtn: {
    padding: '0.375rem 0.75rem',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#888',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },
};
