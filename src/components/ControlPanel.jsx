import { useState } from 'react'
import './ControlPanel.css'

export default function ControlPanel({ config, setConfig, parcela, pozo }) {
  const [busqueda, setBusqueda] = useState('')

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }))
  }

  const handleBusqueda = () => {
    // TODO: Geocode search input and center map
  }

  return (
    <div className="control-panel">
      <h1>AgroFit</h1>

      <section className="search-section">
        <label>Buscar municipio o coordenada</label>
        <input
          type="text"
          placeholder="Ej: 'Madrid' o '40.4168,-3.7038'"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={handleBusqueda}>Buscar</button>
      </section>

      <section className="status-section">
        <div className="status-item">
          <span>Parcela:</span>
          <span className="status-value">{parcela ? '✓ Dibujada' : '○ Pendiente'}</span>
        </div>
        <div className="status-item">
          <span>Pozo:</span>
          <span className="status-value">{pozo ? '✓ Marcado' : '○ Pendiente'}</span>
        </div>
      </section>

      <section className="config-section">
        <h3>Configuración de Plantación</h3>

        <div className="input-group">
          <label>Marco Horizontal (m)</label>
          <input
            type="number"
            value={config.marcoHorizontal}
            onChange={(e) => handleInputChange('marcoHorizontal', e.target.value)}
            min="1"
            step="0.5"
          />
        </div>

        <div className="input-group">
          <label>Marco Vertical (m)</label>
          <input
            type="number"
            value={config.marcoVertical}
            onChange={(e) => handleInputChange('marcoVertical', e.target.value)}
            min="1"
            step="0.5"
          />
        </div>

        <div className="input-group">
          <label>Retranqueo / Margen (m)</label>
          <input
            type="number"
            value={config.retranqueo}
            onChange={(e) => handleInputChange('retranqueo', e.target.value)}
            min="0"
            step="0.5"
          />
        </div>

        <div className="presets">
          <button onClick={() => setConfig({ marcoHorizontal: 7, marcoVertical: 7, retranqueo: config.retranqueo })}>
            7x7
          </button>
          <button onClick={() => setConfig({ marcoHorizontal: 6, marcoVertical: 6, retranqueo: config.retranqueo })}>
            6x6
          </button>
          <button onClick={() => setConfig({ marcoHorizontal: 5, marcoVertical: 5, retranqueo: config.retranqueo })}>
            5x5
          </button>
        </div>
      </section>

      <section className="actions-section">
        <button className="btn-primary" disabled={!parcela || !pozo}>
          Generar Layout
        </button>
        <button className="btn-secondary">Descargar PDF</button>
        <button className="btn-secondary">Exportar Datos</button>
      </section>
    </div>
  )
}
