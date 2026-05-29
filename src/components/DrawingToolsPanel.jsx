import { useState } from 'react'
import ObstaclePanel from './ObstaclePanel'
import './DrawingToolsPanel.css'

export default function DrawingToolsPanel({
  // Drawing Editor props
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

  // Drawing mode props
  currentDrawingMode,
  onDrawingModeChange,
  polygonPoints,
  onFinishPolygon,
  onClearDrawing,

  // Validation props
  validationStatus,

  // Control props
  parcela,
  pozo,
  grid,
  obstacles,
  onObstacleTypeSelect,
  onObstacleRemove,
  currentObstacleType,
  isRegeneratingGrid,

  // Analysis props
  onCompare,
  onOptimize,
  scenarioCalculating,
  optimizationCalculating,

  // Obstacle types
  OBSTACLE_TYPES,

  // Point List Panel props
  showPointListPanel,
  onTogglePointListPanel,
}) {
  const [expandedSections, setExpandedSections] = useState({
    drawing: true,
    actions: true,
    validation: true,
    analysis: false,
    obstacles: false,
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="drawing-tools-panel">
      {/* Drawing Tools Section */}
      <div className="panel-section">
        <button
          className="section-header"
          onClick={() => toggleSection('drawing')}
        >
          <span className="section-title">✏️ Herramientas de Dibujo</span>
          <span className={`expand-icon ${expandedSections.drawing ? 'open' : ''}`}>▼</span>
        </button>

        {expandedSections.drawing && (
          <div className="section-content">
            {/* Drawing Mode Selector */}
            <div className="drawing-mode-selector">
              <label className="panel-label">Modo de Dibujo</label>
              <div className="mode-buttons">
                <button
                  className={`mode-btn ${currentDrawingMode === 'polygon' ? 'active' : ''}`}
                  onClick={() => onDrawingModeChange('polygon')}
                  title="Dibujar parcela"
                >
                  📐 Polígono
                </button>
                <button
                  className={`mode-btn ${currentDrawingMode === 'marker' ? 'active' : ''}`}
                  onClick={() => onDrawingModeChange('marker')}
                  title="Marcar pozo"
                >
                  💧 Pozo
                </button>
                {parcela && pozo && (
                  <button
                    className={`mode-btn ${currentDrawingMode === 'tractorLine' ? 'active' : ''}`}
                    onClick={() => onDrawingModeChange('tractorLine')}
                    title="Ajustar línea de dirección del tractor"
                  >
                    🚜 Tractor
                  </button>
                )}
              </div>
            </div>

            {/* Point Counter */}
            {currentDrawingMode === 'polygon' && (
              <div className="point-counter">
                <label className="panel-label">Puntos</label>
                <div className="counter-display">{pointCount}</div>
              </div>
            )}

            {/* Undo/Redo */}
            {currentDrawingMode === 'polygon' && pointCount > 0 && (
              <div className="undo-redo-section">
                <label className="panel-label">Historial</label>
                <div className="button-group">
                  <button
                    className="panel-btn"
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Deshacer (Ctrl+Z)"
                  >
                    ↶ Deshacer
                  </button>
                  <button
                    className="panel-btn"
                    onClick={onRedo}
                    disabled={!canRedo}
                    title="Rehacer (Ctrl+Shift+Z)"
                  >
                    ↷ Rehacer
                  </button>
                </div>
              </div>
            )}

            {/* Drawing Options */}
            {currentDrawingMode === 'polygon' && pointCount > 0 && (
              <div className="drawing-options">
                <label className="panel-label">Opciones</label>
                <div className="toggle-options">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={snapToGrid}
                      onChange={onToggleSnapToGrid}
                    />
                    <span>🔲 Ajuste a Cuadrícula</span>
                  </label>
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={smoothCurves}
                      onChange={onToggleSmoothCurves}
                    />
                    <span>≈ Suavizado de Curvas</span>
                  </label>
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts Help */}
            {currentDrawingMode === 'polygon' && pointCount > 0 && (
              <div className="shortcuts-help">
                <div className="shortcuts-label">⌨️ Atajos:</div>
                <div className="shortcut-item">Ctrl+Z: Deshacer</div>
                <div className="shortcut-item">Ctrl+Shift+Z: Rehacer</div>
                <div className="shortcut-item">Supr: Eliminar punto</div>
                <div className="shortcut-item">S: Cuadrícula</div>
                <div className="shortcut-item">C: Suavizado</div>
                <div className="shortcut-item">I: Insertar punto</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Section */}
      {(polygonPoints.length > 0 || parcela || pozo) && (
        <div className="panel-section">
          <button
            className="section-header"
            onClick={() => toggleSection('actions')}
          >
            <span className="section-title">⚡ Acciones</span>
            <span className={`expand-icon ${expandedSections.actions ? 'open' : ''}`}>▼</span>
          </button>

          {expandedSections.actions && (
            <div className="section-content">
              {polygonPoints.length > 0 && (
                <button
                  className="panel-btn finish-btn"
                  onClick={onFinishPolygon}
                  title={`Terminar polígono (${polygonPoints.length} puntos)`}
                >
                  ✓ Terminar ({polygonPoints.length})
                </button>
              )}
              {polygonPoints.length > 0 && (
                <button
                  className={`panel-btn points-btn ${showPointListPanel ? 'active' : ''}`}
                  onClick={onTogglePointListPanel}
                  title="Ver y editar coordenadas de puntos"
                >
                  📋 Puntos ({polygonPoints.length})
                </button>
              )}
              {(parcela || pozo || polygonPoints.length > 0) && (
                <button
                  className="panel-btn clear-btn"
                  onClick={onClearDrawing}
                  title="Limpiar todo"
                >
                  🗑️ Limpiar
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Validation Section */}
      {validationStatus && currentDrawingMode === 'polygon' && pointCount >= 3 && (
        <div className="panel-section">
          <button
            className="section-header"
            onClick={() => toggleSection('validation')}
          >
            <span className="section-title">📋 Validación</span>
            <span className={`expand-icon ${expandedSections.validation ? 'open' : ''}`}>▼</span>
          </button>

          {expandedSections.validation && (
            <div className="section-content validation-content">
              {validationStatus.isValid && validationStatus.warnings.length === 0 ? (
                <div className="validation-status valid">
                  <div className="status-icon">✓</div>
                  <div className="status-text">Polígono Válido</div>
                </div>
              ) : (
                <>
                  {validationStatus.errors.length > 0 && (
                    <div className="validation-errors">
                      <div className="validation-header">❌ Errores:</div>
                      {validationStatus.errors.map((error, idx) => (
                        <div key={idx} className="validation-item">• {error}</div>
                      ))}
                    </div>
                  )}
                  {validationStatus.warnings.length > 0 && (
                    <div className="validation-warnings">
                      <div className="validation-header">⚠️ Advertencias:</div>
                      {validationStatus.warnings.map((warning, idx) => (
                        <div key={idx} className="validation-item">• {warning}</div>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="validation-metrics">
                <div className="metric">
                  <span className="metric-label">Área:</span>
                  <span className="metric-value">{validationStatus.area.toFixed(3)} km²</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Hectáreas:</span>
                  <span className="metric-value">{(validationStatus.area * 100).toFixed(2)} ha</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Puntos:</span>
                  <span className="metric-value">{validationStatus.pointCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Obstacles Section */}
      {parcela && pozo && (
        <div className="panel-section">
          <button
            className="section-header"
            onClick={() => toggleSection('obstacles')}
          >
            <span className="section-title">🚧 Obstáculos</span>
            <span className={`expand-icon ${expandedSections.obstacles ? 'open' : ''}`}>▼</span>
          </button>

          {expandedSections.obstacles && (
            <div className="section-content obstacles-content">
              <ObstaclePanel
                obstacles={obstacles}
                onObstacleTypeSelect={onObstacleTypeSelect}
                onObstacleRemove={onObstacleRemove}
                currentObstacleType={currentObstacleType}
                isDrawingMode={currentDrawingMode === 'obstacle'}
              />
            </div>
          )}
        </div>
      )}

      {/* Analysis Section */}
      {parcela && pozo && grid.length > 0 && (
        <div className="panel-section">
          <button
            className="section-header"
            onClick={() => toggleSection('analysis')}
          >
            <span className="section-title">📊 Análisis</span>
            <span className={`expand-icon ${expandedSections.analysis ? 'open' : ''}`}>▼</span>
          </button>

          {expandedSections.analysis && (
            <div className="section-content">
              <button
                className="panel-btn analyze-btn compare-btn"
                onClick={onCompare}
                disabled={scenarioCalculating}
              >
                {scenarioCalculating ? '⏳ Comparando...' : '📊 Comparar Ángulos'}
              </button>
              <button
                className="panel-btn analyze-btn optimize-btn"
                onClick={onOptimize}
                disabled={optimizationCalculating}
              >
                {optimizationCalculating ? '⏳ Optimizando...' : '🎯 Optimizar'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {isRegeneratingGrid && parcela && pozo && (
        <div className="panel-section loading-section">
          <div className="loading-message">
            <div className="spinner"></div>
            <span>Generando layout...</span>
          </div>
        </div>
      )}
    </div>
  )
}
