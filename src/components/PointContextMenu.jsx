import { useState, useEffect } from 'react'
import './PointContextMenu.css'

/**
 * Right-click context menu for polygon points
 * Provides quick access to point operations: delete, edit, insert, copy
 */
export default function PointContextMenu({
  isOpen,
  position,
  pointIndex,
  pointCoords,
  totalPoints,
  onDelete,
  onEdit,
  onInsertBefore,
  onInsertAfter,
  onCopyCoords,
  onClose
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      // Si hace clic dentro del menú, no cerrar
      if (e.target.closest('.point-context-menu')) return
      onClose()
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !position) return null

  const handleDelete = () => {
    if (totalPoints > 3) {
      onDelete(pointIndex)
      onClose()
    } else {
      alert('❌ Se necesitan al menos 3 puntos para un polígono válido')
    }
  }

  const handleCopyCoords = () => {
    const coordsText = `${pointCoords[0].toFixed(6)}, ${pointCoords[1].toFixed(6)}`
    navigator.clipboard.writeText(coordsText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEdit = () => {
    onEdit(pointIndex)
    onClose()
  }

  const handleInsertBefore = () => {
    onInsertBefore(pointIndex)
    onClose()
  }

  const handleInsertAfter = () => {
    onInsertAfter(pointIndex)
    onClose()
  }

  return (
    <div
      className="point-context-menu"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <div className="context-menu-header">
        <span className="point-info">Punto {pointIndex + 1}</span>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="context-menu-separator"></div>

      <div className="context-menu-items">
        {/* Edit option */}
        <button
          className="context-menu-item edit"
          onClick={handleEdit}
          title="Editar coordenadas de este punto"
        >
          <span className="icon">✏️</span>
          <span className="label">Editar Punto</span>
        </button>

        {/* Insert options */}
        <button
          className="context-menu-item insert"
          onClick={handleInsertBefore}
          title="Insertar nuevo punto antes de este"
        >
          <span className="icon">⬆️</span>
          <span className="label">Insertar Antes</span>
        </button>

        <button
          className="context-menu-item insert"
          onClick={handleInsertAfter}
          title="Insertar nuevo punto después de este"
        >
          <span className="icon">⬇️</span>
          <span className="label">Insertar Después</span>
        </button>

        <div className="context-menu-separator"></div>

        {/* Copy coordinates */}
        <button
          className={`context-menu-item copy ${copied ? 'copied' : ''}`}
          onClick={handleCopyCoords}
          title="Copiar coordenadas al portapapeles"
        >
          <span className="icon">📋</span>
          <span className="label">{copied ? '✓ Copiado' : 'Copiar Coords'}</span>
        </button>

        <div className="context-menu-separator"></div>

        {/* Delete option */}
        <button
          className={`context-menu-item delete ${totalPoints <= 3 ? 'disabled' : ''}`}
          onClick={handleDelete}
          disabled={totalPoints <= 3}
          title={totalPoints <= 3 ? 'No se puede borrar: mínimo 3 puntos' : 'Eliminar este punto'}
        >
          <span className="icon">🗑️</span>
          <span className="label">Eliminar Punto</span>
        </button>
      </div>

      {/* Coordinates display */}
      <div className="context-menu-footer">
        <div className="coords">
          <small>
            {pointCoords[0].toFixed(4)}, {pointCoords[1].toFixed(4)}
          </small>
        </div>
      </div>
    </div>
  )
}
