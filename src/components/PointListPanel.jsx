import { useState, useEffect } from 'react'
import './PointListPanel.css'

/**
 * Coordinate Editor Panel - shows all polygon points with editable coordinates
 * Allows viewing and editing all point locations simultaneously
 * Synchronizes with map selection bidirectionally
 */
export default function PointListPanel({
  polygonPoints,
  selectedPointIndex,
  onSelectPoint,
  onUpdateCoordinate,
  onDeletePoint,
}) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValues, setEditValues] = useState({ lng: '', lat: '' })

  // Sincronizar cuando se selecciona un punto desde el mapa
  useEffect(() => {
    if (selectedPointIndex !== null) {
      const point = polygonPoints[selectedPointIndex]
      if (point) {
        setEditValues({
          lng: point[0].toFixed(6),
          lat: point[1].toFixed(6)
        })
      }
    }
  }, [selectedPointIndex, polygonPoints])

  const handleEditStart = (idx) => {
    const point = polygonPoints[idx]
    setEditingIndex(idx)
    setEditValues({
      lng: point[0].toFixed(6),
      lat: point[1].toFixed(6)
    })
  }

  const handleEditCancel = () => {
    setEditingIndex(null)
    setEditValues({ lng: '', lat: '' })
  }

  const handleEditSave = (idx) => {
    try {
      const lng = parseFloat(editValues.lng)
      const lat = parseFloat(editValues.lat)

      if (isNaN(lng) || isNaN(lat)) {
        alert('❌ Coordenadas inválidas')
        return
      }

      // Validar rangos razonables (aproximadamente coordenadas del mundo)
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        alert('❌ Coordenadas fuera de rango')
        return
      }

      onUpdateCoordinate(idx, [lng, lat])
      setEditingIndex(null)
      setEditValues({ lng: '', lat: '' })
    } catch (error) {
      alert('❌ Error al actualizar coordenadas')
    }
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Enter') {
      handleEditSave(idx)
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  const calculateDistance = (idx) => {
    if (idx === 0) return 0
    const prev = polygonPoints[idx - 1]
    const curr = polygonPoints[idx]
    const dx = curr[0] - prev[0]
    const dy = curr[1] - prev[1]
    return Math.sqrt(dx * dx + dy * dy)
  }

  return (
    <div className="point-list-panel">
      <div className="panel-header">
        <h3>📋 Puntos de la Parcela</h3>
        <span className="point-count">{polygonPoints.length}</span>
      </div>

      <div className="panel-info">
        <small>
          Click para seleccionar • Doble-click para editar • Presiona Enter para guardar
        </small>
      </div>

      <div className="points-list">
        {polygonPoints.length === 0 ? (
          <div className="empty-state">
            <p>Sin puntos definidos</p>
            <p className="hint">Dibuja puntos en el mapa para que aparezcan aquí</p>
          </div>
        ) : (
          polygonPoints.map((point, idx) => (
            <div
              key={idx}
              className={`point-item ${selectedPointIndex === idx ? 'selected' : ''}`}
              onClick={() => onSelectPoint(idx)}
            >
              {editingIndex === idx ? (
                // Modo edición
                <div className="point-edit-mode">
                  <div className="edit-inputs">
                    <input
                      type="number"
                      step="0.000001"
                      value={editValues.lng}
                      onChange={(e) =>
                        setEditValues({ ...editValues, lng: e.target.value })
                      }
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      placeholder="Longitud"
                      className="coord-input"
                      autoFocus
                    />
                    <span className="separator">,</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={editValues.lat}
                      onChange={(e) =>
                        setEditValues({ ...editValues, lat: e.target.value })
                      }
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      placeholder="Latitud"
                      className="coord-input"
                    />
                  </div>
                  <div className="edit-buttons">
                    <button
                      className="btn btn-save"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditSave(idx)
                      }}
                      title="Guardar (Enter)"
                    >
                      ✓
                    </button>
                    <button
                      className="btn btn-cancel"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditCancel()
                      }}
                      title="Cancelar (Esc)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <div
                  className="point-view-mode"
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    handleEditStart(idx)
                  }}
                >
                  <div className="point-number">
                    <span className="number">{idx + 1}</span>
                  </div>

                  <div className="point-details">
                    <div className="coordinates">
                      <code>{point[0].toFixed(6)}</code>
                      <span className="comma">,</span>
                      <code>{point[1].toFixed(6)}</code>
                    </div>
                    {idx > 0 && (
                      <div className="distance">
                        <small>↔ {(calculateDistance(idx) * 1000).toFixed(1)}m</small>
                      </div>
                    )}
                  </div>

                  <div className="point-actions">
                    <button
                      className={`btn-delete ${polygonPoints.length <= 3 ? 'disabled' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (polygonPoints.length > 3) {
                          onDeletePoint(idx)
                        } else {
                          alert('❌ Se necesitan al menos 3 puntos para un polígono válido')
                        }
                      }}
                      disabled={polygonPoints.length <= 3}
                      title={
                        polygonPoints.length <= 3
                          ? 'No se puede eliminar: mínimo 3 puntos'
                          : 'Eliminar punto'
                      }
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="panel-footer">
        <div className="stats">
          <div className="stat">
            <span className="label">Total:</span>
            <span className="value">{polygonPoints.length}</span>
          </div>
          {selectedPointIndex !== null && (
            <div className="stat">
              <span className="label">Seleccionado:</span>
              <span className="value">Punto {selectedPointIndex + 1}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
