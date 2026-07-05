import { useState } from 'react'
import { formatDisplayValue, parseInputValue } from '../utils/geometry'
import { getRecommendedSpacing } from '../utils/cropSpacing'
import { AGRICULTURAL_PROFILES, applyProfile, getMatchingProfileId } from '../config'
import CropQuantityModal from './CropQuantityModal'
import CropCategorySelector from './CropCategorySelector'
import './ControlPanel.css'

const TIPO_RIEGO_LABELS = {
  goteo: 'Goteo',
  aspersion: 'Aspersión',
  surcos: 'Surcos',
}

const PLANTING_MODE_LABELS = {
  puntos: 'Puntos individuales',
  surcos: 'Surcos (filas)',
  filas_dobles: 'Filas dobles',
  tresbolillo: 'Tresbolillo',
}

export default function ControlPanel({ config, setConfig, displayUnit, setDisplayUnit }) {
  const [riegoExpanded, setRiegoExpanded] = useState(true)
  const [cultivosExpanded, setCultivosExpanded] = useState(true)
  const [modoExpanded, setModoExpanded] = useState(true)
  const [showCropModal, setShowCropModal] = useState(false)
  const [selectedCropForQuantity, setSelectedCropForQuantity] = useState(null)

  const riegoSummary = `Marco ${formatDisplayValue(config.marcoHorizontal, displayUnit)}×${formatDisplayValue(config.marcoVertical, displayUnit)}${displayUnit} · Retranqueo ${formatDisplayValue(config.retranqueo, displayUnit)}${displayUnit} · ${TIPO_RIEGO_LABELS[config.tipoRiego] || config.tipoRiego}`

  const numCultivos = (config.cultivosSeleccionados || []).length
  const cultivosSummary = numCultivos > 0
    ? `${numCultivos} cultivo${numCultivos === 1 ? '' : 's'} seleccionado${numCultivos === 1 ? '' : 's'}`
    : 'Sin cultivos seleccionados'

  const modoSummary = PLANTING_MODE_LABELS[config.plantingMode] || config.plantingMode

  const handleInputChange = (field, value) => {
    // Parse the input value based on the current display unit and convert to cm for storage
    const valueCm = parseInputValue(value, displayUnit)
    setConfig(prev => ({
      ...prev,
      [field]: valueCm
    }))
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

    // Autocompleta Marco H/V con el valor agronómico recomendado del cultivo
    // (solo la primera vez que se selecciona; siempre editable después)
    const yaSeleccionado = (config.cultivosSeleccionados || []).includes(cropId)
    const marcoRecomendado = getRecommendedSpacing(cropId)
    if (!yaSeleccionado && marcoRecomendado) {
      setConfig(prev => ({
        ...prev,
        marcoHorizontal: marcoRecomendado.horizontal,
        marcoVertical: marcoRecomendado.vertical,
      }))
    }
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

  const activeProfileId = getMatchingProfileId(config)

  return (
    <div className="control-panel">
      {/* SECTION 0: Perfiles agrícolas predefinidos */}
      <section className="config-section">
        <h3 style={{ margin: '0 0 4px 0' }}>Perfiles rápidos</h3>
        <small style={{ fontSize: '11px', color: '#999', marginBottom: '10px', display: 'block' }}>
          Aplica marco, retranqueo, riego y modo en un clic
        </small>
        <div className="profile-chips">
          {Object.values(AGRICULTURAL_PROFILES).map(profile => (
            <button
              key={profile.id}
              className={`profile-chip ${activeProfileId === profile.id ? 'active' : ''}`}
              onClick={() => setConfig(prev => applyProfile(prev, profile.id))}
              title={profile.description}
            >
              {profile.icon} {profile.name}
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 1: Tipo de Riego y Márgenes */}
      <section className="config-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: riegoExpanded ? '15px' : '0' }}>
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

        {!riegoExpanded && (
          <p className="section-summary">{riegoSummary}</p>
        )}

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: cultivosExpanded ? '15px' : '0' }}>
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

        {!cultivosExpanded && (
          <p className="section-summary">{cultivosSummary}</p>
        )}

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: modoExpanded ? '15px' : '0' }}>
          <h3 style={{ margin: 0, flex: 1 }}>Modo de Plantación</h3>
          <button
            onClick={() => setModoExpanded(!modoExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px 8px',
              color: '#2d5016',
              fontWeight: 'bold',
            }}
            title={modoExpanded ? 'Colapsar' : 'Expandir'}
          >
            {modoExpanded ? '▼' : '▶'}
          </button>
        </div>

        {!modoExpanded && (
          <p className="section-summary">{modoSummary}</p>
        )}

        {modoExpanded && (
        <>
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
        </>
        )}
      </section>

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
