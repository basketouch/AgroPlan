import * as turf from 'turf'

/**
 * Algoritmo generativo principal para AgroFit
 * Entrada: polígono de parcela, punto de pozo, configuración de marco
 * Salida: array de puntos de plantación (grid), métricas
 */

export function generatePlantingGrid(parcelaCoords, pozoCord, config) {
  // 1. Crear polígono principal
  const parcelaPolygon = turf.polygon([parcelaCoords])

  // 2. Aplicar retranqueo (buffer negativo)
  const bufferedParcela = turf.buffer(parcelaPolygon, -config.retranqueo / 1000, {
    units: 'kilometers'
  })

  // 3. Crear zona de exclusión del pozo
  const pozoBuffer = turf.buffer(
    turf.point(pozoCord),
    5 / 1000, // 5 metros de exclusión
    { units: 'kilometers' }
  )

  // 4. Generar grid (retícula)
  const bbox = turf.bbox(bufferedParcela)
  const cellSize = Math.min(config.marcoHorizontal, config.marcoVertical) / 111 // Convertir a grados aprox
  const grid = turf.pointGrid(bbox, cellSize, { units: 'kilometers' })

  // 5. Filtrar puntos dentro de la parcela y fuera del pozo
  const validPoints = grid.features.filter(point => {
    const insideParcela = turf.booleanPointInPolygon(point, bufferedParcela)
    const insidePozo = turf.booleanPointInPolygon(point, pozoBuffer)
    return insideParcela && !insidePozo
  })

  // 6. Calcular métricas
  const areaTotalHa = turf.area(parcelaPolygon) / 10000 // Convertir m² a hectáreas
  const numeroPlantas = validPoints.length
  const densidad = numeroPlantas / areaTotalHa
  const metrosLineales = estimatePipelineLength(validPoints, pozoCord, config)

  return {
    points: validPoints,
    metricas: {
      areaTotalHa,
      numeroPlantas,
      densidad,
      metrosLineales,
      marcoH: config.marcoHorizontal,
      marcoV: config.marcoVertical
    }
  }
}

function estimatePipelineLength(points, pozoCord, config) {
  // TODO: Implementar cálculo de red de tuberías
  // - Distancia desde pozo a inicio de cada fila
  // - Suma de líneas secundarias (filas)

  if (points.length === 0) return 0

  // Aproximación simple: distancia media por número de filas
  const filas = Math.ceil(points.length / (Math.sqrt(points.length)))
  const distanciaMedia = Math.sqrt(points.length) * Math.min(config.marcoHorizontal, config.marcoVertical)

  return filas * distanciaMedia
}

/**
 * Validar que el polígono sea válido para calcular
 */
export function validatePolygon(coords) {
  if (!coords || coords.length < 3) return false
  if (coords[0][0] !== coords[coords.length - 1][0]) return false // Debe estar cerrado
  return true
}

/**
 * Calcular el área de un polígono
 */
export function calculateArea(parcelaCoords) {
  const polygon = turf.polygon([parcelaCoords])
  return turf.area(polygon) / 10000 // En hectáreas
}
