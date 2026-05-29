import { useRef, useEffect, useState, useCallback } from 'react'
import { generatePlantingGrid, isPointInPolygon } from '../utils/geometry'
import { getCropColor } from '../utils/cropColors'
import { validatePolygon } from '../utils/polygonValidation'
import TractorLineGuide from './TractorLineGuide'
import ScenarioComparatorModal from './ScenarioComparatorModal'
import OptimizationResultsModal from './OptimizationResultsModal'
import ObstaclePanel from './ObstaclePanel'
import DrawingToolsPanel from './DrawingToolsPanel'
import { calculateAngleFromLine } from '../utils/orientationCalculator'
import { useDebounce } from '../hooks/useDebounce'
import { useScenarioComparator } from '../hooks/useScenarioComparator'
import { useAutoOptimizer } from '../hooks/useAutoOptimizer'
import { useDrawingHistory } from '../hooks/useDrawingHistory'
import { usePolygonMarkerSync } from '../hooks/usePolygonMarkerSync'
import { createObstacle, OBSTACLE_TYPES } from '../utils/obstacleHelpers'
import {
  snapToGrid as snapToGridFn,
  generateSmoothCurve,
  findClosestPointOnSegment,
  MovePointCommand,
  InsertPointCommand,
  RemovePointAtIndexCommand
} from '../utils/drawingCommands'
import './MapContainer.css'

