const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Schedules API
export function fetchSchedules() {
  return request('/schedules');
}

export function createSchedule(data) {
  return request('/schedules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateSchedule(id, data) {
  return request(`/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteSchedule(id) {
  return request(`/schedules/${id}`, { method: 'DELETE' });
}

export function fetchRunHistory(scheduleId) {
  return request(`/schedules/${scheduleId}/history`);
}

// Templates API (for schedule form dropdown)
export function fetchTemplates() {
  return request('/templates');
}
