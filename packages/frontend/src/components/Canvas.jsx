import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CanvasElement from './CanvasElement';

export default function Canvas({ elements, selectedId, onSelect, onDelete, dataCache }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });

  return (
    <div className="canvas-panel" onClick={() => onSelect(null)}>
      <div
        ref={setNodeRef}
        className={`canvas-area ${isOver ? 'drag-over' : ''}`}
      >
        {elements.length === 0 ? (
          <div className="canvas-empty">
            Drag elements from the palette to start building your template
          </div>
        ) : (
          <SortableContext
            items={elements.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            {elements.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                isSelected={selectedId === el.id}
                onSelect={onSelect}
                onDelete={onDelete}
                data={el.dataSourceId ? dataCache[el.dataSourceId]?.rows : null}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
