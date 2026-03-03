import { useSortable } from '@dnd-kit/sortable';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function HeaderPreview({ element }) {
  const Tag = `h${element.level || 1}`;
  return <Tag className="element-header">{element.content || 'Untitled Header'}</Tag>;
}

function TextPreview({ element }) {
  return <p className="element-text">{element.content || 'Empty text block'}</p>;
}

function BarChartPreview({ element, data }) {
  if (!element.dataSourceId || !element.xField || !element.yField || !data?.length) {
    return <div className="element-placeholder">Bar Chart — configure data binding</div>;
  }
  return (
    <div className="element-chart">
      {element.title && <div className="chart-title">{element.title}</div>}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={element.xField} fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Bar dataKey={element.yField} fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineChartPreview({ element, data }) {
  if (!element.dataSourceId || !element.xField || !element.yField || !data?.length) {
    return <div className="element-placeholder">Line Chart — configure data binding</div>;
  }
  return (
    <div className="element-chart">
      {element.title && <div className="chart-title">{element.title}</div>}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={element.xField} fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Line type="monotone" dataKey={element.yField} stroke="#4f46e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TablePreview({ element, data }) {
  if (!element.dataSourceId || !element.columns?.length || !data?.length) {
    return <div className="element-placeholder">Table — configure data binding</div>;
  }
  return (
    <div className="element-table-wrapper">
      <table className="element-table">
        <thead>
          <tr>
            {element.columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {element.columns.map((col) => (
                <td key={col}>{row[col] != null ? String(row[col]) : ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CanvasElement({ element, isSelected, onSelect, onDelete, data }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const renderPreview = () => {
    switch (element.type) {
      case 'header':
        return <HeaderPreview element={element} />;
      case 'text':
        return <TextPreview element={element} />;
      case 'bar-chart':
        return <BarChartPreview element={element} data={data} />;
      case 'line-chart':
        return <LineChartPreview element={element} data={data} />;
      case 'table':
        return <TablePreview element={element} data={data} />;
      default:
        return <div>Unknown element type</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-element ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      <div className="canvas-element-header">
        <span className="drag-handle" {...attributes} {...listeners}>
          &#x2630;
        </span>
        <span className="element-type-label">{element.type}</span>
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          title="Delete element"
        >
          &times;
        </button>
      </div>
      <div className="canvas-element-body">{renderPreview()}</div>
    </div>
  );
}
