import { useState, useCallback, useEffect } from 'react'
import { useGoogleMaps } from './hooks/useGoogleMaps'
import MapContainer from './components/MapContainer'
import SidePanel from './components/SidePanel'
import HamburgerMenu from './components/HamburgerMenu'
import { DEFAULT_AGRICULTURAL_CONFIG, DEFAULT_UI_CONFIG, loadPreferences, savePreferences } from './config'
import './App.css'

export default function App() {
  // Cargar Google Maps API
  useGoogleMaps()

  // Múltiples parcelas - cada una con su propia configuración de plantación
  // Estructura: [{ coords, config }]
  const [parcelas, setParcelas] = useState([])
  const [selectedParcelaIndex, setSelectedParcelaIndex] = useState(null)
  // Sin selección explícita, la parcela activa es la última creada
  // (permite generar grid / vista 3D justo después de dibujarla)
  const activeParcelaIndex = selectedParcelaIndex !== null
    ? selectedParcelaIndex
    : (parcelas.length > 0 ? parcelas.length - 1 : null)
  const parcela = activeParcelaIndex !== null && parcelas[activeParcelaIndex]
    ? parcelas[activeParcelaIndex].coords
    : null

  const [pozo, setPozo] = useState(null)
  const [config, setConfig] = useState(DEFAULT_AGRICULTURAL_CONFIG)

  const setParcela = (newCoords) => {
    if (newCoords === null) {
      // Eliminar la parcela activa
      if (activeParcelaIndex !== null) {
        const updated = parcelas.filter((_, i) => i !== activeParcelaIndex)
        setParcelas(updated)
        setSelectedParcelaIndex(null)
      }
    } else {
      // Nueva parcela: guarda un snapshot de la config actual como suya
      const updated = [...parcelas, { coords: newCoords, config }]
      setParcelas(updated)
      setSelectedParcelaIndex(null) // Reset para permitir la próxima parcela nueva
    }
  }

  // Al cambiar de parcela se carga SU configuración (cada parcela mantiene la suya)
  const handleSelectParcela = (idx) => {
    setSelectedParcelaIndex(idx)
    if (parcelas[idx]?.config) {
      setConfig(parcelas[idx].config)
    }
  }

  // Cualquier cambio de config se persiste en la parcela activa
  useEffect(() => {
    if (activeParcelaIndex === null) return
    setParcelas(prev => {
      const entry = prev[activeParcelaIndex]
      if (!entry || entry.config === config) return prev
      return prev.map((p, i) => (i === activeParcelaIndex ? { ...p, config } : p))
    })
  }, [config, activeParcelaIndex])
  const [grid, setGrid] = useState([])
  const [metricas, setMetricas] = useState(null)
  const [panelVisible, setPanelVisible] = useState(true)
  const [panelWidth, setPanelWidth] = useState(DEFAULT_UI_CONFIG.panelWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [searchLocation, setSearchLocation] = useState(null) // { lat, lng, timestamp } de la búsqueda

  // Preferencias de usuario (Ajustes): persisten en localStorage
  const [preferences, setPreferences] = useState(loadPreferences)
  const [displayUnit, setDisplayUnit] = useState(preferences.displayUnit)

  const handleSavePreferences = (newPrefs) => {
    setPreferences(newPrefs)
    savePreferences(newPrefs)
    setDisplayUnit(newPrefs.displayUnit)
  }

  // Señal para forzar la regeneración del grid desde el botón "Generar Layout"
  // (el grid ya se regenera solo al cambiar config; esto cubre el recálculo manual)
  const [regenerateSignal, setRegenerateSignal] = useState(0)

  // Nodo DOM del slot de la pestaña "Parcela", donde MapContainer porta DrawingToolsPanel.
  // Se usa un callback ref (en vez de useRef) para forzar un re-render en cuanto el nodo se monta.
  const [parcelaTabSlotNode, setParcelaTabSlotNode] = useState(null)
  const parcelaTabSlotRef = useCallback((node) => setParcelaTabSlotNode(node), [])

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  const handleMouseMove = (e) => {
    if (!isResizing) return
    const newWidth = Math.max(DEFAULT_UI_CONFIG.panelWidthMin, Math.min(DEFAULT_UI_CONFIG.panelWidthMax, e.clientX))
    setPanelWidth(newWidth)
  }

  return (
    <div className="app-container" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div
        className="sidebar-container"
        style={{
          width: `${panelWidth}px`,
          transform: panelVisible ? 'translateX(0)' : 'translateX(-100%)',
          position: 'relative'
        }}
      >
        {panelVisible && (
          <SidePanel
            config={config}
            setConfig={setConfig}
            parcela={parcela}
            setParcela={setParcela}
            pozo={pozo}
            grid={grid}
            metricas={metricas}
            displayUnit={displayUnit}
            setDisplayUnit={setDisplayUnit}
            parcelas={parcelas}
            selectedParcelaIndex={activeParcelaIndex}
            onSelectParcela={handleSelectParcela}
            onSearchLocation={setSearchLocation}
            parcelaTabSlotRef={parcelaTabSlotRef}
            preferences={preferences}
            onSavePreferences={handleSavePreferences}
            onGenerateLayout={() => setRegenerateSignal(s => s + 1)}
          />
        )}
        {panelVisible && (
          <div
            className="resize-handle"
            onMouseDown={handleMouseDown}
            title="Arrastra para redimensionar panel"
          />
        )}
      </div>

      <div className="main-content">
        <HamburgerMenu
          isOpen={panelVisible}
          onClick={() => setPanelVisible(!panelVisible)}
        />
        <MapContainer
          parcela={parcela}
          setParcela={setParcela}
          pozo={pozo}
          setPozo={setPozo}
          grid={grid}
          config={config}
          setGrid={setGrid}
          metricas={metricas}
          setMetricas={setMetricas}
          searchLocation={searchLocation}
          portalTarget={parcelaTabSlotNode}
          preferences={preferences}
          regenerateSignal={regenerateSignal}
        />
      </div>
    </div>
  )
}
