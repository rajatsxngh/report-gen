import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import ElementPalette from '../components/ElementPalette';
import Canvas from '../components/Canvas';
import PropertyPanel from '../components/PropertyPanel';
import {
  fetchTemplate,
  createTemplate,
  saveTemplate,
  fetchDataSources,
  fetchDataSource,
} from '../api';

let nextId = 1;
function generateId() {
  return `el-${Date.now()}-${nextId++}`;
}

function createDefaultElement(type) {
  const base = { id: generateId(), type };
  switch (type) {
    case 'header':
      return { ...base, content: '', level: 1 };
    case 'text':
      return { ...base, content: '' };
    case 'bar-chart':
      return { ...base, dataSourceId: '', xField: '', yField: '', title: '' };
    case 'line-chart':
      return { ...base, dataSourceId: '', xField: '', yField: '', title: '' };
    case 'table':
      return { ...base, dataSourceId: '', columns: [] };
    default:
      return base;
  }
}

export default function TemplateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [templateId, setTemplateId] = useState(id || null);
  const [templateName, setTemplateName] = useState('');
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dataSources, setDataSources] = useState([]);
  const [dataSourceSchemas, setDataSourceSchemas] = useState({});
  const [dataCache, setDataCache] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [activeDragId, setActiveDragId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Load data sources on mount
  useEffect(() => {
    fetchDataSources().then((sources) => {
      setDataSources(sources);
      const schemas = {};
      sources.forEach((s) => {
        schemas[s.id] = s;
      });
      setDataSourceSchemas(schemas);
    }).catch(() => {});
  }, []);

  // Load template if editing existing
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchTemplate(id)
        .then((t) => {
          setTemplateId(t.id);
          setTemplateName(t.name);
          setElements(t.elements || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  // Fetch data for bound data sources
  const fetchBoundData = useCallback(
    async (dataSourceId) => {
      if (!dataSourceId || dataCache[dataSourceId]) return;
      try {
        const data = await fetchDataSource(dataSourceId);
        setDataCache((prev) => ({ ...prev, [dataSourceId]: data }));
      } catch {
        // ignore fetch errors for preview
      }
    },
    [dataCache]
  );

  useEffect(() => {
    const sourceIds = new Set(
      elements.filter((e) => e.dataSourceId).map((e) => e.dataSourceId)
    );
    sourceIds.forEach((dsId) => fetchBoundData(dsId));
  }, [elements, fetchBoundData]);

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const fromPalette = active.data.current?.fromPalette;

    if (fromPalette) {
      const type = active.data.current.type;
      const newElement = createDefaultElement(type);

      // Find insert index
      const overIndex = elements.findIndex((e) => e.id === over.id);
      if (overIndex >= 0) {
        setElements((prev) => {
          const next = [...prev];
          next.splice(overIndex, 0, newElement);
          return next;
        });
      } else {
        // Dropped on canvas zone itself — append
        setElements((prev) => [...prev, newElement]);
      }
      setSelectedId(newElement.id);
    } else {
      // Reorder
      if (active.id !== over.id) {
        setElements((prev) => {
          const oldIndex = prev.findIndex((e) => e.id === active.id);
          const newIndex = prev.findIndex((e) => e.id === over.id);
          if (oldIndex === -1 || newIndex === -1) return prev;
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    }
  };

  const handleSelect = (elId) => {
    setSelectedId(elId);
  };

  const handleDelete = (elId) => {
    setElements((prev) => prev.filter((e) => e.id !== elId));
    if (selectedId === elId) setSelectedId(null);
  };

  const handleUpdateElement = (elId, updates) => {
    setElements((prev) =>
      prev.map((e) => (e.id === elId ? { ...e, ...updates } : e))
    );
  };

  const handleSave = async () => {
    if (!templateName.trim()) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      if (templateId) {
        await saveTemplate(templateId, { name: templateName, elements });
      } else {
        const created = await createTemplate(templateName);
        const saved = await saveTemplate(created.id, { name: templateName, elements });
        setTemplateId(saved.id);
        navigate(`/templates/${saved.id}`, { replace: true });
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  if (loading) {
    return <div className="builder-loading">Loading template...</div>;
  }

  return (
    <div className="template-builder">
      <div className="builder-toolbar">
        <input
          className="template-name-input"
          type="text"
          placeholder="Template name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving || !templateName.trim()}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saveStatus === 'saved' && <span className="save-status success">Saved!</span>}
        {saveStatus === 'error' && <span className="save-status error">Save failed</span>}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="builder-layout">
          <ElementPalette />
          <Canvas
            elements={elements}
            selectedId={selectedId}
            onSelect={handleSelect}
            onDelete={handleDelete}
            dataCache={dataCache}
          />
          <PropertyPanel
            element={selectedElement}
            dataSources={dataSources}
            dataSourceSchemas={dataSourceSchemas}
            onUpdate={handleUpdateElement}
          />
        </div>
        <DragOverlay>
          {activeDragId && activeDragId.startsWith('palette-') ? (
            <div className="drag-overlay-item">
              {activeDragId.replace('palette-', '')}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
