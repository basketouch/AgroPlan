import * as turf from 'turf'

/**
 * Algoritmo generativo principal para AgroFit
 * Entrada: polígono de parcela, punto de pozo, configuración de marco
 * Salida: array de puntos de plantación (grid), métricas
 */

export function generatePlantingGrid(parcelaCoords, pozoCord, config) {
  try {
    // 1. Validar entrada
    if (!parcelaCoords || parcelaCoords.length < 3) {
      throw new Error('Parcela debe tener al menos 3 puntos')
    }
    if (!pozoCord || pozoCord.length !== 2) {
      throw new Error('Pozo debe tener coordenadas válidas')
    }

    // 2. Crear polígono principal
    const parcelaPolygon = turf.polygon([parcelaCoords])

    // Validar que sea un polígono válido
    if (!turf.booleanValid(parcelaPolygon)) {
      throw new Error('Polígono inválido')
    }

    // 3. Aplicar retranqueo (buffer negativo en metros)
    let bufferedParcela
    try {
      bufferedParcela = turf.buffer(parcelaPolygon, -(config.retranqueo / 1000), {
        units: 'kilometers'
      })
    } catch (e) {
      // Si el retranqueo es muy grande, usar el polígono original
      console.warn('Retranqueo muy grande, usando polígono sin retranqueo')
      bufferedParcela = parcelaPolygon
    }

    // 4. Crear zona de exclusión del pozo (radio 5 metros)
    const pozoPoint = turf.point(pozoCord)
    const pozoBuffer = turf.buffer(pozoPoint, 5 / 1000, {
      units: 'kilometers'
    })

    // 5. Generar grid (retícula)
    const bbox = turf.bbox(bufferedParcela)

    // Convertir metros a grados aproximadamente (1 grado ≈ 111 km)
    const cellSizeKm = Math.min(config.marcoHorizontal, config.marcoVertical) / 1000

    let grid
    try {
      grid = turf.pointGrid(bbox, cellSizeKm, {
        units: 'kilometers'
      })
    } catch (e) {
      throw new Error('Error generando grid: ' + e.message)
    }

    // 6. Filtrar puntos dentro de la parcela y fuera del pozo
    const validPoints = grid.features.filter(point => {
      try {
        const insideParcela = turf.booleanPointInPolygon(point, bufferedParcela)
        const insidePozo = turf.booleanPointInPolygon(point, pozoBuffer)
        return insideParcela && !insidePozo
      } catch (e) {
        return false
      }
    })

    // 7. Calcular métricas
    const areaTotalHa = turf.area(parcelaPolygon) / 10000 // Convertir m² a hectáreas
    const areaValidaHa = bufferedParcela ? turf.area(bufferedParcela) / 10000 : areaTotalHa
    const numeroPlantas = validPoints.length
    const densidad = areaValidaHa > 0 ? numeroPlantas / areaValidaHa : 0
    const metrosLineales = estimatePipelineLength(validPoints, pozoCord, config)

    return {
      points: validPoints,
      metricas: {
        areaTotalHa: areaTotalHa,
        areaValidaHa: areaValidaHa,
        numeroPlantas: numeroPlantas,
        densidad: densidad,
        metrosLineales: metrosLineales,
        marcoH: config.marcoHorizontal,
        marcoV: config.marcoVertical,
        retranqueo: config.retranqueo,
      }
    }
  } catch (error) {
    console.error('Error en generatePlantingGrid:', error)
    throw error
  }
}

/**
 * Estimación de longitud de tubería basada en las filas del grid
 */
function estimatePipelineLength(points, pozoCord, config) {
  if (points.length === 0) return 0

  try {
    // Agrupar puntos por fila (latitud similar)
    const tolerance = config.marcoVertical / 111000 // ~metros a grados
    const rows = {}

    points.forEach(point => {
      const lat = Math.round(point.geometry.coordinates[1] / tolerance) * tolerance
      if (!rows[lat]) {
        rows[lat] = []
      }
      rows[lat].push(point)
    })

    const numRows = Object.keys(rows).length
    const avgRowLength = points.length > 0 ? (points.length / numRows) * config.marcoHorizontal : 0

    // Distancia desde pozo a cada fila + suma de filas
    const pozoPoint = turf.point(pozoCord)
    let totalDistance = 0

    Object.values(rows).forEach(row => {
      if (row.length > 0) {
        const rowStart = row[0]
        const distance = turf.distance(pozoPoint, rowStart, { units: 'kilometers' })
        totalDistance += distance * 1000 // Convertir a metros
      }
    })

    // Suma de longitud de cada fila
    totalDistance += numRows * avgRowLength

    return totalDistance
  } catch (error) {
    console.error('Error estimando tubería:', error)
    return 0
  }
}

/**
 * Validar que el polígono sea válido
 */
export function validatePolygon(coords) {
  if (!coords || coords.length < 3) return false

  try {
    const polygon = turf.polygon([coords])
    return turf.booleanValid(polygon)
  } catch (e) {
    return false
  }
}

/**
 * Calcular el área de un polígono en hectáreas
 */
export function calculateArea(parcelaCoords) {
  try {
    const polygon = turf.polygon([parcelaCoords])
    return turf.area(polygon) / 10000 // En hectáreas
  } catch (error) {
    console.error('Error calculando área:', error)
    return 0
  }
}
