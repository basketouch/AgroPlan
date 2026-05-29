import { useState } from 'react'
import MapContainer from './components/MapContainer'
import ControlPanel from './components/ControlPanel'
import MetricsPanel from './components/MetricsPanel'
import './App.css'

export default function App() {
  const [parcela, setParcela] = useState(null)
  const [pozo, setPozo] = useState(null)
  const [config, setConfig] = useState({
    marcoHorizontal: 7,
    marcoVertical: 7,
    retranqueo: 5,
  })
  const [grid, setGrid] = useState([])
  const [metricas, setMetricas] = useState(null)

  return (
    <div className="app-container">
      <ControlPanel
        config={config}
        setConfig={setConfig}
        parcela={parcela}
        pozo={pozo}
        grid={grid}
        metricas={metricas}
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
      {metricas && <MetricsPanel metricas={metricas} />}
    </div>
  )
}
