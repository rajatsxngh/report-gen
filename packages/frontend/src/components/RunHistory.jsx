function formatDate(isoString) {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RunHistory({ runs, scheduleName, onClose }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.heading}>Run History: {scheduleName}</h3>
        <button onClick={onClose} style={styles.closeBtn}>Close</button>
      </div>

      {runs.length === 0 ? (
        <div style={styles.empty}>No runs recorded yet.</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Started</th>
              <th style={styles.th}>Completed</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Details</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(run => (
              <tr key={run.id}>
                <td style={styles.td}>{formatDate(run.startedAt)}</td>
                <td style={styles.td}>{formatDate(run.completedAt)}</td>
                <td style={styles.td}>
                  <span style={run.status === 'completed' ? styles.statusOk : styles.statusFail}>
                    {run.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {run.status === 'completed' && run.pdfPath && (
                    <span style={styles.detail}>PDF generated</span>
                  )}
                  {run.status === 'failed' && run.error && (
                    <span style={styles.errorText}>{run.error}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    background: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  heading: {
    margin: 0,
    fontSize: '1rem',
    color: '#333',
  },
  closeBtn: {
    padding: '0.375rem 0.75rem',
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '0.5rem',
    borderBottom: '2px solid #dee2e6',
    fontSize: '0.8rem',
    color: '#666',
    fontWeight: '600',
  },
  td: {
    padding: '0.5rem',
    borderBottom: '1px solid #eee',
    fontSize: '0.875rem',
  },
  statusOk: {
    background: '#d1e7dd',
    color: '#0f5132',
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  statusFail: {
    background: '#f8d7da',
    color: '#842029',
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  detail: {
    fontSize: '0.8rem',
    color: '#666',
  },
  errorText: {
    fontSize: '0.8rem',
    color: '#dc3545',
  },
  empty: {
    textAlign: 'center',
    padding: '1.5rem',
    color: '#888',
    fontSize: '0.875rem',
  },
};
