/**
 * Utilidades para validación de polígonos
 * Detecta auto-intersecciones, área mínima, y proporciona feedback
 */

/**
 * Detecta si dos líneas se intersectan
 * @param {number[]} p1 - Punto 1 de línea 1
 * @param {number[]} p2 - Punto 2 de línea 1
 * @param {number[]} p3 - Punto 1 de línea 2
 * @param {number[]} p4 - Punto 2 de línea 2
 * @returns {boolean} - True si las líneas se intersectan
 */
export function lineSegmentsIntersect(p1, p2, p3, p4) {
  const [x1, y1] = p1
  const [x2, y2] = p2
  const [x3, y3] = p3
  const [x4, y4] = p4

  const ccw = (A, B, C) => {
    const [ax, ay] = A
    const [bx, by] = B
    const [cx, cy] = C
    return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax)
  }

  return ccw([x1, y1], [x3, y3], [x4, y4]) !== ccw([x2, y2], [x3, y3], [x4, y4]) &&
         ccw([x1, y1], [x2, y2], [x3, y3]) !== ccw([x1, y1], [x2, y2], [x4, y4])
}

/**
 * Detecta auto-intersecciones en un polígono
 * @param {number[][]} points - Array de [lng, lat] puntos
 * @returns {boolean} - True si el polígono tiene auto-intersecciones
 */
export function hasAutoIntersections(points) {
  if (points.length < 4) return false

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % points.length]

    // Comparar con segmentos no adyacentes
    for (let j = i + 2; j < points.length; j++) {
      // Evitar comparar con el segmento adyacente
      if (j === (i + 1) % points.length || j === (i - 1 + points.length) % points.length) continue
      if (i === 0 && j === points.length - 1) continue

      const p3 = points[j]
      const p4 = points[(j + 1) % points.length]

      if (lineSegmentsIntersect(p1, p2, p3, p4)) {
        return true
      }
    }
  }

  return false
}

/**
 * Calcula el área de un polígono usando la fórmula del Shoelace
 * @param {number[][]} points - Array de [lng, lat] puntos
 * @returns {number} - Área aproximada en km²
 */
export function calculatePolygonArea(points) {
  if (points.length < 3) return 0

  // Aproximación simple: usar latitud promedia para conversión
  const avgLat = points.reduce((sum, p) => sum + p[1], 0) / points.length
  const metersPerDegreeLat = 111000
  const metersPerDegreeLng = 111000 * Math.cos((avgLat * Math.PI) / 180)

  let area = 0
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % points.length]

    // Convertir a metros
    const x1 = p1[0] * metersPerDegreeLng
    const y1 = p1[1] * metersPerDegreeLat
    const x2 = p2[0] * metersPerDegreeLng
    const y2 = p2[1] * metersPerDegreeLat

    area += x1 * y2 - x2 * y1
  }

  return Math.abs(area) / 2 / 1_000_000 // Convertir a km²
}

/**
 * Valida un polígono y retorna estado con detalles
 * @param {number[][]} points - Array de [lng, lat] puntos
 * @returns {Object} - Objeto con isValid, warnings, errors, area
 */
export function validatePolygon(points) {
  const validation = {
    isValid: true,
    warnings: [],
    errors: [],
    area: 0,
    pointCount: points.length
  }

  if (points.length < 3) {
    validation.errors.push('Se necesitan al menos 3 puntos')
    validation.isValid = false
    return validation
  }

  // Calcular área
  validation.area = calculatePolygonArea(points)

  // Validar auto-intersecciones
  if (hasAutoIntersections(points)) {
    validation.errors.push('La parcela tiene auto-intersecciones')
    validation.isValid = false
  }

  // Advertencia: área muy pequeña
  if (validation.area < 0.001) {
    validation.warnings.push('Área muy pequeña (< 0.001 km²)')
  }

  // Advertencia: área muy grande
  if (validation.area > 100) {
    validation.warnings.push('Área muy grande (> 100 km²)')
  }

  // Advertencia: polígono muy delgado
  const avgSegmentLength = calculateAverageSegmentLength(points)
  if (avgSegmentLength < 0.0005) {
    validation.warnings.push('Segmentos muy cortos (< 55m)')
  }

  // Validar ángulos internos (polígono cóncavo)
  if (isConcavePolygon(points)) {
    validation.warnings.push('Polígono cóncavo (ángulos internos > 180°)')
  }

  return validation
}

/**
 * Calcula la longitud promedia de los segmentos
 * @param {number[][]} points - Array de puntos
 * @returns {number} - Longitud promedia en grados
 */
function calculateAverageSegmentLength(points) {
  let totalLength = 0
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % points.length]
    const dx = p2[0] - p1[0]
    const dy = p2[1] - p1[1]
    totalLength += Math.sqrt(dx * dx + dy * dy)
  }
  return totalLength / points.length
}

/**
 * Detecta si un polígono es cóncavo
 * @param {number[][]} points - Array de puntos
 * @returns {boolean} - True si el polígono es cóncavo
 */
function isConcavePolygon(points) {
  if (points.length < 3) return false

  let sign = null
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % points.length]
    const p3 = points[(i + 2) % points.length]

    // Producto cruzado para detectar dirección de giro
    const cross = (p2[0] - p1[0]) * (p3[1] - p2[1]) - (p2[1] - p1[1]) * (p3[0] - p2[0])

    if (cross !== 0) {
      if (sign === null) {
        sign = cross > 0
      } else if ((cross > 0) !== sign) {
        return true // Cambio de dirección indica polígono cóncavo
      }
    }
  }

  return false
}

/**
 * Genera un resumen de validación legible
 * @param {Object} validation - Objeto de validación
 * @returns {string} - Resumen formateado
 */
export function getValidationSummary(validation) {
  const areaHa = (validation.area * 100).toFixed(2) // Convertir km² a hectáreas
  let summary = `Área: ${areaHa} ha | Puntos: ${validation.pointCount}`

  if (validation.errors.length > 0) {
    summary += ` | ❌ ${validation.errors.join(', ')}`
  }

  if (validation.warnings.length > 0) {
    summary += ` | ⚠️ ${validation.warnings.join(', ')}`
  }

  if (validation.isValid && validation.warnings.length === 0) {
    summary += ' | ✓ Válido'
  }

  return summary
}
