## ADDED Requirements

### Requirement: System renders a template with data into PDF
The system SHALL render a saved template by resolving all data bindings and producing a PDF document. The PDF SHALL contain all elements in their configured order with actual data.

#### Scenario: Generate PDF for a template with a chart and table
- **WHEN** a report run is triggered for a template containing a bar chart and a table
- **THEN** the system produces a PDF where the bar chart displays the bound data visually and the table shows the bound data rows

### Requirement: User can manually trigger a report run
The system SHALL allow users to trigger an immediate report run from the dashboard or template view, independent of any schedule.

#### Scenario: Run report manually
- **WHEN** user clicks "Run Now" on a template from the dashboard
- **THEN** the system generates the PDF and makes it available for download within the run history

### Requirement: User can download a generated PDF
The system SHALL allow users to download any previously generated PDF from the run history.

#### Scenario: Download a completed report
- **WHEN** user clicks the download link on a completed run
- **THEN** the browser downloads the PDF file

### Requirement: System supports simulated email delivery
The system SHALL allow users to configure an email address for a report. When a report runs, the system SHALL log that a simulated email was sent (including recipient, subject, and timestamp) instead of actually sending an email.

#### Scenario: Simulated email on scheduled run
- **WHEN** a report with email delivery configured completes a run
- **THEN** the system logs an entry: "Email simulated to user@example.com at [timestamp]" and marks the delivery as "sent (simulated)"

### Requirement: PDF generation handles missing or invalid data gracefully
The system SHALL produce a PDF even if a data source returns empty results. Elements with no data SHALL render with a "No data available" placeholder.

#### Scenario: Generate PDF with empty data source
- **WHEN** a report run is triggered and the bound data source returns zero rows
- **THEN** the PDF renders with "No data available" in place of the chart or table
