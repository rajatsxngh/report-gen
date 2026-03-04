export default function PropertyPanel({
  element,
  dataSources,
  dataSourceSchemas,
  onUpdate,
}) {
  if (!element) {
    return (
      <div className="property-panel">
        <h3>Properties</h3>
        <p className="property-hint">Select an element to edit its properties</p>
      </div>
    );
  }

  const currentSchema = element.dataSourceId
    ? dataSourceSchemas[element.dataSourceId]
    : null;

  const fields = currentSchema?.schema || [];

  const handleChange = (key, value) => {
    onUpdate(element.id, { [key]: value });
  };

  const renderHeaderProperties = () => (
    <>
      <label className="prop-label">
        Content
        <input
          type="text"
          value={element.content || ''}
          onChange={(e) => handleChange('content', e.target.value)}
        />
      </label>
      <label className="prop-label">
        Heading Level
        <select
          value={element.level || 1}
          onChange={(e) => handleChange('level', Number(e.target.value))}
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
      </label>
    </>
  );

  const renderTextProperties = () => (
    <label className="prop-label">
      Content
      <textarea
        value={element.content || ''}
        onChange={(e) => handleChange('content', e.target.value)}
        rows={4}
      />
    </label>
  );

  const renderChartProperties = () => (
    <>
      <label className="prop-label">
        Chart Title
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </label>
      <label className="prop-label">
        Data Source
        <select
          value={element.dataSourceId || ''}
          onChange={(e) => handleChange('dataSourceId', e.target.value || '')}
        >
          <option value="">Select data source...</option>
          {dataSources.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name}
            </option>
          ))}
        </select>
      </label>
      {element.dataSourceId && (
        <>
          <label className="prop-label">
            X-Axis Field
            <select
              value={element.xField || ''}
              onChange={(e) => handleChange('xField', e.target.value || '')}
            >
              <option value="">Select field...</option>
              {fields.map((f) => (
                <option key={f.field} value={f.field}>
                  {f.field} ({f.type})
                </option>
              ))}
            </select>
          </label>
          <label className="prop-label">
            Y-Axis Field
            <select
              value={element.yField || ''}
              onChange={(e) => handleChange('yField', e.target.value || '')}
            >
              <option value="">Select field...</option>
              {fields.filter((f) => f.type === 'number').map((f) => (
                <option key={f.field} value={f.field}>
                  {f.field}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
    </>
  );

  const renderTableProperties = () => (
    <>
      <label className="prop-label">
        Data Source
        <select
          value={element.dataSourceId || ''}
          onChange={(e) => handleChange('dataSourceId', e.target.value || '')}
        >
          <option value="">Select data source...</option>
          {dataSources.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name}
            </option>
          ))}
        </select>
      </label>
      {element.dataSourceId && fields.length > 0 && (
        <fieldset className="prop-fieldset">
          <legend>Visible Columns</legend>
          {fields.map((f) => {
            const checked = (element.columns || []).includes(f.field);
            return (
              <label key={f.field} className="prop-checkbox">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const cols = element.columns || [];
                    const next = checked
                      ? cols.filter((c) => c !== f.field)
                      : [...cols, f.field];
                    handleChange('columns', next);
                  }}
                />
                {f.field} ({f.type})
              </label>
            );
          })}
        </fieldset>
      )}
    </>
  );

  const renderProperties = () => {
    switch (element.type) {
      case 'header':
        return renderHeaderProperties();
      case 'text':
        return renderTextProperties();
      case 'bar-chart':
      case 'line-chart':
        return renderChartProperties();
      case 'table':
        return renderTableProperties();
      default:
        return <p>No properties available</p>;
    }
  };

  return (
    <div className="property-panel">
      <h3>Properties</h3>
      <div className="property-type-badge">{element.type}</div>
      <div className="property-fields">{renderProperties()}</div>
    </div>
  );
}
