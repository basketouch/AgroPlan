/**
 * Factory for creating marker icons based on point state
 * Centralized icon generation for consistent visual feedback
 */

/**
 * Get marker icon based on point state
 * Different colors/sizes for selected, dragging, hovered states
 */
export function getMarkerIcon(isSelected = false, isDragging = false, isHovered = false) {
  if (isDragging) {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: '#ff6b6b',      // Red - active manipulation
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 3,
    }
  }

  if (isSelected) {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#ffc107',      // Amber/Yellow - selected
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 3,
    }
  }

  if (isHovered) {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: '#4CAF50',      // Green - hover state
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
    }
  }

  // Default state
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 6,
    fillColor: '#2d5016',        // Dark green - default
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
  }
}

/**
 * Get marker label based on point index
 * Shows point numbering (1, 2, 3...)
 */
export function getMarkerLabel(pointIndex, isSelected = false) {
  return {
    text: String(pointIndex + 1),
    color: isSelected ? '#000' : '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif'
  }
}

/**
 * Get label styling object (for dynamic updates)
 */
export function getLabelStyling(isSelected = false) {
  return {
    textColor: isSelected ? '#000' : '#fff',
    backgroundColor: isSelected ? '#ffc107' : '#2d5016',
    borderRadius: '2px',
    padding: '2px 4px'
  }
}

/**
 * All available marker states for reference
 */
export const MARKER_STATES = {
  DEFAULT: 'default',
  SELECTED: 'selected',
  DRAGGING: 'dragging',
  HOVERED: 'hovered',
}

/**
 * Color palette used across markers
 */
export const MARKER_COLORS = {
  DEFAULT: '#2d5016',     // Dark green
  SELECTED: '#ffc107',    // Amber/Yellow
  DRAGGING: '#ff6b6b',    // Red
  HOVERED: '#4CAF50',     // Bright green
  STROKE: '#fff',         // White
}

/**
 * Size palette used across markers
 */
export const MARKER_SIZES = {
  DEFAULT: 6,
  SELECTED: 10,
  DRAGGING: 12,
  HOVERED: 8,
}
