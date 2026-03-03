## ADDED Requirements

### Requirement: System provides built-in mock datasets
The system SHALL include at least three built-in mock datasets: sales data, user metrics, and inventory. Each dataset SHALL have a defined schema (field names and types) and sample rows.

#### Scenario: List available datasets
- **WHEN** user views the data source selection in the template builder
- **THEN** the system displays "Sales Data", "User Metrics", and "Inventory" as available data sources

### Requirement: Each dataset exposes its schema
The system SHALL expose the field names and types for each mock dataset so that the template builder can present them for binding.

#### Scenario: View fields for sales dataset
- **WHEN** user selects "Sales Data" as a data source for a chart element
- **THEN** the system displays available fields (e.g., month, revenue, units, region) for axis/column binding

### Requirement: Template elements bind to specific data fields
The system SHALL allow each chart or table element to be bound to a specific data source and specific fields within that source. The binding SHALL determine which data is rendered when the report runs.

#### Scenario: Bind a line chart to user metrics
- **WHEN** user configures a line chart with data source "User Metrics", x-field "date", y-field "active_users"
- **THEN** the element stores this binding and the preview renders using the user metrics data

### Requirement: Data connector API returns dataset contents
The backend SHALL provide an API endpoint that returns the full contents of a mock dataset by ID. This data SHALL be used at render time when generating reports.

#### Scenario: Fetch sales data via API
- **WHEN** the system requests `GET /api/data-sources/sales`
- **THEN** the API returns the schema and all rows of the sales mock dataset

### Requirement: Mock data is deterministic
The mock datasets SHALL return the same data on every request. Data SHALL NOT be randomly generated at runtime.

#### Scenario: Fetch same dataset twice
- **WHEN** the system requests the sales dataset twice in sequence
- **THEN** both responses contain identical data
