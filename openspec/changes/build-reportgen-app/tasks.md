## 1. Project Setup

- [ ] 1.1 Initialize monorepo with npm workspaces, create `packages/frontend` and `packages/backend` directories, add root `package.json`
- [ ] 1.2 Set up React frontend with Vite in `packages/frontend`, install dependencies (react, react-dom, react-router-dom, @dnd-kit/core, @dnd-kit/sortable, recharts)
- [ ] 1.3 Set up Express backend in `packages/backend`, install dependencies (express, better-sqlite3, node-cron, puppeteer, cors, uuid)
- [ ] 1.4 Create SQLite schema migration script with tables: `templates`, `schedules`, `run_history`; add startup migration logic

## 2. Mock Data Sources

- [ ] 2.1 Create mock dataset files (sales, user-metrics, inventory) with static JSON data and schema definitions
- [ ] 2.2 Implement `GET /api/data-sources` endpoint to list available datasets with their schemas
- [ ] 2.3 Implement `GET /api/data-sources/:id` endpoint to return schema and rows for a specific dataset

## 3. Template CRUD API

- [ ] 3.1 Implement `POST /api/templates` to create a new template with name and empty elements array
- [ ] 3.2 Implement `GET /api/templates` to list all templates
- [ ] 3.3 Implement `GET /api/templates/:id` to get a single template with all elements
- [ ] 3.4 Implement `PUT /api/templates/:id` to update template name and elements
- [ ] 3.5 Implement `DELETE /api/templates/:id` to delete a template and its associated schedule and run history

## 4. Template Builder Frontend

- [ ] 4.1 Build the template builder page layout: element palette (left), canvas (center), property panel (right)
- [ ] 4.2 Implement drag-and-drop from palette to canvas using @dnd-kit (support bar-chart, line-chart, table, text, header element types)
- [ ] 4.3 Implement element reordering within the canvas via drag-and-drop
- [ ] 4.4 Implement element selection and property panel that displays editable properties per element type
- [ ] 4.5 Implement data binding controls in property panel: data source dropdown, field selectors (populated from `/api/data-sources`)
- [ ] 4.6 Implement live preview for chart elements using Recharts (render bound data in the canvas)
- [ ] 4.7 Implement live preview for table elements (render bound data rows in the canvas)
- [ ] 4.8 Implement element deletion from canvas
- [ ] 4.9 Wire up Save/Load: save template to backend on "Save", load template from backend when opening existing template

## 5. Schedule Management

- [ ] 5.1 Implement `POST /api/schedules` to create a schedule (templateId, frequency, dayOfWeek/dayOfMonth, time)
- [ ] 5.2 Implement `GET /api/schedules` to list all schedules with next run time
- [ ] 5.3 Implement `PUT /api/schedules/:id` to update schedule configuration
- [ ] 5.4 Implement `DELETE /api/schedules/:id` to remove a schedule
- [ ] 5.5 Implement node-cron integration: register cron jobs on server start from saved schedules, update on schedule changes
- [ ] 5.6 Build scheduler UI: form for configuring frequency/time, list of upcoming runs, run history log per template

## 6. PDF Generation & Delivery

- [ ] 6.1 Build server-side HTML renderer that takes a template + resolved data and outputs a full HTML page with inline Recharts SVGs and styled tables
- [ ] 6.2 Implement Puppeteer-based PDF conversion: load rendered HTML, export to PDF, save to disk
- [ ] 6.3 Implement `POST /api/reports/:id/run` endpoint to trigger a report run (resolve data, render, generate PDF, log result)
- [ ] 6.4 Implement `GET /api/reports/:id/runs` endpoint to list run history for a template
- [ ] 6.5 Implement `GET /api/reports/:id/runs/:runId/pdf` endpoint to serve the generated PDF file for download
- [ ] 6.6 Handle empty data gracefully: render "No data available" placeholder for elements with no data
- [ ] 6.7 Implement simulated email delivery: log email details (recipient, subject, timestamp) to run history when email is configured

## 7. Report Dashboard

- [ ] 7.1 Build dashboard page listing all templates with schedule status, last run status, and timestamps
- [ ] 7.2 Implement "Run Now" quick action on dashboard that triggers `POST /api/reports/:id/run` and updates status on completion
- [ ] 7.3 Implement "Edit" quick action that navigates to the template builder with the selected template
- [ ] 7.4 Implement "Delete" quick action with confirmation dialog that removes template, schedule, and run history
- [ ] 7.5 Implement empty state for dashboard when no templates exist
- [ ] 7.6 Implement status auto-refresh after user actions (update run status without full page reload)

## 8. Navigation & Integration

- [ ] 8.1 Set up React Router with routes: `/` (dashboard), `/templates/new` (new template), `/templates/:id` (edit template), `/templates/:id/schedule` (schedule config)
- [ ] 8.2 Add top-level navigation bar with links to Dashboard and New Template
- [ ] 8.3 Wire frontend API calls to backend using fetch with a configurable base URL
- [ ] 8.4 Add CORS middleware to Express for local development
- [ ] 8.5 Add npm scripts for `dev` (concurrent frontend + backend), `build`, and `start`
