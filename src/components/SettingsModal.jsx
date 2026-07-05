import { useState, useEffect } from 'react'
import { DEFAULT_PREFERENCES } from '../config'
import './SettingsModal.css'

/**
 * Modal de Ajustes: edita preferencias de mapa y editor sin tocar código.
 * Los cambios se aplican al guardar y persisten en localStorage.
 */
export default function SettingsModal({ isOpen, preferences, onSave, onClose }) {
  const [draft, setDraft] = useState(preferences)

  // Re-sincronizar el borrador cada vez que se abre
  useEffect(() => {
    if (isOpen) setDraft(preferences)
  }, [isOpen, preferences])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const set = (key, value) => setDraft(prev => ({ ...prev, [key]: value }))

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Ajustes</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">
          <div className="settings-field">
            <label>Tipo de mapa</label>
            <select
              value={draft.mapTypeId}
              onChange={(e) => set('mapTypeId', e.target.value)}
            >
              <option value="satellite">Satélite</option>
              <option value="hybrid">Híbrido (satélite + calles)</option>
              <option value="roadmap">Callejero</option>
            </select>
          </div>

          <div className="settings-field">
            <label>Zoom al buscar un lugar</label>
            <input
              type="number"
              min="12"
              max="21"
              value={draft.searchZoom}
              onChange={(e) => set('searchZoom', Number(e.target.value))}
            />
            <small>12 = municipio · 17 = parcela · 21 = detalle máximo</small>
          </div>

          <div className="settings-field">
            <label>Rejilla de ajuste al dibujar (metros)</label>
            <input
              type="number"
              min="1"
              max="50"
              value={draft.snapGridSizeMeters}
              onChange={(e) => set('snapGridSizeMeters', Number(e.target.value))}
            />
            <small>Tamaño de la cuadrícula cuando el snap está activo (tecla S)</small>
          </div>

          <div className="settings-field">
            <label>Unidad por defecto</label>
            <div className="settings-unit-toggle">
              <button
                className={draft.displayUnit === 'cm' ? 'active' : ''}
                onClick={() => set('displayUnit', 'cm')}
              >
                Centímetros
              </button>
              <button
                className={draft.displayUnit === 'm' ? 'active' : ''}
                onClick={() => set('displayUnit', 'm')}
              >
                Metros
              </button>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button
            className="settings-reset"
            onClick={() => setDraft({ ...DEFAULT_PREFERENCES })}
          >
            Restaurar defaults
          </button>
          <div className="settings-actions">
            <button className="settings-cancel" onClick={onClose}>Cancelar</button>
            <button className="settings-save" onClick={() => { onSave(draft); onClose() }}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
