import { useState, useRef } from 'react'
import './ControlPanel.css'

export default function ControlPanel({ config, setConfig, parcela, pozo, grid, metricas }) {
  const [busqueda, setBusqueda] = useState('')
  const [mapRef, setMapRef] = useState(null)

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  const handleBusqueda = async () => {
    if (!busqueda.trim() || !window.google) return

    try {
      const geocoder = new window.google.maps.Geocoder()
      const results = await geocoder.geocode({ address: busqueda })

      if (results && results.length > 0) {
        const location = results[0].geometry.location
        // Centrar mapa en resultado (sin acceso directo al map, se hace desde MapContainer)
        alert(`Ubicación encontrada: ${results[0].formatted_address}`)
      } else {
        alert('Ubicación no encontrada')
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      alert('Error al buscar ubicación')
    }
  }

  const handleDescargarPDF = () => {
    if (!parcela || !metricas) {
      alert('Primero debes generar un layout')
      return
    }

    // Por ahora, crear un archivo de texto con los datos
    const dataStr = JSON.stringify({
      parcela: parcela,
      metricas: metricas,
      config: config,
    }, null, 2)

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr))
    element.setAttribute('download', 'agrofit-layout.json')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    alert('Datos exportados como JSON')
  }

  const downloadScreenshot = async () => {
    if (!parcela || !metricas) {
      alert('Primero debes generar un layout')
      return
    }

    try {
      // Intentar usar html2canvas si está disponible
      const canvas = await html2canvas(document.querySelector('.map-container'))
      const link = document.createElement('a')
      link.href = canvas.toDataURL()
      link.download = 'agrofit-layout.png'
      link.click()
    } catch (error) {
      alert('Descarga de PNG requiere dependencia html2canvas. Por ahora usa la exportación JSON.')
    }
  }

  return (
    <div className="control-panel">
      <h1>🌱 AgroFit</h1>

      <section className="search-section">
        <label>Buscar municipio o coordenada</label>
        <input
          type="text"
          placeholder="Ej: 'Madrid' o '40.4168,-3.7038'"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleBusqueda()}
        />
        <button onClick={handleBusqueda}>Buscar</button>
      </section>

      <section className="status-section">
        <div className="status-item">
          <span>Parcela:</span>
          <span className={`status-value ${parcela ? 'done' : 'pending'}`}>
            {parcela ? '✓ Dibujada' : '○ Pendiente'}
          </span>
        </div>
        <div className="status-item">
          <span>Pozo:</span>
          <span className={`status-value ${pozo ? 'done' : 'pending'}`}>
            {pozo ? '✓ Marcado' : '○ Pendiente'}
          </span>
        </div>
        <div className="status-item">
          <span>Grid:</span>
          <span className={`status-value ${grid.length > 0 ? 'done' : 'pending'}`}>
            {grid.length > 0 ? `✓ ${grid.length} plantas` : '○ Sin generar'}
          </span>
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
          <button onClick={() => setConfig({ ...config, marcoHorizontal: 7, marcoVertical: 7 })}>
            7×7
          </button>
          <button onClick={() => setConfig({ ...config, marcoHorizontal: 6, marcoVertical: 6 })}>
            6×6
          </button>
          <button onClick={() => setConfig({ ...config, marcoHorizontal: 5, marcoVertical: 5 })}>
            5×5
          </button>
        </div>
      </section>

      <section className="actions-section">
        <button
          className={`btn-primary ${!parcela || !pozo ? 'disabled' : ''}`}
          disabled={!parcela || !pozo}
          title={!parcela || !pozo ? 'Dibuja parcela y marca pozo primero' : 'Generar layout'}
        >
          ✨ Generar Layout
        </button>
        <button className="btn-secondary" onClick={downloadScreenshot}>
          📥 Descargar PNG
        </button>
        <button className="btn-secondary" onClick={handleDescargarPDF}>
          📊 Exportar Datos
        </button>
      </section>

      {metricas && (
        <section className="quick-stats">
          <h3>Última generación</h3>
          <div className="stat-row">
            <span>Plantas:</span>
            <strong>{metricas.numeroPlantas}</strong>
          </div>
          <div className="stat-row">
            <span>Área:</span>
            <strong>{metricas.areaTotalHa.toFixed(2)} ha</strong>
          </div>
          <div className="stat-row">
            <span>Densidad:</span>
            <strong>{metricas.densidad.toFixed(0)} pl/ha</strong>
          </div>
        </section>
      )}
    </div>
  )
}
