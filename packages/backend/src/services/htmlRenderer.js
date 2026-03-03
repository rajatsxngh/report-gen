/**
 * Server-side HTML renderer for report templates.
 * Takes a template + resolved data map and outputs a full HTML page
 * with inline SVG charts and styled tables.
 */

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderNoData() {
  return `<div class="no-data">No data available</div>`;
}

function renderHeader(element) {
  const level = element.level || 1;
  const tag = `h${Math.min(Math.max(level, 1), 6)}`;
  return `<${tag}>${escapeHtml(element.content)}</${tag}>`;
}

function renderText(element) {
  return `<p class="text-element">${escapeHtml(element.content)}</p>`;
}

function renderTable(element, rows) {
  if (!rows || rows.length === 0) {
    return renderNoData();
  }

  const columns = element.columns || Object.keys(rows[0]);
  const headerCells = columns.map((col) => `<th>${escapeHtml(col)}</th>`).join('');
  const bodyRows = rows
    .map((row) => {
      const cells = columns.map((col) => `<td>${escapeHtml(row[col])}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
    <table class="report-table">
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
}

function renderBarChart(element, rows) {
  if (!rows || rows.length === 0) {
    return renderNoData();
  }

  const xField = element.xField;
  const yField = element.yField;
  if (!xField || !yField) return renderNoData();

  const values = rows.map((r) => Number(r[yField]) || 0);
  const labels = rows.map((r) => String(r[xField] || ''));
  const maxValue = Math.max(...values, 1);

  const chartWidth = 600;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const barWidth = Math.max(innerWidth / values.length - 8, 4);

  const bars = values
    .map((val, i) => {
      const barHeight = (val / maxValue) * innerHeight;
      const x = padding.left + (innerWidth / values.length) * i + 4;
      const y = padding.top + innerHeight - barHeight;
      return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#4f86c6" rx="2"/>`;
    })
    .join('');

  const xLabels = labels
    .map((label, i) => {
      const x = padding.left + (innerWidth / values.length) * i + barWidth / 2 + 4;
      const y = padding.top + innerHeight + 20;
      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="11" fill="#666">${escapeHtml(label)}</text>`;
    })
    .join('');

  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((frac) => {
      const y = padding.top + innerHeight * (1 - frac);
      const val = Math.round(maxValue * frac);
      return `
        <line x1="${padding.left}" y1="${y}" x2="${chartWidth - padding.right}" y2="${y}" stroke="#eee" stroke-width="1"/>
        <text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#999">${val}</text>
      `;
    })
    .join('');

  const title = element.title ? `<text x="${chartWidth / 2}" y="14" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">${escapeHtml(element.title)}</text>` : '';

  return `
    <div class="chart-container">
      <svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg">
        ${title}
        ${gridLines}
        ${bars}
        ${xLabels}
      </svg>
    </div>
  `;
}

function renderLineChart(element, rows) {
  if (!rows || rows.length === 0) {
    return renderNoData();
  }

  const xField = element.xField;
  const yField = element.yField;
  if (!xField || !yField) return renderNoData();

  const values = rows.map((r) => Number(r[yField]) || 0);
  const labels = rows.map((r) => String(r[xField] || ''));
  const maxValue = Math.max(...values, 1);

  const chartWidth = 600;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const points = values.map((val, i) => {
    const x = padding.left + (innerWidth / Math.max(values.length - 1, 1)) * i;
    const y = padding.top + innerHeight - (val / maxValue) * innerHeight;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const dots = points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#4f86c6"/>`).join('');

  const xLabels = labels
    .map((label, i) => {
      const x = padding.left + (innerWidth / Math.max(values.length - 1, 1)) * i;
      const y = padding.top + innerHeight + 20;
      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="11" fill="#666">${escapeHtml(label)}</text>`;
    })
    .join('');

  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((frac) => {
      const y = padding.top + innerHeight * (1 - frac);
      const val = Math.round(maxValue * frac);
      return `
        <line x1="${padding.left}" y1="${y}" x2="${chartWidth - padding.right}" y2="${y}" stroke="#eee" stroke-width="1"/>
        <text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#999">${val}</text>
      `;
    })
    .join('');

  const title = element.title ? `<text x="${chartWidth / 2}" y="14" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">${escapeHtml(element.title)}</text>` : '';

  return `
    <div class="chart-container">
      <svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg">
        ${title}
        ${gridLines}
        <path d="${linePath}" fill="none" stroke="#4f86c6" stroke-width="2"/>
        ${dots}
        ${xLabels}
      </svg>
    </div>
  `;
}

function renderElement(element, dataMap) {
  const type = element.type;
  const rows = element.dataSourceId ? dataMap[element.dataSourceId] || [] : [];

  switch (type) {
    case 'header':
      return renderHeader(element);
    case 'text':
      return renderText(element);
    case 'table':
      return renderTable(element, rows);
    case 'bar-chart':
      return renderBarChart(element, rows);
    case 'line-chart':
      return renderLineChart(element, rows);
    default:
      return `<div class="unknown-element">Unknown element type: ${escapeHtml(type)}</div>`;
  }
}

/**
 * Render a full HTML page from a template and resolved data.
 * @param {object} template - Template object with name and elements array
 * @param {object} dataMap - Map of dataSourceId → rows array
 * @returns {string} Full HTML page string
 */
export function renderReportHtml(template, dataMap) {
  const elements = JSON.parse(template.elements || '[]');
  const body = elements.map((el) => renderElement(el, dataMap)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(template.name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1, h2, h3, h4, h5, h6 { margin: 24px 0 12px 0; color: #1a1a1a; }
    h1 { font-size: 28px; border-bottom: 2px solid #4f86c6; padding-bottom: 8px; }
    h2 { font-size: 22px; }
    h3 { font-size: 18px; }
    .text-element { margin: 12px 0; line-height: 1.6; color: #555; }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 14px;
    }
    .report-table th {
      background: #4f86c6;
      color: white;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
    }
    .report-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    .report-table tbody tr:nth-child(even) { background: #f8f9fa; }
    .report-table tbody tr:hover { background: #e8f0fe; }
    .chart-container { margin: 20px 0; text-align: center; }
    .no-data {
      padding: 40px;
      text-align: center;
      color: #999;
      font-style: italic;
      background: #f8f9fa;
      border: 1px dashed #ddd;
      border-radius: 4px;
      margin: 16px 0;
    }
    .unknown-element {
      padding: 12px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      color: #856404;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}
