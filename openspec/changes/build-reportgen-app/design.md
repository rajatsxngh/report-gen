## Context

This is a greenfield project — no existing codebase. We are building ReportGen, a web application for designing report templates, binding them to data, scheduling recurring runs, and generating PDF output. The PRD specifies React frontend, Node.js/Express backend, SQLite storage, and a monorepo structure. All data sources are mock; email delivery is simulated.

## Goals / Non-Goals

**Goals:**
- Deliver a working end-to-end report generation workflow: design → bind data → schedule → generate PDF → deliver
- Provide a drag-and-drop template builder with chart, table, text, and header elements
- Support recurring schedules with visible run history
- Generate downloadable PDFs rendered from templates + data
- Keep the stack simple and self-contained (no external services)

**Non-Goals:**
- Real email delivery (simulated only)
- Real data source integrations (databases, APIs) — mock data only
- User authentication or multi-tenancy
- Production deployment, CI/CD, or infrastructure setup
- Mobile-optimized UI

## Decisions

### 1. Monorepo structure with npm workspaces

Use a flat monorepo with `packages/frontend` and `packages/backend`. npm workspaces handle cross-package dependencies.

**Why over Turborepo/Nx**: Minimal tooling overhead for a two-package repo. No build orchestration needed at this scale.

### 2. dnd-kit for drag-and-drop

Use `@dnd-kit/core` and `@dnd-kit/sortable` for the template builder.

**Why over react-dnd**: dnd-kit is lighter, has better TypeScript support, and a more modern API. react-beautiful-dnd is unmaintained.

### 3. Recharts for chart rendering

Use Recharts for bar charts, line charts, and any future chart types in templates.

**Why over Chart.js/D3**: Recharts is React-native (component-based), simpler API for standard chart types, and renders to SVG which works well with PDF generation.

### 4. Puppeteer for PDF generation

Render the report as an HTML page on the server side, then use Puppeteer to convert it to PDF.

**Why over pdfkit/jsPDF**: Puppeteer renders the exact same React components (charts, tables, styled text) as the browser preview — no duplicate rendering logic. pdfkit requires manual layout code for every element type.

### 5. SQLite with better-sqlite3

Use `better-sqlite3` for synchronous, embedded database access. Tables: `templates`, `schedules`, `run_history`.

**Why over Prisma/Knex**: Direct SQL with a thin wrapper keeps things simple. No ORM overhead for ~3 tables. Migrations handled as plain SQL scripts.

### 6. REST API design

Standard RESTful endpoints:
- `GET/POST/PUT/DELETE /api/templates` — template CRUD
- `GET/POST/PUT/DELETE /api/schedules` — schedule CRUD
- `POST /api/reports/:id/run` — trigger a report run
- `GET /api/reports/:id/runs` — run history
- `GET /api/reports/:id/runs/:runId/pdf` — download PDF
- `GET /api/data-sources` — list available mock datasets
- `GET /api/data-sources/:id` — get dataset fields and sample data

### 7. Template data model

A template is stored as a JSON document with an ordered list of elements:
```json
{
  "id": "uuid",
  "name": "Monthly Sales Report",
  "elements": [
    { "type": "header", "content": "Sales Summary", "level": 1 },
    { "type": "bar-chart", "dataSourceId": "sales", "xField": "month", "yField": "revenue" },
    { "type": "table", "dataSourceId": "sales", "columns": ["month", "revenue", "units"] },
    { "type": "text", "content": "Generated automatically." }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 8. Scheduler implementation with node-cron

Use `node-cron` to manage in-process scheduled jobs. On server start, load all active schedules from SQLite and register cron jobs.

**Why over Bull/Agenda**: No Redis dependency. For a prototype with simulated workloads, in-process cron is sufficient.

## Risks / Trade-offs

- **Puppeteer server-side weight** → Acceptable for a prototype. In production, would use a headless Chrome pool or a dedicated rendering service.
- **In-process scheduler loses state on restart** → Mitigated by reloading all schedules from SQLite on startup. No jobs are lost, just delayed until restart.
- **SQLite concurrency limits** → Not a concern for single-user prototype. If scaling needed, swap to PostgreSQL.
- **Mock data only** → By design. Data connector interface is abstracted so real sources could be plugged in later.
- **No auth** → Acceptable for prototype scope. All endpoints are open.
