import { useState } from 'react'
import { useGoogleMaps } from './hooks/useGoogleMaps'
import MapContainer from './components/MapContainer'
import ControlPanel from './components/ControlPanel'
import MetricsPanel from './components/MetricsPanel'
import HamburgerMenu from './components/HamburgerMenu'
import { DEFAULT_AGRICULTURAL_CONFIG, DEFAULT_UI_CONFIG } from './config'
import './App.css'

export default function App() {
  // Cargar Google Maps API
  useGoogleMaps()

  // Múltiples parcelas - el usuario puede crear varias
  const [parcelas, setParcelas] = useState([])
  const [selectedParcelaIndex, setSelectedParcelaIndex] = useState(null)
  const parcela = selectedParcelaIndex !== null && parcelas[selectedParcelaIndex] ? parcelas[selectedParcelaIndex] : null

  const setParcela = (newParcela) => {
    if (newParcela === null) {
      // Eliminar la parcela seleccionada
      if (selectedParcelaIndex !== null) {
        const updated = parcelas.filter((_, i) => i !== selectedParcelaIndex)
        setParcelas(updated)
        setSelectedParcelaIndex(updated.length > 0 ? Math.max(0, selectedParcelaIndex - 1) : null)
      }
    } else {
      // Siempre crear una nueva parcela (para permitir múltiples)
      // después de terminar una, el índice se resetea para que la próxima sea nueva
      const updated = [...parcelas, newParcela]
      setParcelas(updated)
      setSelectedParcelaIndex(null) // Reset para permitir la próxima parcela nueva
    }
  }

  const [pozo, setPozo] = useState(null)
  const [config, setConfig] = useState(DEFAULT_AGRICULTURAL_CONFIG)
  const [grid, setGrid] = useState([])
  const [metricas, setMetricas] = useState(null)
  const [panelVisible, setPanelVisible] = useState(true)
  const [panelWidth, setPanelWidth] = useState(DEFAULT_UI_CONFIG.panelWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [displayUnit, setDisplayUnit] = useState(DEFAULT_UI_CONFIG.displayUnit)
  const [searchLocation, setSearchLocation] = useState(null) // { lat, lng, timestamp } de la búsqueda

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
          <>
            <ControlPanel
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
              selectedParcelaIndex={selectedParcelaIndex}
              onSelectParcela={setSelectedParcelaIndex}
              onSearchLocation={setSearchLocation}
            />
            {metricas && <MetricsPanel metricas={metricas} />}
          </>
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
          setMetricas={setMetricas}
          searchLocation={searchLocation}
        />
      </div>
    </div>
  )
}
