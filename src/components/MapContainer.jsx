import { useRef, useEffect, useState } from 'react'
import { generatePlantingGrid } from '../utils/geometry'
import './MapContainer.css'

export default function MapContainer({ parcela, setParcela, pozo, setPozo, grid, config, setGrid, setMetricas }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [drawingMode, setDrawingMode] = useState('polygon') // 'polygon' o 'marker'
  const [polygonPoints, setPolygonPoints] = useState([])
  const [parcelaPolygon, setParcelaPolygon] = useState(null)
  const [pozoMarker, setPozoMarker] = useState(null)
  const [gridMarkers, setGridMarkers] = useState([])
  const [polygonLine, setPolygonLine] = useState(null)

  // Inicializar Google Map
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !window.google.maps) {
        console.error('Google Maps API no cargada')
        setTimeout(initMap, 1000)
        return
      }

      const mapOptions = {
        center: { lat: 40.4168, lng: -3.7038 }, // Madrid
        zoom: 15,
        mapTypeId: 'satellite',
        tilt: 0,
        heading: 0,
      }

      const googleMap = new window.google.maps.Map(mapRef.current, mapOptions)
      setMap(googleMap)

      // Listener para clicks en el mapa (dibujar polígono o marcar pozo)
      googleMap.addListener('click', (event) => {
        if (drawingMode === 'polygon') {
          handlePolygonClick(event.latLng, googleMap)
        } else if (drawingMode === 'marker') {
          handleMarkerClick(event.latLng, googleMap)
        }
      })
    }

    initMap()
  }, [drawingMode])

  // Manejar clicks para polígono
  const handlePolygonClick = (latLng, googleMap) => {
    const newPoint = [latLng.lng(), latLng.lat()]
    const newPoints = [...polygonPoints, newPoint]
    setPolygonPoints(newPoints)

    // Renderizar puntos del polígono
    new window.google.maps.Marker({
      position: latLng,
      map: googleMap,
      title: `Punto ${newPoints.length}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: '#2d5016',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      },
    })

    // Dibujar línea conectando puntos
    if (newPoints.length > 1) {
      if (polygonLine) polygonLine.setMap(null)

      const polyline = new window.google.maps.Polyline({
        path: newPoints.map(p => ({ lng: p[0], lat: p[1] })),
        geodesic: true,
        strokeColor: '#2d5016',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: googleMap,
      })
      setPolygonLine(polyline)
    }
  }

  // Manejar clicks para marcador (pozo)
  const handleMarkerClick = (latLng, googleMap) => {
    // Limpiar marcador anterior
    if (pozoMarker) pozoMarker.setMap(null)

    const marker = new window.google.maps.Marker({
      position: latLng,
      map: googleMap,
      title: 'Pozo',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#2196F3',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      },
    })

    setPozoMarker(marker)
    setPozo([latLng.lng(), latLng.lat()])
    setDrawingMode('polygon') // Volver a modo polígono
  }

  // Finalizar polígono
  const handleFinishPolygon = (googleMap) => {
    if (polygonPoints.length < 3) {
      alert('Se necesitan al menos 3 puntos para crear un polígono')
      return
    }

    // Cerrar el polígono
    const closedPoints = [...polygonPoints, polygonPoints[0]]

    // Limpiar línea anterior
    if (polygonLine) polygonLine.setMap(null)

    // Crear polígono
    const polygon = new window.google.maps.Polygon({
      paths: closedPoints.map(p => ({ lng: p[0], lat: p[1] })),
      strokeColor: '#2d5016',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#4CAF50',
      fillOpacity: 0.3,
      map: googleMap,
    })

    setParcelaPolygon(polygon)
    setParcela(closedPoints)
    setPolygonPoints([]) // Limpiar puntos temporales
    setDrawingMode('marker') // Cambiar a modo marcador
  }

  // Limpiar dibujo
  const handleClearDrawing = () => {
    if (parcelaPolygon) parcelaPolygon.setMap(null)
    if (polygonLine) polygonLine.setMap(null)
    if (pozoMarker) pozoMarker.setMap(null)

    setParcelaPolygon(null)
    setPolygonLine(null)
    setPozoMarker(null)
    setPolygonPoints([])
    setParcela(null)
    setPozo(null)
    setDrawingMode('polygon')
  }

  // Renderizar puntos del grid
  useEffect(() => {
    if (!map || !grid || grid.length === 0) return

    gridMarkers.forEach(marker => marker.setMap(null))

    const newMarkers = grid.map(point => {
      const [lng, lat] = point.geometry.coordinates
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: 'Planta',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 4,
          fillColor: '#4CAF50',
          fillOpacity: 0.8,
          strokeColor: '#2d5016',
          strokeWeight: 1,
        },
      })
      return marker
    })

    setGridMarkers(newMarkers)
  }, [grid, map])

  // Regenerar grid cuando cambian parcela/pozo/config
  useEffect(() => {
    if (parcela && pozo && config) {
      try {
        const result = generatePlantingGrid(parcela, pozo, config)
        setGrid(result.points)
        setMetricas(result.metricas)
      } catch (error) {
        console.error('Error generando grid:', error)
      }
    }
  }, [parcela, pozo, config])

  return (
    <div className="map-container-wrapper">
      <div ref={mapRef} className="map-container" />

      {/* Controles de dibujo */}
      <div className="drawing-controls">
        <div className="controls-group">
          <button
            className={`control-btn ${drawingMode === 'polygon' ? 'active' : ''}`}
            onClick={() => setDrawingMode('polygon')}
            title="Dibujar parcela (hacer clic en el mapa)"
          >
            📐 Polígono
          </button>
          <button
            className={`control-btn ${drawingMode === 'marker' ? 'active' : ''}`}
            onClick={() => setDrawingMode('marker')}
            title="Marcar pozo (hacer clic en el mapa)"
          >
            💧 Pozo
          </button>
        </div>

        {polygonPoints.length > 0 && (
          <div className="controls-group">
            <button
              className="control-btn finish"
              onClick={() => handleFinishPolygon(map)}
              title={`Terminar polígono (${polygonPoints.length} puntos)`}
            >
              ✓ Terminar ({polygonPoints.length})
            </button>
          </div>
        )}

        {(parcela || pozo || polygonPoints.length > 0) && (
          <div className="controls-group">
            <button
              className="control-btn clear"
              onClick={handleClearDrawing}
              title="Limpiar dibujo"
            >
              🗑️ Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      {drawingMode === 'polygon' && polygonPoints.length === 0 && (
        <div className="drawing-status">
          Haz clic en el mapa para dibujar la parcela
        </div>
      )}
      {drawingMode === 'polygon' && polygonPoints.length > 0 && (
        <div className="drawing-status">
          {polygonPoints.length} puntos. Clic para agregar más o terminar.
        </div>
      )}
      {drawingMode === 'marker' && !pozo && (
        <div className="drawing-status">
          Haz clic en el mapa para marcar el pozo
        </div>
      )}
    </div>
  )
}
