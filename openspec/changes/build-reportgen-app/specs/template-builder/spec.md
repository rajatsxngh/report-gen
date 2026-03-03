## ADDED Requirements

### Requirement: User can create a new template
The system SHALL allow users to create a new blank report template from the dashboard or template builder. Each template SHALL have a unique name and an empty canvas.

#### Scenario: Create blank template
- **WHEN** user clicks "New Template" and enters a name
- **THEN** system creates a template with the given name and an empty element list, and opens it in the template builder

### Requirement: User can add elements to a template via drag-and-drop
The system SHALL provide a palette of element types (bar chart, line chart, table, text block, header) that users can drag onto the report canvas. Elements SHALL appear in the canvas in the order they are dropped.

#### Scenario: Drag a bar chart element onto the canvas
- **WHEN** user drags a "Bar Chart" element from the palette onto the canvas
- **THEN** the canvas displays a new bar chart element placeholder at the drop position

#### Scenario: Drag a table element onto the canvas
- **WHEN** user drags a "Table" element from the palette onto the canvas
- **THEN** the canvas displays a new table element placeholder at the drop position

### Requirement: User can reorder elements on the canvas
The system SHALL allow users to drag elements within the canvas to reorder them. The final element order SHALL determine the layout order in the generated report.

#### Scenario: Move an element from position 3 to position 1
- **WHEN** user drags an element from the third position and drops it at the first position
- **THEN** the element moves to position 1 and other elements shift down accordingly

### Requirement: User can configure element properties
The system SHALL allow users to select an element on the canvas and edit its properties in a side panel. Properties vary by element type:
- **Header**: text content, heading level (H1–H3)
- **Text block**: text content
- **Bar chart**: data source, x-axis field, y-axis field, chart title
- **Line chart**: data source, x-axis field, y-axis field, chart title
- **Table**: data source, visible columns

#### Scenario: Configure a bar chart's data binding
- **WHEN** user selects a bar chart element and sets data source to "sales", x-field to "month", y-field to "revenue"
- **THEN** the element preview updates to show the bar chart rendered with the selected data

#### Scenario: Edit header text
- **WHEN** user selects a header element and changes text to "Q1 Sales Report"
- **THEN** the header element on the canvas updates to display "Q1 Sales Report"

### Requirement: User can remove elements from the canvas
The system SHALL allow users to delete an element from the canvas.

#### Scenario: Delete an element
- **WHEN** user selects an element and clicks the delete action
- **THEN** the element is removed from the canvas and remaining elements re-flow

### Requirement: User can save a template
The system SHALL persist template changes to the backend when the user saves. The saved template SHALL include all elements with their configuration and order.

#### Scenario: Save a template with multiple elements
- **WHEN** user clicks "Save" on a template with 3 configured elements
- **THEN** the system persists the template and displays a success confirmation

### Requirement: User can load a saved template
The system SHALL allow users to open a previously saved template for editing. The template builder SHALL restore all elements in their saved order with their configured properties.

#### Scenario: Open an existing template
- **WHEN** user selects "Monthly Sales Report" from the template list
- **THEN** the template builder opens with all previously saved elements and their configurations intact
