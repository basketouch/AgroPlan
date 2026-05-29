import './DrawingEditor.css'

export default function DrawingEditor({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  snapToGrid,
  onToggleSnapToGrid,
  smoothCurves,
  onToggleSmoothCurves,
  drawingMode,
  pointCount,
  isDrawing
}) {
  return (
    <div className="drawing-editor-toolbar">
      <div className="toolbar-section">
        <span className="toolbar-label">Puntos: {pointCount}</span>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-section">
        <button
          className="toolbar-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Deshacer (Ctrl+Z)"
          aria-label="Deshacer"
        >
          ↶ Deshacer
        </button>
        <button
          className="toolbar-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Rehacer (Ctrl+Shift+Z)"
          aria-label="Rehacer"
        >
          ↷ Rehacer
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-section">
        <button
          className={`toolbar-btn toggle-btn ${snapToGrid ? 'active' : ''}`}
          onClick={onToggleSnapToGrid}
          title={snapToGrid ? 'Desactivar ajuste a cuadrícula' : 'Activar ajuste a cuadrícula (S)'}
          aria-label={snapToGrid ? 'Ajuste a cuadrícula activado' : 'Ajuste a cuadrícula desactivado'}
        >
          🔲 Cuadrícula {snapToGrid ? '✓' : ''}
        </button>
        <button
          className={`toolbar-btn toggle-btn ${smoothCurves ? 'active' : ''}`}
          onClick={onToggleSmoothCurves}
          title={smoothCurves ? 'Desactivar suavizado' : 'Activar suavizado de curvas (C)'}
          aria-label={smoothCurves ? 'Suavizado activado' : 'Suavizado desactivado'}
        >
          ≈ Suavizado {smoothCurves ? '✓' : ''}
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-section toolbar-mode">
        <span className="toolbar-label toolbar-mode-label">Modo:</span>
        <span className="toolbar-mode-text">
          {drawingMode === 'addPoints' && 'Añadiendo puntos'}
          {drawingMode === 'movePoint' && 'Moviendo punto'}
          {drawingMode === 'insertPoint' && 'Insertando punto'}
          {drawingMode === 'idle' && 'Inactivo'}
        </span>
      </div>

      <div className="toolbar-help">
        <small>
          Ctrl+Z: Deshacer | Ctrl+Shift+Z: Rehacer | Supr: Eliminar | S: Cuadrícula | C: Suavizado
        </small>
      </div>
    </div>
  )
}
