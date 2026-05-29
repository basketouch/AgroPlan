import { useEffect } from 'react'

/**
 * Hook to synchronize polygon points with map markers
 * Automatically rebuilds markers when points change (especially after undo/redo)
 * Prevents orphaned markers on the map
 */
export function usePolygonMarkerSync(
  polygonPoints,
  selectedPointIndex,
  draggingPoint,
  map,
  handlers = {}
) {
  useEffect(() => {
    if (!map || !polygonPoints) return

    // Clean up old markers
    if (window.currentPolygonMarkers) {
      window.currentPolygonMarkers.forEach(marker => marker.setMap(null))
    }

    window.currentPolygonMarkers = []

    // Create new markers for each point
    polygonPoints.forEach((point, idx) => {
      const isSelected = idx === selectedPointIndex
      const isDragging = idx === draggingPoint

      // Determine marker appearance based on state
      const markerIcon = getMarkerIcon(isSelected, isDragging)

      const marker = new window.google.maps.Marker({
        position: { lat: point[1], lng: point[0] },
        map: map,
        title: `Punto ${idx + 1}`,
        icon: markerIcon,
        draggable: true,
        label: {
          text: String(idx + 1),
          color: isSelected ? '#000' : '#fff',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      })

      // Click: Select point
      marker.addListener('click', () => {
        if (handlers.onClick) handlers.onClick(idx)
      })

      // Right-click: Context menu
      marker.addListener('rightclick', (event) => {
        event.domEvent.preventDefault()
        if (handlers.onRightClick) {
          handlers.onRightClick(idx, event.latLng)
        }
      })

      // Hover: Visual feedback
      marker.addListener('mouseenter', () => {
        if (handlers.onMouseEnter) handlers.onMouseEnter(idx)
      })

      marker.addListener('mouseleave', () => {
        if (handlers.onMouseLeave) handlers.onMouseLeave(idx)
      })

      // Drag: Move point
      marker.addListener('mousedown', () => {
        if (handlers.onDragStart) handlers.onDragStart(idx)
      })

      marker.addListener('drag', (event) => {
        if (handlers.onDrag) {
          handlers.onDrag(idx, [event.latLng.lng(), event.latLng.lat()])
        }
      })

      marker.addListener('dragend', (event) => {
        if (handlers.onDragEnd) {
          handlers.onDragEnd(idx, [event.latLng.lng(), event.latLng.lat()])
        }
      })

      window.currentPolygonMarkers.push(marker)
    })

    // Cleanup function
    return () => {
      if (window.currentPolygonMarkers) {
        window.currentPolygonMarkers.forEach(marker => marker.setMap(null))
        window.currentPolygonMarkers = []
      }
    }
  }, [polygonPoints, selectedPointIndex, draggingPoint, map, handlers])

  return window.currentPolygonMarkers || []
}

/**
 * Get marker icon based on point state
 * Different colors/sizes for selected, dragging, hovered states
 */
function getMarkerIcon(isSelected, isDragging) {
  if (isDragging) {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: '#ff6b6b',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 3,
    }
  }

  if (isSelected) {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#ffc107',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 3,
    }
  }

  // Default state
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 6,
    fillColor: '#2d5016',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
  }
}

/**
 * Get marker icon for hovered state
 */
export function getHoveredMarkerIcon() {
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: '#4CAF50',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
  }
}
