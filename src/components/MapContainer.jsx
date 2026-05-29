import { useRef, useEffect, useState } from 'react'
import { generatePlantingGrid } from '../utils/geometry'
import './MapContainer.css'

const MAP_STYLES = {
  container: {
    width: '100%',
    height: '100%'
  }
}

export default function MapContainer({ parcela, setParcela, pozo, setPozo, grid, config, setGrid, setMetricas }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [drawingManager, setDrawingManager] = useState(null)
  const [parcelaPolygon, setParcelaPolygon] = useState(null)
  const [pozoMarker, setPozoMarker] = useState(null)
  const [gridMarkers, setGridMarkers] = useState([])

  // Inicializar Google Map
  useEffect(() => {
    const initMap = () => {
      const mapOptions = {
        center: { lat: 40.4168, lng: -3.7038 }, // Madrid
        zoom: 15,
        mapTypeId: 'satellite',
        tilt: 0,
        heading: 0,
      }

      const googleMap = new window.google.maps.Map(mapRef.current, mapOptions)
      setMap(googleMap)

      // Inicializar DrawingManager para polígonos
      const dm = new window.google.maps.drawing.DrawingManager({
        drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            window.google.maps.drawing.OverlayType.POLYGON,
            window.google.maps.drawing.OverlayType.MARKER,
          ],
        },
        polygonOptions: {
          clickable: true,
          editable: true,
          fillColor: '#4CAF50',
          fillOpacity: 0.3,
          strokeColor: '#2d5016',
          strokeWeight: 2,
        },
        markerOptions: {
          icon: '💧', // Icono de agua para el pozo
        },
      })

      dm.setMap(googleMap)
      setDrawingManager(dm)

      // Listener para completar dibujos (polígonos y marcadores)
      window.google.maps.event.addListener(dm, 'overlaycomplete', (event) => {
        if (event.type === window.google.maps.drawing.OverlayType.POLYGON) {
          // Convertir polígono a array de coordenadas
          const path = event.overlay.getPath()
          const coords = path.getArray().map(latLng => [latLng.lng(), latLng.lat()])

          // Cerrar el polígono
          coords.push(coords[0])

          setParcela(coords)
          setParcelaPolygon(event.overlay)

          // Deshabilitar dibujo de polígonos una vez dibujado uno
          dm.setDrawingMode(null)
        } else if (event.type === window.google.maps.drawing.OverlayType.MARKER) {
          // Pozo marcador
          const position = event.overlay.getPosition()
          setPozo([position.lng(), position.lat()])
          setPozoMarker(event.overlay)

          // Cambiar icono del marcador
          event.overlay.setIcon({
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#2196F3',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          })
        }
      })
    }

    if (window.google && window.google.maps) {
      initMap()
    }
  }, [])

  // Renderizar puntos del grid cuando cambia
  useEffect(() => {
    if (!map || !grid || grid.length === 0) return

    // Limpiar marcadores anteriores
    gridMarkers.forEach(marker => marker.setMap(null))

    // Crear nuevos marcadores para cada punto del grid
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

  // Escuchar cambios en parcela para regenerar grid
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

  return <div ref={mapRef} style={MAP_STYLES.container} className="map-container" />
}
