import { useState } from 'react'
import ControlPanel from './ControlPanel'
import MetricsPanel from './MetricsPanel'
import './SidePanel.css'

export default function SidePanel({
  config, setConfig, parcela, setParcela, pozo, grid, metricas, displayUnit, setDisplayUnit,
  parcelas, selectedParcelaIndex, onSelectParcela, onSearchLocation, parcelaTabSlotRef
}) {
  const [activeTab, setActiveTab] = useState('parcela')
  const [busqueda, setBusqueda] = useState('')
  const [parcelasExpanded, setParcelasExpanded] = useState(true)

  const handleBusqueda = async () => {
    if (!busqueda.trim() || !window.google) return

    try {
      const geocoder = new window.google.maps.Geocoder()
      // La API con promesas devuelve { results: [...] }, no un array directo
      const { results } = await geocoder.geocode({ address: busqueda })

      if (results && results.length > 0) {
        const location = results[0].geometry.location
        // timestamp permite repetir la misma búsqueda y volver a centrar
        onSearchLocation({
          lat: location.lat(),
          lng: location.lng(),
          timestamp: Date.now()
        })
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
    <div className="side-panel">
      <div className="side-panel-header">
        <h1>🌱 AgroPlan</h1>

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

        {parcelas.length > 0 && (
          <section className="parcelas-section">
            <div className="parcelas-header">
              <h4>📋 Mis Parcelas</h4>
              <button
                className="parcelas-toggle"
                onClick={() => setParcelasExpanded(!parcelasExpanded)}
              >
                {parcelasExpanded ? '▼' : '▶'}
              </button>
            </div>
            {parcelasExpanded && (
              <div className="parcelas-list">
                {parcelas.map((p, idx) => (
                  <div key={idx} className={`parcela-item ${selectedParcelaIndex === idx ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      checked={selectedParcelaIndex === idx}
                      onChange={() => onSelectParcela(idx)}
                    />
                    <span className="parcela-item-label">Parcela {idx + 1}</span>
                    <button
                      className="parcela-item-delete"
                      onClick={() => {
                        // Seleccionar la parcela antes de eliminarla, para que setParcela() sepa cuál eliminar
                        if (selectedParcelaIndex !== idx) {
                          onSelectParcela(idx)
                        }
                        // Después de un pequeño delay, ejecutar la eliminación
                        setTimeout(() => setParcela(null), 10)
                      }}
                      title="Eliminar parcela"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <div className="side-panel-tabs">
        <button
          className={`side-panel-tab ${activeTab === 'parcela' ? 'active' : ''}`}
          onClick={() => setActiveTab('parcela')}
        >
          📐 Parcela
        </button>
        <button
          className={`side-panel-tab ${activeTab === 'cultivo' ? 'active' : ''}`}
          onClick={() => setActiveTab('cultivo')}
        >
          🌱 Cultivo y Riego
        </button>
        <button
          className={`side-panel-tab ${activeTab === 'resultado' ? 'active' : ''}`}
          onClick={() => setActiveTab('resultado')}
        >
          📊 Resultado
        </button>
      </div>

      <div className="side-panel-content">
        {/* Slot del portal: DrawingToolsPanel se renderiza aquí desde MapContainer.
            display:none (no desmontaje) para no perder el estado del panel de dibujo al cambiar de pestaña. */}
        <div
          ref={parcelaTabSlotRef}
          className={`tab-slot ${activeTab === 'parcela' ? 'tab-slot-active' : ''}`}
        />

        {activeTab === 'cultivo' && (
          <ControlPanel
            config={config}
            setConfig={setConfig}
            displayUnit={displayUnit}
            setDisplayUnit={setDisplayUnit}
          />
        )}

        {activeTab === 'resultado' && (
          <div className="resultado-tab">
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

            {metricas && <MetricsPanel metricas={metricas} />}
          </div>
        )}
      </div>
    </div>
  )
}