export default function MapContainer({ parcela, setParcela, pozo, setPozo, grid, config, setGrid, setMetricas }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [drawingMode, setDrawingMode] = useState('polygon') // 'polygon', 'marker', 'tractorLine'
  const [polygonPoints, setPolygonPoints] = useState([])
  const [parcelaPolygon, setParcelaPolygon] = useState(null)
  const [bufferedParcelaPolygon, setBufferedParcelaPolygon] = useState(null) // Visualización del área útil
  const [pozoMarker, setPozoMarker] = useState(null)
  const [gridMarkers, setGridMarkers] = useState([])
  const [polygonLine, setPolygonLine] = useState(null)
  const [polygonPointMarkers, setPolygonPointMarkers] = useState([])
  const [tractorLineActive, setTractorLineActive] = useState(false)
  const [tractorLinePoints, setTractorLinePoints] = useState(null)
  const [tractorLinePolyline, setTractorLinePolyline] = useState(null)
  const [tractorLineMarkers, setTractorLineMarkers] = useState([])
  const [orientationAngle, setOrientationAngle] = useState(0)
  const [isRegeneratingGrid, setIsRegeneratingGrid] = useState(false)
  const [showComparator, setShowComparator] = useState(false)
  const [obstacles, setObstacles] = useState([])
  const [currentObstacleType, setCurrentObstacleType] = useState(null)
  const [obstacleMarkers, setObstacleMarkers] = useState([])
  const [obstacleCircles, setObstacleCircles] = useState([])

  // Scenario Comparator hook
  const { scenarios, bestScenario, isCalculating, compareAngles, reset: resetComparator } = useScenarioComparator()

  // Auto Optimizer hook
  const { isOptimizing, optimizationResults, bestConfiguration, optimize, reset: resetOptimizer } = useAutoOptimizer()
  const [showOptimizer, setShowOptimizer] = useState(false)

  // Drawing Editor states
  const drawingHistory = useDrawingHistory(polygonPoints)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [smoothCurves, setSmoothCurves] = useState(false)
  const [editorDrawingMode, setEditorDrawingMode] = useState('addPoints') // 'addPoints', 'movePoint', 'insertPoint', 'idle'
  const [selectedPointIndex, setSelectedPointIndex] = useState(null)
  const [draggingPoint, setDraggingPoint] = useState(null)
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null)

  // Polygon validation state
  const [validationStatus, setValidationStatus] = useState(null)

  // Debounce config to prevent excessive grid recalculations
  const debouncedConfig = useDebounce(config, 300)

  // Sync tractorLineActive with drawing mode
  useEffect(() => {
    setTractorLineActive(drawingMode === 'tractorLine')
  }, [drawingMode])

  // Manejar clicks para polígono con soporte para insert mode y snap-to-grid
  const handlePolygonClick = useCallback((latLng, googleMap) => {
    let newPoint = [latLng.lng(), latLng.lat()]

    // Aplicar snap-to-grid si está activado
    if (snapToGrid) {
      newPoint = snapToGridFn(newPoint, 5) // 5 metros de grid
    }

    // Modo: insertar punto en línea existente
    if (editorDrawingMode === 'insertPoint' && polygonPoints.length >= 2) {
      let closestSegment = null
      let minDistance = Infinity
      let segmentIndex = -1

      // Encontrar el segmento más cercano
      for (let i = 0; i < polygonPoints.length; i++) {
        const p1 = polygonPoints[i]
        const p2 = polygonPoints[(i + 1) % polygonPoints.length]
        const result = findClosestPointOnSegment(p1, p2, newPoint)

        if (result.distance < minDistance && result.parameter > 0 && result.parameter < 1) {
          minDistance = result.distance
          closestSegment = result
          segmentIndex = i + 1
        }
      }

      if (closestSegment && minDistance < 0.005) {
        // Insertar el punto
        const updatedPoints = [...polygonPoints]
        updatedPoints.splice(segmentIndex, 0, newPoint)
        setPolygonPoints(updatedPoints)
        drawingHistory.setState({ polygonPoints: updatedPoints })
        setEditorDrawingMode('addPoints') // Volver a modo añadir
      }
      return
    }

    // Modo normal: añadir punto al final
    const newPoints = [...polygonPoints, newPoint]
    setPolygonPoints(newPoints)
    drawingHistory.setState({ polygonPoints: newPoints })

    // Renderizar puntos del polígono con soporte para dragging
    const marker = new window.google.maps.Marker({
      position: { lat: newPoint[1], lng: newPoint[0] },
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
      draggable: true
    })

    // Agregar event listeners para dragging
    const pointIndex = newPoints.length - 1
    marker.addListener('mousedown', () => {
      setEditorDrawingMode('movePoint')
      setDraggingPoint(pointIndex)
      setSelectedPointIndex(pointIndex)
    })

    marker.addListener('dragend', (event) => {
      const draggedCoords = [event.latLng.lng(), event.latLng.lat()]
      const finalCoords = snapToGrid ? snapToGridFn(draggedCoords, 5) : draggedCoords

      const updatedPoints = [...polygonPoints]
      updatedPoints[pointIndex] = finalCoords
      setPolygonPoints(updatedPoints)
      drawingHistory.setState({ polygonPoints: updatedPoints })

      setEditorDrawingMode('addPoints')
      setDraggingPoint(null)
    })

    marker.addListener('click', () => {
      setSelectedPointIndex(pointIndex)
    })

    // Guardar marcador en estado para limpieza posterior
    setPolygonPointMarkers(prev => [...prev, marker])

    // Dibujar línea conectando puntos (con opción de suavizado)
    if (newPoints.length > 1) {
      if (polygonLine) polygonLine.setMap(null)

      const pointsForLine = smoothCurves ? generateSmoothCurve(newPoints) : newPoints

      const polyline = new window.google.maps.Polyline({
        path: pointsForLine.map(p => ({ lng: p[0], lat: p[1] })),
        geodesic: true,
        strokeColor: '#2d5016',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: googleMap,
      })
      setPolygonLine(polyline)
    }
  }, [polygonPoints, polygonLine, snapToGrid, editorDrawingMode, smoothCurves, drawingHistory])

  // Manejar clicks para marcador (pozo)
  const handleMarkerClick = useCallback((latLng, googleMap) => {
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
  }, [pozoMarker])

  // Manejar clicks para marcar obstáculos
  const handleObstacleClick = useCallback((latLng, googleMap) => {
    if (!currentObstacleType || !parcela) return

    // Verificar si el punto está dentro de la parcela
    const point = [latLng.lng(), latLng.lat()]
    const parcelaFeature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [parcela.map(p => [p[0], p[1]])]
      }
    }
    const pointFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: point
      }
    }

    // Importar turf para validación de puntos en polígono
    try {
      // Usar la función turf de geometry.js si está disponible
      // Para simplificar, usamos un método manual de punto en polígono
      const isInside = isPointInPolygon(point, parcela)

      if (!isInside) {
        // Mostrar alerta de que el obstáculo debe estar dentro de la parcela
        alert('⚠️ El obstáculo debe estar dentro de la parcela')
        return
      }

      const coordinates = point
      const newObstacle = createObstacle(currentObstacleType, coordinates)

      // Crear marcador
      const marker = new window.google.maps.Marker({
        position: latLng,
        map: googleMap,
        title: newObstacle.label,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: newObstacle.color,
          fillOpacity: 0.8,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      })

      // Crear círculo de exclusión
      const obstacleTypeInfo = OBSTACLE_TYPES[currentObstacleType]
      const circle = new window.google.maps.Circle({
        center: latLng,
        radius: obstacleTypeInfo.radius,
        map: googleMap,
        fillColor: newObstacle.color,
        fillOpacity: 0.1,
        strokeColor: newObstacle.color,
        strokeOpacity: 0.4,
        strokeWeight: 1,
      })

      // Agregar a la lista
      setObstacles(prev => [...prev, newObstacle])
      setObstacleMarkers(prev => [...prev, marker])
      setObstacleCircles(prev => [...prev, circle])

      // Resetear tipo de obstáculo
      setCurrentObstacleType(null)
    } catch (error) {
      console.error('Error al validar obstáculo:', error)
    }
  }, [currentObstacleType, parcela])

  // Manejar clicks para línea de tractor
  const handleTractorLineClick = useCallback((latLng, googleMap) => {
    const newPoint = [latLng.lng(), latLng.lat()]
    let newPoints = tractorLinePoints ? [...tractorLinePoints] : []

    // Si ya hay dos puntos, reemplazar los dos (nueva línea)
    if (newPoints.length >= 2) {
      newPoints = [newPoints[1], newPoint] // Mantener el último y agregar el nuevo
    } else {
      newPoints.push(newPoint)
    }

    setTractorLinePoints(newPoints)

    // Limpiar marcadores antiguos
    tractorLineMarkers.forEach(m => m.setMap(null))

    // Crear nuevos marcadores
    const newMarkers = []
    newPoints.forEach((point, idx) => {
      const marker = new window.google.maps.Marker({
        position: { lat: point[1], lng: point[0] },
        map: googleMap,
        title: `Punto ${idx + 1}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#FF9800',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        draggable: true,
      })

      // Agregar evento de arrastre
      marker.addListener('drag', (event) => {
        const updatedPoint = [event.latLng.lng(), event.latLng.lat()]
        newPoints[idx] = updatedPoint
        setTractorLinePoints([...newPoints])

        // Actualizar línea mientras se arrastra
        if (newPoints.length === 2) {
          if (tractorLinePolyline) tractorLinePolyline.setMap(null)
          const polyline = new window.google.maps.Polyline({
            path: newPoints.map(p => ({ lng: p[0], lat: p[1] })),
            geodesic: true,
            strokeColor: '#FF9800',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map: googleMap,
          })
          setTractorLinePolyline(polyline)
        }
      })

      newMarkers.push(marker)
    })

    setTractorLineMarkers(newMarkers)

    // Dibujar línea conectando puntos
    if (newPoints.length === 2) {
      if (tractorLinePolyline) tractorLinePolyline.setMap(null)

      const polyline = new window.google.maps.Polyline({
        path: newPoints.map(p => ({ lng: p[0], lat: p[1] })),
        geodesic: true,
        strokeColor: '#FF9800',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: googleMap,
      })
      setTractorLinePolyline(polyline)

      // Calculate angle from the two points and update orientation
      const angle = calculateAngleFromLine(newPoints[0], newPoints[1])
      setOrientationAngle(angle)
    }
  }, [tractorLinePoints, tractorLinePolyline, tractorLineMarkers])

  // Inicializar Google Map
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !window.google.maps) {
        setTimeout(initMap, 500)
        return
      }

      const mapOptions = {
        center: { lat: 40.4168, lng: -3.7038 },
        zoom: 15,
        mapTypeId: 'satellite',
        tilt: 0,
        heading: 0,
      }

      const googleMap = new window.google.maps.Map(mapRef.current, mapOptions)
      setMap(googleMap)
    }

    initMap()
  }, [])

  // Sincronizar marcadores con puntos del polígono (especialmente después de undo/redo)
  const markerSyncHandlers = {
    onClick: (idx) => setSelectedPointIndex(idx),
    onRightClick: (idx, latLng) => {
      // Placeholder para context menu (Phase 4)
      console.log('Right-click on point', idx)
    },
    onMouseEnter: (idx) => setHoveredPointIndex(idx),
    onMouseLeave: (idx) => setHoveredPointIndex(null),
    onDragStart: (idx) => {
      setDraggingPoint(idx)
      setSelectedPointIndex(idx)
      setEditorDrawingMode('movePoint')
    },
    onDrag: (idx, coords) => {
      // Live update during drag (visual feedback)
    },
    onDragEnd: (idx, coords) => {
      const updatedPoints = [...polygonPoints]
      updatedPoints[idx] = snapToGrid ? snapToGridFn(coords, 5) : coords
      setPolygonPoints(updatedPoints)
      drawingHistory.setState({ polygonPoints: updatedPoints })
      setDraggingPoint(null)
      setEditorDrawingMode('addPoints')
    }
  }

  // Call the marker sync hook
  usePolygonMarkerSync(polygonPoints, selectedPointIndex, draggingPoint, map, markerSyncHandlers)

  // Actualizar listener de clicks cuando cambian drawingMode o handlers
  useEffect(() => {
    if (!map) return

    const handleMapClick = (event) => {
      if (drawingMode === 'polygon') {
        handlePolygonClick(event.latLng, map)
      } else if (drawingMode === 'marker') {
        handleMarkerClick(event.latLng, map)
      } else if (drawingMode === 'tractorLine') {
        handleTractorLineClick(event.latLng, map)
      } else if (drawingMode === 'obstacle') {
        handleObstacleClick(event.latLng, map)
      }
    }

    const listener = map.addListener('click', handleMapClick)

    return () => {
      listener.remove()
    }
  }, [map, drawingMode, handlePolygonClick, handleMarkerClick, handleTractorLineClick, handleObstacleClick])

  // Zoom espectacular a la parcela
  const fitMapToParcela = useCallback((googleMap, points) => {
    const bounds = new window.google.maps.LatLngBounds()

    // Agregar todos los puntos a los bounds
    points.forEach(point => {
      bounds.extend(new window.google.maps.LatLng(point[1], point[0]))
    })

    // Hacer zoom con animación suave
    googleMap.fitBounds(bounds, { top: 100, right: 100, bottom: 100, left: 100 })
  }, [])

  // Finalizar polígono
  const handleFinishPolygon = useCallback((googleMap) => {
    if (polygonPoints.length < 3) {
      alert('Se necesitan al menos 3 puntos para crear un polígono')
      return
    }

    // Validar polígono antes de finalizar
    const validation = validatePolygon(polygonPoints)

    if (!validation.isValid) {
      // Hay errores críticos - no permitir finalizar
      const errorMessage = validation.errors.join('\n')
      alert(`❌ No se puede finalizar el polígono:\n\n${errorMessage}`)
      return
    }

    // Si hay advertencias, mostrar pero permitir continuar
    if (validation.warnings.length > 0) {
      const warningMessage = validation.warnings.join('\n')
      const confirmed = window.confirm(
        `⚠️ El polígono tiene advertencias:\n\n${warningMessage}\n\n¿Deseas continuar de todas formas?`
      )
      if (!confirmed) return
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

    // 🎬 ZOOM ESPECTACULAR a la parcela
    setTimeout(() => {
      fitMapToParcela(googleMap, closedPoints.slice(0, -1)) // Sin el punto duplicado del cierre
    }, 300) // Pequeño delay para que el polígono se pinte primero
  }, [polygonPoints, polygonLine, fitMapToParcela])

  // Limpiar dibujo completamente
  const handleClearDrawing = useCallback(() => {
    // Limpiar polígono
    if (parcelaPolygon) parcelaPolygon.setMap(null)
    if (bufferedParcelaPolygon) bufferedParcelaPolygon.setMap(null)
    if (polygonLine) polygonLine.setMap(null)

    // Limpiar marcador del pozo
    if (pozoMarker) pozoMarker.setMap(null)

    // Limpiar marcadores de puntos del polígono
    polygonPointMarkers.forEach(marker => marker.setMap(null))

    // Limpiar línea de tractor
    if (tractorLinePolyline) tractorLinePolyline.setMap(null)
    tractorLineMarkers.forEach(marker => marker.setMap(null))

    // Limpiar obstáculos
    obstacleMarkers.forEach(marker => marker.setMap(null))
    obstacleCircles.forEach(circle => circle.setMap(null))

    // Limpiar marcadores del grid (plantas)
    gridMarkers.forEach(marker => marker.setMap(null))

    // Resetear todos los estados
    setParcelaPolygon(null)
    setBufferedParcelaPolygon(null)
    setPolygonLine(null)
    setPozoMarker(null)
    setPolygonPoints([])
    setPolygonPointMarkers([])
    setTractorLinePolyline(null)
    setTractorLinePoints(null)
    setTractorLineMarkers([])
    setTractorLineActive(false)
    setOrientationAngle(0)
    setObstacles([])
    setObstacleMarkers([])
    setObstacleCircles([])
    setCurrentObstacleType(null)
    setParcela(null)
    setPozo(null)
    setGrid([])
    setMetricas(null)
    setGridMarkers([])
    setDrawingMode('polygon')
    // Reset drawing editor states
    drawingHistory.clearHistory([])
    setSnapToGrid(false)
    setSmoothCurves(false)
    setEditorDrawingMode('addPoints')
    setSelectedPointIndex(null)
    setDraggingPoint(null)
  }, [parcelaPolygon, bufferedParcelaPolygon, polygonLine, pozoMarker, polygonPointMarkers, gridMarkers, tractorLinePolyline, tractorLineMarkers, obstacleMarkers, obstacleCircles, drawingHistory])


  // Aplicar configuración optimizada (nota: necesita ser pasada desde ControlPanel)
  // Por ahora solo actualizamos el ángulo, el config debe actualizar desde ControlPanel
  const handleApplyOptimizedConfig = useCallback((optimizedConfig) => {
    // Update orientation angle
    setOrientationAngle(optimizedConfig.angle)
  }, [])

  // Keyboard shortcuts for drawing editor
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when drawing polygon
      if (drawingMode !== 'polygon') return

      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const previousState = drawingHistory.undo()
        if (previousState?.polygonPoints) {
          setPolygonPoints(previousState.polygonPoints)
        }
      }

      // Ctrl+Shift+Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        const nextState = drawingHistory.redo()
        if (nextState?.polygonPoints) {
          setPolygonPoints(nextState.polygonPoints)
        }
      }

      // Delete: Remove selected point (with undo/redo support)
      if (e.key === 'Delete' && selectedPointIndex !== null) {
        e.preventDefault()
        if (polygonPoints.length > 3) {
          const command = new RemovePointAtIndexCommand(polygonPoints, selectedPointIndex)
          const newState = drawingHistory.executeCommand(command)
          setPolygonPoints(newState.polygonPoints)
          setSelectedPointIndex(null)
        } else {
          alert('❌ Se necesitan al menos 3 puntos para un polígono válido')
        }
      }

      // S: Toggle snap to grid
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        setSnapToGrid(!snapToGrid)
      }

      // C: Toggle smooth curves
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        setSmoothCurves(!smoothCurves)
      }

      // I: Toggle insert point mode
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault()
        setEditorDrawingMode(editorDrawingMode === 'insertPoint' ? 'addPoints' : 'insertPoint')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawingMode, selectedPointIndex, snapToGrid, smoothCurves, editorDrawingMode, polygonPoints, drawingHistory])

  // Real-time polygon validation
  useEffect(() => {
    if (drawingMode === 'polygon' && polygonPoints.length >= 3) {
      // Only validate complete polygons (need at least 3 points)
      const validation = validatePolygon(polygonPoints)
      setValidationStatus(validation)
    } else if (polygonPoints.length < 3) {
      setValidationStatus(null)
    }
  }, [polygonPoints, drawingMode])

  // Renderizar puntos del grid
  useEffect(() => {
    if (!map || !grid || grid.length === 0) return

    gridMarkers.forEach(marker => marker.setMap(null))

    const newMarkers = grid.map(point => {
      const [lng, lat] = point.geometry.coordinates
      const cultivo = point.properties?.cultivo || 'tomate'
      const color = getCropColor(cultivo)
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: cultivo.charAt(0).toUpperCase() + cultivo.slice(1),
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 4,
          fillColor: color,
          fillOpacity: 0.8,
          strokeColor: '#fff',
          strokeWeight: 1,
        },
      })
      return marker
    })

    setGridMarkers(newMarkers)
  }, [grid, map])

  // Regenerar grid cuando cambian parcela/pozo/config/orientationAngle/obstacles (debounced para performance)
  useEffect(() => {
    if (parcela && pozo && debouncedConfig && map) {
      setIsRegeneratingGrid(true)
      try {
        const configWithOrientation = {
          ...debouncedConfig,
          orientationAngle: orientationAngle
        }
        const result = generatePlantingGrid(parcela, pozo, configWithOrientation, obstacles)
        setGrid(result.points)
        setMetricas(result.metricas)

        // ✨ Visualizar el área buffered (área útil de plantación)
        if (result.bufferedParcelaCoords) {
          // Limpiar polígono anterior
          if (bufferedParcelaPolygon) bufferedParcelaPolygon.setMap(null)

          // Crear nuevo polígono para el área buffered
          const bufferedPolygon = new window.google.maps.Polygon({
            paths: result.bufferedParcelaCoords.map(p => ({ lng: p[0], lat: p[1] })),
            strokeColor: '#558B2F',
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: '#9CCC65',
            fillOpacity: 0.15,
            map: map,
          })
          setBufferedParcelaPolygon(bufferedPolygon)
        }
      } catch (error) {
        console.error('Error generando grid:', error)
      } finally {
        setIsRegeneratingGrid(false)
      }
    }
  }, [parcela, pozo, debouncedConfig, orientationAngle, obstacles, map, bufferedParcelaPolygon])

  return (
    <div className="map-container-wrapper">
      <div ref={mapRef} className="map-container" />

      {/* Tractor Line Guide Control */}
      <TractorLineGuide
        isActive={tractorLineActive && parcela && pozo}
        parcela={parcela}
        currentAngle={orientationAngle}
        onAngleChange={setOrientationAngle}
        onLineChange={(points, angle) => {
          setTractorLinePoints(points)
          setOrientationAngle(angle)
        }}
      />

      {/* Drawing Tools Panel - Right Sidebar */}
      <DrawingToolsPanel
        canUndo={drawingHistory.canUndo}
        canRedo={drawingHistory.canRedo}
        onUndo={() => {
          const prevState = drawingHistory.undo()
          if (prevState?.polygonPoints) {
            setPolygonPoints(prevState.polygonPoints)
            polygonPointMarkers.forEach(m => m.setMap(null))
            setPolygonPointMarkers([])
          }
        }}
        onRedo={() => {
          const nextState = drawingHistory.redo()
          if (nextState?.polygonPoints) {
            setPolygonPoints(nextState.polygonPoints)
            polygonPointMarkers.forEach(m => m.setMap(null))
            setPolygonPointMarkers([])
          }
        }}
        snapToGrid={snapToGrid}
        onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
        smoothCurves={smoothCurves}
        onToggleSmoothCurves={() => setSmoothCurves(!smoothCurves)}
        drawingMode={editorDrawingMode}
        pointCount={polygonPoints.length}
        currentDrawingMode={drawingMode}
        onDrawingModeChange={setDrawingMode}
        polygonPoints={polygonPoints}
        onFinishPolygon={() => handleFinishPolygon(map)}
        onClearDrawing={handleClearDrawing}
        validationStatus={validationStatus}
        parcela={parcela}
        pozo={pozo}
        grid={grid}
        obstacles={obstacles}
        onObstacleTypeSelect={setCurrentObstacleType}
        onObstacleRemove={(obstacleId) => {
          const updatedObstacles = obstacles.filter(o => o.id !== obstacleId)
          const indexToRemove = obstacles.findIndex(o => o.id === obstacleId)
          if (obstacleMarkers[indexToRemove]) {
            obstacleMarkers[indexToRemove].setMap(null)
          }
          if (obstacleCircles[indexToRemove]) {
            obstacleCircles[indexToRemove].setMap(null)
          }
          setObstacles(updatedObstacles)
          setObstacleMarkers(prev => prev.filter((_, i) => i !== indexToRemove))
          setObstacleCircles(prev => prev.filter((_, i) => i !== indexToRemove))
        }}
        currentObstacleType={currentObstacleType}
        isRegeneratingGrid={isRegeneratingGrid}
        onCompare={() => {
          resetComparator()
          compareAngles(parcela, pozo, config, obstacles)
          setShowComparator(true)
        }}
        onOptimize={() => {
          resetOptimizer()
          optimize(parcela, pozo, config, obstacles)
          setShowOptimizer(true)
        }}
        scenarioCalculating={isCalculating}
        optimizationCalculating={isOptimizing}
        OBSTACLE_TYPES={OBSTACLE_TYPES}
      />

      {/* Status Messages - Bottom Left */}
      {drawingMode === 'polygon' && polygonPoints.length === 0 && (
        <div className="drawing-status">
          📍 Haz clic en el mapa para dibujar la parcela
        </div>
      )}
      {drawingMode === 'polygon' && polygonPoints.length > 0 && (
        <div className="drawing-status">
          ✏️ {polygonPoints.length} puntos. Clic para agregar o terminar.
        </div>
      )}
      {drawingMode === 'marker' && !pozo && (
        <div className="drawing-status">
          💧 Haz clic en el mapa para marcar el pozo
        </div>
      )}
      {drawingMode === 'obstacle' && (
        <div className="drawing-status">
          🚧 Haz clic en el mapa para marcar obstáculos
        </div>
      )}
      {drawingMode === 'tractorLine' && parcela && pozo && (
        <div className="drawing-status">
          🚜 Ajusta la línea de dirección usando los controles o arrastrando los puntos
        </div>
      )}

      {/* Scenario Comparator Modal */}
      <ScenarioComparatorModal
        isOpen={showComparator}
        scenarios={scenarios}
        bestScenario={bestScenario}
        isCalculating={isCalculating}
        onSelectAngle={(angle) => {
          setOrientationAngle(angle)
        }}
        onClose={() => setShowComparator(false)}
      />

      {/* Optimization Results Modal */}
      <OptimizationResultsModal
        isOpen={showOptimizer}
        optimizationResults={optimizationResults}
        bestConfiguration={bestConfiguration}
        isCalculating={isOptimizing}
        onApplyConfiguration={handleApplyOptimizedConfig}
        onClose={() => setShowOptimizer(false)}
      />
    </div>
  )
}
