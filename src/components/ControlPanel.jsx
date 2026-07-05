import { useState, useRef } from 'react'
import { cropColors } from '../config'
import { formatDisplayValue, parseInputValue } from '../utils/geometry'
import CropQuantityModal from './CropQuantityModal'
import CropCategorySelector from './CropCategorySelector'
import './ControlPanel.css'

export default function ControlPanel({
  config, setConfig, parcela, setParcela, pozo, grid, metricas, displayUnit, setDisplayUnit,
  parcelas, selectedParcelaIndex, onSelectParcela, onSearchLocation
}) {
  const [busqueda, setBusqueda] = useState('')
  const [mapRef, setMapRef] = useState(null)
  const [riegoExpanded, setRiegoExpanded] = useState(true)
  const [cultivosExpanded, setCultivosExpanded] = useState(true)
  const [parcelasExpanded, setParcelasExpanded] = useState(true)
  const [showCropModal, setShowCropModal] = useState(false)
  const [selectedCropForQuantity, setSelectedCropForQuantity] = useState(null)

  const handleInputChange = (field, value) => {
    // Parse the input value based on the current display unit and convert to cm for storage
    const valueCm = parseInputValue(value, displayUnit)
    setConfig(prev => ({
      ...prev,
      [field]: valueCm
    }))
  }

  const handleCropToggle = (cultivo) => {
    setConfig(prev => {
      const cultivos = prev.cultivosSeleccionados || []
      const isSelected = cultivos.includes(cultivo)

      if (isSelected) {
        return {
          ...prev,
          cultivosSeleccionados: cultivos.filter(c => c !== cultivo)
        }
      } else {
        return {
          ...prev,
          cultivosSeleccionados: [...cultivos, cultivo]
        }
      }
    })
  }

  const handleCropQuantityChange = (cultivo, cantidad) => {
    setConfig(prev => ({
      ...prev,
      cantidadesCultivos: {
        ...prev.cantidadesCultivos,
        [cultivo]: Math.max(0, parseInt(cantidad) || 0)
      }
    }))
  }

  const handleCropSelect = (cropId) => {
    // Open modal for this crop
    setSelectedCropForQuantity(cropId)
    setShowCropModal(true)
  }

  const handleQuantityConfirm = (quantity) => {
    if (selectedCropForQuantity) {
      // Add crop to selected crops if not already there
      const cultivos = config.cultivosSeleccionados || []
      if (!cultivos.includes(selectedCropForQuantity)) {
        setConfig(prev => ({
          ...prev,
          cultivosSeleccionados: [...cultivos, selectedCropForQuantity]
        }))
      }

      // Update quantity
      handleCropQuantityChange(selectedCropForQuantity, quantity)
    }

    // Close modal
    setShowCropModal(false)
    setSelectedCropForQuantity(null)
  }

  const handleModalCancel = () => {
    setShowCropModal(false)
    setSelectedCropForQuantity(null)
  }

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
    <div className="control-panel">
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

      {/* PARCELAS SECTION: Seleccionar entre múltiples parcelas */}
      {parcelas.length > 0 && (
        <section className="parcelas-section" style={{ marginBottom: '15px', padding: '12px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 Mis Parcelas</h4>
            <button
              onClick={() => setParcelasExpanded(!parcelasExpanded)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '0 4px',
                color: '#666',
              }}
            >
              {parcelasExpanded ? '▼' : '▶'}
            </button>
          </div>
          {parcelasExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {parcelas.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: selectedParcelaIndex === idx ? '#d4e8d4' : '#fff', border: selectedParcelaIndex === idx ? '1px solid #4CAF50' : '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={selectedParcelaIndex === idx}
                    onChange={() => onSelectParcela(idx)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ flex: 1, fontSize: '11px', fontWeight: '500', color: '#333' }}>Parcela {idx + 1}</span>
                  <button
                    onClick={() => {
                      // Seleccionar la parcela antes de eliminarla, para que setParcela() sepa cuál eliminar
                      if (selectedParcelaIndex !== idx) {
                        onSelectParcela(idx)
                      }
                      // Después de un pequeño delay, ejecutar la eliminación
                      setTimeout(() => setParcela(null), 10)
                    }}
                    style={{
                      background: '#FF6B6B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: '600'
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

      {/* SECTION 1: Tipo de Riego y Márgenes */}
      <section className="config-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, flex: 1 }}>Tipo de Riego y Márgenes</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              background: '#f5f5f5',
              borderRadius: '4px',
              padding: '2px',
              border: '1px solid #ddd'
            }}>
              <button
                onClick={() => setDisplayUnit('cm')}
                style={{
                  padding: '4px 8px',
                  background: displayUnit === 'cm' ? '#2d5016' : 'transparent',
                  color: displayUnit === 'cm' ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                title="Mostrar en centímetros"
              >
                cm
              </button>
              <button
                onClick={() => setDisplayUnit('m')}
                style={{
                  padding: '4px 8px',
                  background: displayUnit === 'm' ? '#2d5016' : 'transparent',
                  color: displayUnit === 'm' ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                title="Mostrar en metros"
              >
                m
              </button>
            </div>
            <button
              onClick={() => setRiegoExpanded(!riegoExpanded)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px 8px',
                color: '#2d5016',
                fontWeight: 'bold',
              }}
              title={riegoExpanded ? 'Colapsar' : 'Expandir'}
            >
              {riegoExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>

        {riegoExpanded && (
          <>
            <div className="input-group-row">
              <div className="input-group">
                <label>Marco H ({displayUnit}) 📏</label>
                <input
                  type="number"
                  value={formatDisplayValue(config.marcoHorizontal, displayUnit)}
                  onChange={(e) => handleInputChange('marcoHorizontal', e.target.value)}
                  min={displayUnit === 'm' ? 0.5 : 50}
                  step={displayUnit === 'm' ? 0.1 : 10}
                />
              </div>
              <div className="input-group">
                <label>Marco V ({displayUnit}) 📏</label>
                <input
                  type="number"
                  value={formatDisplayValue(config.marcoVertical, displayUnit)}
                  onChange={(e) => handleInputChange('marcoVertical', e.target.value)}
                  min={displayUnit === 'm' ? 0.5 : 50}
                  step={displayUnit === 'm' ? 0.1 : 10}
                />
              </div>
            </div>
            <small style={{ fontSize: '11px', color: '#999', marginBottom: '10px', display: 'block' }}>
              Distancia entre plantas (horizontal × vertical)
            </small>

            <div className="input-group">
              <label>Retranqueo ({displayUnit}) 🔲</label>
              <input
                type="number"
                value={formatDisplayValue(config.retranqueo, displayUnit)}
                onChange={(e) => handleInputChange('retranqueo', e.target.value)}
                min="0"
                step={displayUnit === 'm' ? 0.1 : 10}
              />
              <small style={{ fontSize: '11px', color: '#999', marginTop: '4px', display: 'block' }}>
                Margen desde bordes de parcela
              </small>
            </div>

            <div className="input-group">
              <label>Tipo de Riego</label>
              <select
                value={config.tipoRiego}
                onChange={(e) => handleInputChange('tipoRiego', e.target.value)}
              >
                <option value="goteo">Riego por goteo</option>
                <option value="aspersion">Riego por aspersión</option>
                <option value="surcos">Riego por surcos</option>
              </select>
            </div>

            {/* ⭐ NUEVO: Selector de Modo Plantación */}
            <div className="input-group" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
              <label>Modo de Plantación</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button
                  className={`mode-btn ${config.modoPlantacion === 'espaciamiento' ? 'active' : ''}`}
                  onClick={() => setConfig({ ...config, modoPlantacion: 'espaciamiento' })}
                  style={{ flex: 1, fontSize: '12px' }}
                >
                  📏 Por Espaciamiento
                </button>
                <button
                  className={`mode-btn ${config.modoPlantacion === 'cantidad-fija' ? 'active' : ''}`}
                  onClick={() => setConfig({ ...config, modoPlantacion: 'cantidad-fija' })}
                  style={{ flex: 1, fontSize: '12px' }}
                >
                  🌱 Cantidad Fija
                </button>
              </div>
              <small style={{ fontSize: '11px', color: '#999', marginBottom: '10px', display: 'block' }}>
                {config.modoPlantacion === 'espaciamiento'
                  ? 'Define Marco H/V, sistema calcula cantidad'
                  : 'Define cantidades en Cultivos a Plantar, sistema calcula Marco'}
              </small>
            </div>
          </>
        )}
      </section>

      {/* SECTION 2: Cultivos a Plantar */}
      <section className="config-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, flex: 1 }}>Cultivos a Plantar</h3>
          <button
            onClick={() => setCultivosExpanded(!cultivosExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px 8px',
              color: '#2d5016',
              fontWeight: 'bold',
            }}
            title={cultivosExpanded ? 'Colapsar' : 'Expandir'}
          >
            {cultivosExpanded ? '▼' : '▶'}
          </button>
        </div>

        {cultivosExpanded && (
          <CropCategorySelector
            selectedCrops={config.cultivosSeleccionados || []}
            quantities={config.cantidadesCultivos || {}}
            onCropSelect={handleCropSelect}
            onQuantityChange={handleCropQuantityChange}
          />
        )}
      </section>

      {/* SECTION 3: Modo de Plantación */}
      <section className="config-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, flex: 1 }}>Modo de Plantación</h3>
        </div>

        <div className="planting-mode-selector">
          <button
            className={`mode-btn ${config.plantingMode === 'puntos' ? 'active' : ''}`}
            onClick={() => setConfig({ ...config, plantingMode: 'puntos' })}
            title="Puntos individuales"
          >
            ●●●
          </button>
          <button
            className={`mode-btn ${config.plantingMode === 'surcos' ? 'active' : ''}`}
            onClick={() => setConfig({ ...config, plantingMode: 'surcos' })}
            title="Surcos (filas)"
          >
            ═══
          </button>
          <button
            className={`mode-btn ${config.plantingMode === 'filas_dobles' ? 'active' : ''}`}
            onClick={() => setConfig({ ...config, plantingMode: 'filas_dobles' })}
            title="Filas dobles"
          >
            ≡≡≡
          </button>
          <button
            className={`mode-btn ${config.plantingMode === 'tresbolillo' ? 'active' : ''}`}
            onClick={() => setConfig({ ...config, plantingMode: 'tresbolillo' })}
            title="Tresbolillo"
          >
            ◆◇◆
          </button>
        </div>
        <div className="mode-description">
          {config.plantingMode === 'puntos' && <span>Puntos individuales - Máxima flexibilidad</span>}
          {config.plantingMode === 'surcos' && <span>Surcos - Para viña, hortalizas, cereales</span>}
          {config.plantingMode === 'filas_dobles' && <span>Filas Dobles - Cultivo intensivo</span>}
          {config.plantingMode === 'tresbolillo' && <span>Tresbolillo - Densidad optimizada</span>}
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

      {/* Crop Quantity Modal */}
      <CropQuantityModal
        isOpen={showCropModal}
        cropId={selectedCropForQuantity}
        currentQuantity={selectedCropForQuantity ? config.cantidadesCultivos[selectedCropForQuantity] || 0 : 0}
        onConfirm={handleQuantityConfirm}
        onCancel={handleModalCancel}
      />
    </div>
  )
}
