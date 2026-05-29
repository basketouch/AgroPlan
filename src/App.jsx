import { useState } from 'react'
import { useGoogleMaps } from './hooks/useGoogleMaps'
import MapContainer from './components/MapContainer'
import ControlPanel from './components/ControlPanel'
import MetricsPanel from './components/MetricsPanel'
import HamburgerMenu from './components/HamburgerMenu'
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
    } else if (selectedParcelaIndex !== null) {
      // Actualizar la parcela seleccionada
      const updated = [...parcelas]
      updated[selectedParcelaIndex] = newParcela
      setParcelas(updated)
    } else {
      // Crear una nueva parcela (cuando no hay ninguna seleccionada)
      const updated = [...parcelas, newParcela]
      setParcelas(updated)
      setSelectedParcelaIndex(updated.length - 1)
    }
  }

  const [pozo, setPozo] = useState(null)
  const [config, setConfig] = useState({
    marcoHorizontal: 700,
    marcoVertical: 700,
    retranqueo: 500,
    tipoRiego: 'goteo',
    cultivosSeleccionados: [],
    modoPlantacion: 'espaciamiento', // 'espaciamiento' | 'cantidad-fija'
    cantidadesCultivos: {
      // Hortalizas
      tomate: 0,
      patata: 0,
      lechuga: 0,
      cebolla: 0,
      pimiento: 0,
      pepino: 0,
      zanahoria: 0,
      // Extensivo
      trigo: 0,
      maiz: 0,
      girasol: 0,
      // Aromáticas
      romero: 0,
      tomillo: 0,
      oregano: 0,
    },
    plantingMode: 'puntos'
  })
  const [grid, setGrid] = useState([])
  const [metricas, setMetricas] = useState(null)
  const [panelVisible, setPanelVisible] = useState(true)
  const [panelWidth, setPanelWidth] = useState(380)
  const [isResizing, setIsResizing] = useState(false)
  const [displayUnit, setDisplayUnit] = useState('cm') // 'cm' or 'm'

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  const handleMouseMove = (e) => {
    if (!isResizing) return
    const newWidth = Math.max(300, Math.min(600, e.clientX))
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
        />
      </div>
    </div>
  )
}
