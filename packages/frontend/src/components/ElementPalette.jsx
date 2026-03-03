import { useDraggable } from '@dnd-kit/core';

const ELEMENT_TYPES = [
  { type: 'header', label: 'Header', icon: 'H' },
  { type: 'text', label: 'Text Block', icon: 'T' },
  { type: 'bar-chart', label: 'Bar Chart', icon: '\u2593' },
  { type: 'line-chart', label: 'Line Chart', icon: '\u2571' },
  { type: 'table', label: 'Table', icon: '\u2637' },
];

function PaletteItem({ type, label, icon }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { fromPalette: true, type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="palette-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span className="palette-icon">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export default function ElementPalette() {
  return (
    <div className="element-palette">
      <h3>Elements</h3>
      <div className="palette-list">
        {ELEMENT_TYPES.map((et) => (
          <PaletteItem key={et.type} {...et} />
        ))}
      </div>
    </div>
  );
}
