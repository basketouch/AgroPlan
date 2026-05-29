import { useEffect } from 'react'
import { getMarkerIcon, getMarkerLabel } from '../utils/markerIconFactory'

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
      const markerIcon = getMarkerIcon(isSelected, isDragging, false)

      const marker = new window.google.maps.Marker({
        position: { lat: point[1], lng: point[0] },
        map: map,
        title: `Punto ${idx + 1}`,
        icon: markerIcon,
        draggable: true,
        label: getMarkerLabel(idx, isSelected)
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
