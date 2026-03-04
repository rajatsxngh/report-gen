const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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

// Data Sources API
export function fetchDataSources() {
  return request('/data-sources');
}

export function fetchDataSource(id) {
  return request(`/data-sources/${encodeURIComponent(id)}`);
}

// Templates API
export function fetchTemplates() {
  return request('/templates');
}

export function fetchTemplate(id) {
  return request(`/templates/${encodeURIComponent(id)}`);
}

export function createTemplate(name) {
  return request('/templates', {
    method: 'POST',
    body: JSON.stringify({ name, elements: [] }),
  });
}

export function saveTemplate(id, { name, elements }) {
  return request(`/templates/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ name, elements }),
  });
}

export function deleteTemplate(id) {
  return request(`/templates/${encodeURIComponent(id)}`, { method: 'DELETE' });
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
