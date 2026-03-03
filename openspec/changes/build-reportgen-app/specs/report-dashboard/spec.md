## ADDED Requirements

### Requirement: Dashboard displays all configured reports
The system SHALL display a home screen listing all saved report templates. Each entry SHALL show the template name, schedule status (scheduled or unscheduled), and last run status.

#### Scenario: View dashboard with multiple reports
- **WHEN** user navigates to the dashboard with 3 saved templates
- **THEN** the dashboard lists all 3 templates with their name, schedule info, and last run status

#### Scenario: View dashboard with no reports
- **WHEN** user navigates to the dashboard with no saved templates
- **THEN** the dashboard displays an empty state message prompting the user to create a template

### Requirement: Dashboard shows schedule information per report
Each report entry on the dashboard SHALL display the schedule frequency and the next upcoming run time, or "No schedule" if unscheduled.

#### Scenario: Report with a weekly schedule
- **WHEN** a report has a weekly schedule set for Mondays at 09:00
- **THEN** the dashboard entry shows "Weekly - Next: Monday 09:00"

#### Scenario: Report with no schedule
- **WHEN** a report has no schedule configured
- **THEN** the dashboard entry shows "No schedule"

### Requirement: Dashboard shows last run status
Each report entry SHALL display the status of the most recent run: "Completed", "Failed", or "Never run".

#### Scenario: Report that has been run successfully
- **WHEN** the most recent run for a report completed successfully
- **THEN** the dashboard shows "Completed" with the run timestamp

#### Scenario: Report that has never been run
- **WHEN** a report has no run history
- **THEN** the dashboard shows "Never run"

### Requirement: Dashboard provides quick actions
Each report entry on the dashboard SHALL offer quick action buttons: "Run Now", "Edit", and "Delete".

#### Scenario: Run a report from the dashboard
- **WHEN** user clicks "Run Now" on a report entry
- **THEN** the system triggers an immediate report run and updates the last run status upon completion

#### Scenario: Edit a report from the dashboard
- **WHEN** user clicks "Edit" on a report entry
- **THEN** the system navigates to the template builder with that template loaded

#### Scenario: Delete a report from the dashboard
- **WHEN** user clicks "Delete" on a report entry and confirms the action
- **THEN** the system removes the template, its schedule, and its run history, and the entry disappears from the dashboard

### Requirement: Dashboard auto-refreshes run status
The dashboard SHALL update the last run status of reports without requiring a full page reload, either via polling or after a user-triggered action completes.

#### Scenario: Status updates after manual run
- **WHEN** user clicks "Run Now" and the run completes
- **THEN** the dashboard entry updates from "Never run" to "Completed" with the current timestamp without a page refresh
