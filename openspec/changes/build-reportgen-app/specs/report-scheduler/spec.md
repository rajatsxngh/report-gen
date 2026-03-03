## ADDED Requirements

### Requirement: User can create a schedule for a template
The system SHALL allow users to attach a recurring schedule to a saved template. Schedule options SHALL include frequency (daily, weekly, monthly) and time of day.

#### Scenario: Create a weekly schedule
- **WHEN** user selects a template and configures a schedule for "weekly" on "Monday" at "09:00"
- **THEN** the system saves the schedule and it appears in the upcoming runs list

#### Scenario: Create a daily schedule
- **WHEN** user configures a schedule for "daily" at "06:00"
- **THEN** the system saves the schedule and shows the next run time as tomorrow at 06:00

### Requirement: User can edit an existing schedule
The system SHALL allow users to modify the frequency or time of an existing schedule.

#### Scenario: Change frequency from daily to monthly
- **WHEN** user edits a schedule and changes frequency from "daily" to "monthly" on the "1st"
- **THEN** the system updates the schedule and recalculates upcoming runs

### Requirement: User can delete a schedule
The system SHALL allow users to remove a schedule from a template. Deleting a schedule SHALL stop future runs but preserve past run history.

#### Scenario: Delete a schedule
- **WHEN** user deletes the schedule for "Monthly Sales Report"
- **THEN** no future runs are scheduled, and past run records remain visible

### Requirement: System displays upcoming scheduled runs
The system SHALL show a list of upcoming scheduled runs, including the template name, next run time, and frequency.

#### Scenario: View upcoming runs
- **WHEN** user navigates to the scheduler view
- **THEN** the system displays all scheduled reports with their next run time sorted chronologically

### Requirement: System executes reports on schedule
The system SHALL automatically trigger a report run at the configured time. The run SHALL generate a PDF and log the result.

#### Scenario: Scheduled run triggers at configured time
- **WHEN** the scheduled time for a weekly report is reached
- **THEN** the system generates the PDF report and creates a run history entry with status "completed"

### Requirement: System logs run history
The system SHALL maintain a log of all past report runs, including timestamp, status (completed, failed), and a link to the generated PDF.

#### Scenario: View run history for a template
- **WHEN** user views the run history for "Monthly Sales Report"
- **THEN** the system displays a chronological list of past runs with timestamps, statuses, and download links
