## Why

There is no existing report generation tool in place. Users need a self-service web application to design report templates, bind them to data sources, schedule recurring runs, and receive PDF output — eliminating manual report creation and enabling repeatable, automated reporting workflows.

## What Changes

- Add a drag-and-drop **template builder** for designing reports with charts, tables, text blocks, and headers
- Add a **data connector** system with built-in mock datasets (sales, user metrics, inventory) and field-level binding to template elements
- Add a **scheduler** for configuring recurring report runs (daily, weekly, monthly) with run history and upcoming run visibility
- Add **PDF generation** that renders templates with live data and supports download and simulated email delivery
- Add a **dashboard** home screen showing all reports, schedules, statuses, and quick actions (run, edit, delete)
- Set up a **monorepo** with React frontend, Node.js/Express backend, and SQLite storage

## Capabilities

### New Capabilities
- `template-builder`: Drag-and-drop report template design with chart, table, text, and header elements; save/load templates
- `data-connector`: Mock dataset management and field-level data binding to template elements
- `report-scheduler`: Schedule configuration (daily/weekly/monthly), upcoming run display, and run history log
- `pdf-generation`: Render templates with data into PDF; support download and simulated email delivery
- `report-dashboard`: Home screen listing all reports with status, schedule info, and quick actions

### Modified Capabilities
<!-- No existing capabilities to modify — this is a greenfield project. -->

## Impact

- **New codebase**: Monorepo with `packages/frontend` (React) and `packages/backend` (Node.js/Express)
- **Storage**: SQLite database for templates, schedules, run history
- **Dependencies**: React, Express, a PDF rendering library (e.g., Puppeteer or pdfkit), a drag-and-drop library (e.g., react-dnd or dnd-kit), a charting library (e.g., recharts)
- **APIs**: REST endpoints for templates CRUD, data sources, schedule management, report execution, and PDF retrieval
- **No external integrations**: All data is mock; email delivery is simulated
