import { useState } from 'react'
import { OBSTACLE_TYPES } from '../utils/obstacleHelpers'
import './ObstaclePanel.css'

export default function ObstaclePanel({
  obstacles,
  onObstacleTypeSelect,
  onObstacleRemove,
  currentObstacleType,
  isDrawingMode
}) {
  return (
    <div className="obstacle-panel">
      <div className="obstacle-header">
        <h3>🚧 Obstáculos</h3>
        <span className="obstacle-count">{obstacles.length}</span>
      </div>

      {/* Selector de tipo de obstáculo */}
      <div className="obstacle-selector">
        <label>Marcar obstáculo:</label>
        <div className="obstacle-types-grid">
          {Object.entries(OBSTACLE_TYPES).map(([typeId, typeInfo]) => (
            <button
              key={typeId}
              className={`obstacle-type-btn ${currentObstacleType === typeId ? 'active' : ''} ${isDrawingMode && currentObstacleType === typeId ? 'drawing' : ''}`}
              onClick={() => onObstacleTypeSelect(typeId)}
              title={typeInfo.label}
            >
              <span className="obstacle-icon">{typeInfo.icon}</span>
              <span className="obstacle-label">{typeInfo.label}</span>
            </button>
          ))}
        </div>
        {currentObstacleType && (
          <div className="obstacle-hint">
            💡 Haz clic en el mapa para marcar {OBSTACLE_TYPES[currentObstacleType].label.toLowerCase()}
          </div>
        )}
      </div>

      {/* Lista de obstáculos marcados */}
      {obstacles.length > 0 && (
        <div className="obstacles-list">
          <h4>Obstáculos marcados:</h4>
          <ul>
            {obstacles.map(obstacle => (
              <li key={obstacle.id} className="obstacle-item">
                <span className="obstacle-item-icon">{obstacle.icon}</span>
                <span className="obstacle-item-label">{obstacle.label}</span>
                <button
                  className="obstacle-delete-btn"
                  onClick={() => onObstacleRemove(obstacle.id)}
                  title="Eliminar obstáculo"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info */}
      <div className="obstacle-info">
        <p>
          Los obstáculos crean zonas de exclusión automáticas alrededor de cada elemento.
          Las plantas no se generarán en esas zonas.
        </p>
      </div>
    </div>
  )
}
