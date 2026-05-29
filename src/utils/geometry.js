import * as turf from '@turf/turf'
import { rotatePoint, calculatePolygonCenter } from './orientationCalculator'
import { filterPointsByObstacles, calculateObstacleImpact } from './obstacleHelpers'

/**
 * Algoritmo generativo principal para AgroFit
 * Entrada: polígono de parcela, punto de pozo, configuración de marco
 * Salida: array de puntos de plantación (grid), métricas
 */

export function generatePlantingGrid(parcelaCoords, pozoCord, config, obstacles = []) {
  // Determine planting mode
  const plantingMode = config.plantingMode || 'puntos' // Default to points

  let result
  // If orientation angle is specified, use the rotated version
  if (config.orientationAngle !== undefined && config.orientationAngle !== 0) {
    result = generatePlantingGridWithOrientation(parcelaCoords, pozoCord, config, config.orientationAngle, plantingMode)
  } else {
    // Generate grid based on planting mode
    switch (plantingMode) {
      case 'surcos':
        result = generateSurcosGrid(parcelaCoords, pozoCord, config)
        break
      case 'filas_dobles':
        result = generateFilasDoublesGrid(parcelaCoords, pozoCord, config)
        break
      case 'tresbolillo':
        result = generateTresbolilloGrid(parcelaCoords, pozoCord, config)
        break
      case 'puntos':
      default:
        result = generatePlantingGridBase(parcelaCoords, pozoCord, config)
    }
  }

  // Aplicar filtro de obstáculos si existen
  if (obstacles && obstacles.length > 0) {
    const totalPoints = result.points.length
    const filteredPoints = filterPointsByObstacles(result.points, obstacles)
    const obstacleImpact = calculateObstacleImpact(totalPoints, filteredPoints.length)

    return {
      ...result,
      points: filteredPoints,
      metricas: {
        ...result.metricas,
        numeroPlantas: filteredPoints.length,
        plantasExcluidas: obstacleImpact.excluded,
        porcentajeExcluido: obstacleImpact.percentageExcluded
      }
    }
  }

  return result
}

/**
 * Generate planting grid with rotation applied
 * @param {Array} parcelaCoords - Parcela polygon coordinates
 * @param {Array} pozoCord - Well coordinates
 * @param {Object} config - Configuration object
 * @param {number} orientationAngle - Rotation angle in degrees (0-360)
 * @param {string} plantingMode - Planting mode (puntos, surcos, filas_dobles, tresbolillo)
 * @returns {Object} - Grid points and metrics
 */
function generatePlantingGridWithOrientation(parcelaCoords, pozoCord, config, orientationAngle, plantingMode = 'puntos') {
  try {
    // Get the center point for rotation
    const center = calculatePolygonCenter(parcelaCoords.slice(0, -1))

    // Calculate the base angle from marco directions (assuming 0° is horizontal)
    const baseAngle = 0 // Default orientation
    const rotationOffset = orientationAngle - baseAngle

    // Rotate the entire parcela around its center
    const rotatedParcelaCoords = parcelaCoords.map(point => {
      return rotatePoint(point, center, rotationOffset)
    })

    // Rotate the well position around the parcela center
    const rotatedPozo = rotatePoint(pozoCord, center, rotationOffset)

    // Generate the grid with rotated coordinates
    const result = generatePlantingGridBase(rotatedParcelaCoords, rotatedPozo, config)

    // Rotate the result points back to original orientation
    const rotatedBackPoints = result.points.map(point => {
      const rotatedCoords = rotatePoint(point.geometry.coordinates, center, -rotationOffset)
      return {
        ...point,
        geometry: {
          ...point.geometry,
          coordinates: rotatedCoords
        }
      }
    })

    return {
      ...result,
      points: rotatedBackPoints,
      metricas: {
        ...result.metricas,
        orientationAngle: orientationAngle
      }
    }
  } catch (error) {
    console.error('Error generating grid with orientation:', error)
    // Fallback to non-rotated version
    return generatePlantingGridBase(parcelaCoords, pozoCord, config)
  }
}

/**
 * Base grid generation algorithm (non-rotated)
 */
/**
 * Calcula el tamaño de celda basándose en la cantidad deseada de plantas
 * @param {number} parcelaArea - Área de la parcela en m²
 * @param {number} cantidadDeseada - Cantidad total de plantas
 * @returns {number} Tamaño de celda en km
 */
function calculateCellSizeFromQuantity(parcelaArea, cantidadDeseada) {
  if (cantidadDeseada <= 0) return 7 / 1000 // Default 7m

  // Área por planta (m²)
  const areaPerPlanta = parcelaArea / cantidadDeseada

  // Espaciamiento necesario (suponiendo distribución cuadrada)
  const espaciamiento = Math.sqrt(areaPerPlanta)

  // Convertir a km
  return espaciamiento / 1000
}

function generatePlantingGridBase(parcelaCoords, pozoCord, config) {
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

    // 3. Aplicar retranqueo (buffer negativo, convertir cm a km)
    let bufferedParcela
    try {
      bufferedParcela = turf.buffer(parcelaPolygon, -(config.retranqueo / 100 / 1000), {
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

    // ⭐ NUEVO: Determinar cellSize basándose en el modo de plantación
    let cellSizeKm
    if (config.modoPlantacion === 'cantidad-fija') {
      // Modo cantidad fija: sumar cantidades de todos los cultivos seleccionados
      const totalPlants = Object.values(config.cantidadesCultivos || {})
        .reduce((sum, qty) => sum + (parseInt(qty) || 0), 0)

      if (totalPlants > 0) {
        // Calcular Marco necesario basado en cantidad total
        const parcelaArea = turf.area(bufferedParcela) // en m²
        cellSizeKm = calculateCellSizeFromQuantity(parcelaArea, totalPlants)
      } else {
        // Si no hay cantidad especificada, usar Marco por defecto
        cellSizeKm = Math.min(config.marcoHorizontal, config.marcoVertical) / 100 / 1000
      }
    } else {
      // Modo espaciamiento: usar Marco definido por usuario
      cellSizeKm = Math.min(config.marcoHorizontal, config.marcoVertical) / 100 / 1000
    }

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

    // 6.5. Asignar cultivos según distancia al pozo y zonas
    const pointsConCultivo = asignarCultivosMultiples(validPoints, pozoCord, {
      ...config,
      orientationAngle: config.orientationAngle
    })

    // 7. Calcular métricas
    const areaTotalHa = turf.area(parcelaPolygon) / 10000 // Convertir m² a hectáreas
    const areaValidaHa = bufferedParcela ? turf.area(bufferedParcela) / 10000 : areaTotalHa
    const numeroPlantas = pointsConCultivo.length
    const densidad = areaValidaHa > 0 ? numeroPlantas / areaValidaHa : 0
    const metrosLineales = estimatePipelineLength(pointsConCultivo, pozoCord, config)

    // Calcular distribución por zona
    const distribucionPorZona = {
      zona1: pointsConCultivo.filter(p => p.properties.zonaTipo === 'zona1').length,
      zona2: pointsConCultivo.filter(p => p.properties.zonaTipo === 'zona2').length,
      zona3: pointsConCultivo.filter(p => p.properties.zonaTipo === 'zona3').length,
    }

    return {
      points: pointsConCultivo,
      bufferedParcelaCoords: bufferedParcela.geometry.coordinates[0], // Área útil de plantación
      metricas: {
        areaTotalHa: areaTotalHa,
        areaValidaHa: areaValidaHa,
        numeroPlantas: numeroPlantas,
        densidad: densidad,
        metrosLineales: metrosLineales,
        marcoH: config.marcoHorizontal,
        marcoV: config.marcoVertical,
        retranqueo: config.retranqueo,
        cultivosSeleccionados: config.cultivosSeleccionados,
        tipoRiego: config.tipoRiego,
        distribucionPorZona: distribucionPorZona,
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
    // Agrupar puntos por fila (latitud similar, convertir cm a metros a grados)
    const tolerance = config.marcoVertical / 100 / 111000 // cm → m → grados
    const rows = {}

    points.forEach(point => {
      const lat = Math.round(point.geometry.coordinates[1] / tolerance) * tolerance
      if (!rows[lat]) {
        rows[lat] = []
      }
      rows[lat].push(point)
    })

    const numRows = Object.keys(rows).length
    // Convertir marcoHorizontal de centímetros a metros para el cálculo de tubería
    const avgRowLength = points.length > 0 ? (points.length / numRows) * (config.marcoHorizontal / 100) : 0

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
 * Determinar rangos de distancia según tipo de riego
 */
function getZoneRanges(tipoRiego) {
  const ranges = {
    goteo: { zone1: 20, zone2: 50 },      // Drip: 0-20m, 20-50m, 50m+
    aspersion: { zone1: 30, zone2: 80 },  // Sprinkler: 0-30m, 30-80m, 80m+
    surcos: { zone1: 25, zone2: 75 }      // Furrow: 0-25m, 25-75m, 75m+
  }
  return ranges[tipoRiego] || ranges.goteo
}

/**
 * Demanda hídrica de cultivos (índice de exigencia de agua)
 * Mayor valor = más agua necesaria = más cerca del pozo
 */
const waterDemand = {
  // Hortalizas
  tomate: 8,      // Muy exigente
  pimiento: 8,    // Muy exigente
  pepino: 7,      // Exigente
  lechuga: 6,     // Moderadamente exigente
  patata: 5,      // Moderadamente exigente
  cebolla: 3,     // Poco exigente

  // Extensivo
  maiz: 7,        // Exigente (necesita buen suministro de agua)
  trigo: 4,       // Moderadamente exigente (tolerancia a sequía)
  girasol: 5,     // Moderadamente exigente

  // Aromáticas (muy tolerantes a sequía)
  romero: 2,      // Muy tolerante a sequía
  tomillo: 2,     // Muy tolerante a sequía
  oregano: 2,     // Muy tolerante a sequía

  // Tubérculos
  zanahoria: 5,   // Moderadamente exigente
}

/**
 * Compatibilidad entre cultivos
 * Evita plagas compartidas y enemigos naturales
 * 1 = Compatible (Se potencian)
 * 0 = Neutro (Sin problema)
 * -1 = Incompatible (Plagas/enfermedades comunes, no juntos)
 */
const cropCompatibility = {
  // ===== HORTALIZAS =====
  tomate: {
    tomate: 0,      // Mismo cultivo
    pimiento: -1,   // Solanáceas, plagas comunes (Mosca blanca, ácaros)
    pepino: 1,      // Compatible (se repelen plagas mutuamente)
    lechuga: 0,     // Neutro
    patata: -1,     // Solanáceas, nematodos compartidos
    cebolla: 1,     // Compatible (cebolla repele plagas del tomate)
    zanahoria: 1,   // Compatible (compañero clásico)
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Neutro
    romero: 1,      // Compatible (repele plagas del tomate)
    tomillo: 1,     // Compatible (mejora sabor, repele plagas)
    oregano: 1,     // Compatible
  },
  pimiento: {
    tomate: -1,     // Solanáceas, plagas comunes
    pimiento: 0,    // Mismo cultivo
    pepino: 1,      // Compatible
    lechuga: 0,     // Neutro
    patata: -1,     // Solanáceas
    cebolla: 1,     // Compatible
    zanahoria: 1,   // Compatible
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Neutro
    romero: 1,      // Compatible
    tomillo: 1,     // Compatible
    oregano: 1,     // Compatible
  },
  pepino: {
    tomate: 1,      // Compatible
    pimiento: 1,    // Compatible
    pepino: 0,      // Mismo cultivo
    lechuga: 1,     // Compatible
    patata: 0,      // Neutro
    cebolla: 1,     // Compatible
    zanahoria: 1,   // Compatible
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Neutro
    romero: 1,      // Compatible
    tomillo: 1,     // Compatible
    oregano: 1,     // Compatible
  },
  lechuga: {
    tomate: 0,      // Neutro
    pimiento: 0,    // Neutro
    pepino: 1,      // Compatible
    lechuga: 0,     // Mismo cultivo
    patata: 1,      // Compatible (repele plagas de patata)
    cebolla: 1,     // Compatible
    zanahoria: 1,   // Compatible
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Neutro
    romero: 1,      // Compatible
    tomillo: 1,     // Compatible
    oregano: 1,     // Compatible
  },
  patata: {
    tomate: -1,     // Solanáceas, nematodos
    pimiento: -1,   // Solanáceas
    pepino: 0,      // Neutro
    lechuga: 1,     // Compatible
    patata: 0,      // Mismo cultivo
    cebolla: 1,     // Compatible (repele plagas de patata)
    zanahoria: 1,   // Compatible
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Neutro
    romero: 1,      // Compatible
    tomillo: 1,     // Compatible
    oregano: 1,     // Compatible
  },
  cebolla: {
    tomate: 1,      // Compatible (repele plagas)
    pimiento: 1,    // Compatible
    pepino: 1,      // Compatible
    lechuga: 1,     // Compatible
    patata: 1,      // Compatible
    cebolla: 0,     // Mismo cultivo
    zanahoria: 1,   // Compatible
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Neutro
    romero: 1,      // Compatible
    tomillo: 1,     // Compatible
    oregano: 1,     // Compatible
  },
  zanahoria: {
    tomate: 1,      // Compatible (compañero clásico)
    pimiento: 1,    // Compatible
    pepino: 1,      // Compatible
    lechuga: 1,     // Compatible
    patata: 1,      // Compatible
    cebolla: 1,     // Compatible
    zanahoria: 0,   // Mismo cultivo
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Neutro
    romero: 1,      // Compatible
    tomillo: 1,     // Compatible
    oregano: 1,     // Compatible
  },

  // ===== EXTENSIVO =====
  trigo: {
    tomate: 0,      // Neutro
    pimiento: 0,    // Neutro
    pepino: 0,      // Neutro
    lechuga: 0,     // Neutro
    patata: 0,      // Neutro
    cebolla: 0,     // Neutro
    zanahoria: 0,   // Neutro
    trigo: 0,       // Mismo cultivo
    maiz: 0,        // Neutro (pueden rotarse)
    girasol: 0,     // Neutro
    romero: 0,      // Neutro
    tomillo: 0,     // Neutro
    oregano: 0,     // Neutro
  },
  maiz: {
    tomate: 0,      // Neutro
    pimiento: 0,    // Neutro
    pepino: 0,      // Neutro
    lechuga: 0,     // Neutro
    patata: 0,      // Neutro
    cebolla: 0,     // Neutro
    zanahoria: 0,   // Neutro
    trigo: 0,       // Neutro
    maiz: 0,        // Mismo cultivo
    girasol: 0,     // Neutro (pueden rotarse)
    romero: 0,      // Neutro
    tomillo: 0,     // Neutro
    oregano: 0,     // Neutro
  },
  girasol: {
    tomate: 0,      // Neutro
    pimiento: 0,    // Neutro
    pepino: 0,      // Neutro
    lechuga: 0,     // Neutro
    patata: 0,      // Neutro
    cebolla: 0,     // Neutro
    zanahoria: 0,   // Neutro
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Mismo cultivo
    romero: 0,      // Neutro
    tomillo: 0,     // Neutro
    oregano: 0,     // Neutro
  },

  // ===== AROMÁTICAS =====
  romero: {
    tomate: 1,      // Compatible (repele plagas del tomate)
    pimiento: 1,    // Compatible
    pepino: 1,      // Compatible
    lechuga: 1,     // Compatible
    patata: 1,      // Compatible
    cebolla: 1,     // Compatible
    zanahoria: 1,   // Compatible
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Neutro
    romero: 0,      // Mismo cultivo
    tomillo: 1,     // Compatible (ambas aromáticas)
    oregano: 1,     // Compatible (ambas aromáticas)
  },
  tomillo: {
    tomate: 1,      // Compatible
    pimiento: 1,    // Compatible
    pepino: 1,      // Compatible
    lechuga: 1,     // Compatible
    patata: 1,      // Compatible
    cebolla: 1,     // Compatible
    zanahoria: 1,   // Compatible
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Neutro
    romero: 1,      // Compatible
    tomillo: 0,     // Mismo cultivo
    oregano: 1,     // Compatible
  },
  oregano: {
    tomate: 1,      // Compatible
    pimiento: 1,    // Compatible
    pepino: 1,      // Compatible
    lechuga: 1,     // Compatible
    patata: 1,      // Compatible
    cebolla: 1,     // Compatible
    zanahoria: 1,   // Compatible
    trigo: 0,       // Neutro
    maiz: 0,        // Neutro
    girasol: 0,     // Neutro
    romero: 1,      // Compatible
    tomillo: 1,     // Compatible
    oregano: 0,     // Mismo cultivo
  }
}

/**
 * Asignar múltiples cultivos a puntos basado en criterios agronómicos
 * 🌱 LÓGICA CIENTÍFICA:
 * - Cultivos con MAYOR demanda de agua → ZONA 1 (cercana al pozo, más humedad)
 * - Cultivos con MENOR demanda de agua → ZONA 3 (lejana del pozo, menos humedad)
 * - Distribución proporcional según cantidades solicitadas
 */
function asignarCultivosMultiples(points, pozoCord, config) {
  const pozoPoint = turf.point(pozoCord)
  const ranges = getZoneRanges(config.tipoRiego)
  const cultivos = config.cultivosSeleccionados || [config.cultivoSeleccionado || 'tomate']
  const cantidades = config.cantidadesCultivos || {}

  // Calcular total de plantas solicitadas
  const totalSolicitado = cultivos.reduce((sum, c) => sum + (cantidades[c] || 0), 0)
  const totalDisponible = points.length

  // Si no hay cantidades especificadas, usar distribución por zonas (backward compatibility)
  if (totalSolicitado === 0) {
    return asignarCultivosMultiplesLegacy(points, pozoCord, config, cultivos, ranges, pozoPoint)
  }

  // Calcular distancia y zona de cada punto
  const pointsConZona = points.map((point, idx) => {
    const distanciaMetros = turf.distance(pozoPoint, point, { units: 'kilometers' }) * 1000
    let zonaTipo = 'zona1'
    if (distanciaMetros <= ranges.zone1) {
      zonaTipo = 'zona1'
    } else if (distanciaMetros <= ranges.zone2) {
      zonaTipo = 'zona2'
    } else {
      zonaTipo = 'zona3'
    }
    return { point, idx, distanciaMetros, zonaTipo }
  })

  // Agrupar puntos por zona
  const puntosPorZona = {
    zona1: pointsConZona.filter(p => p.zonaTipo === 'zona1'),
    zona2: pointsConZona.filter(p => p.zonaTipo === 'zona2'),
    zona3: pointsConZona.filter(p => p.zonaTipo === 'zona3')
  }

  // Ordenar cultivos por demanda hídrica (mayor a menor)
  const cultivosOrdenados = [...cultivos].sort((a, b) => {
    return (waterDemand[b] || 0) - (waterDemand[a] || 0)
  })

  // Función para verificar si dos cultivos son compatibles
  const sonCompatibles = (cultivo1, cultivo2) => {
    if (cultivo1 === cultivo2) return true
    const compatibilidad = cropCompatibility[cultivo1]?.[cultivo2]
    return compatibilidad !== -1 // -1 significa incompatible
  }

  // Función para obtener cultivos incompatibles
  const getCultivosIncompatibles = (cultivo) => {
    return Object.keys(cropCompatibility[cultivo] || {}).filter(
      c => cropCompatibility[cultivo][c] === -1
    )
  }

  // Crear mapa de asignaciones
  const asignaciones = {}

  // 🌊 ESTRATEGIA DE DISTRIBUCIÓN POR ZONAS:
  // Cultivos exigentes (zona1) → Cultivos moderados (zona2) → Cultivos resistentes (zona3)

  let cultivoIdx = 0
  const cultivosPorZona = { zona1: [], zona2: [], zona3: [] }

  // Función auxiliar para asignar cultivos a una zona
  // RESPETANDO COMPATIBILIDADES: Evita poner cultivos incompatibles en la misma zona
  const asignarACultivos = (zonaKey) => {
    const puntos = puntosPorZona[zonaKey]
    let posicionEnZona = 0

    while (posicionEnZona < puntos.length && cultivoIdx < cultivosOrdenados.length) {
      const cultivo = cultivosOrdenados[cultivoIdx]
      const cantidadSolicitada = cantidades[cultivo] || 0
      let cantidadAsignada = 0

      // Verificar si este cultivo es incompatible con otros en esta zona
      const cultivosYaEnZona = cultivosPorZona[zonaKey]
      const incompatible = cultivosYaEnZona.some(c => !sonCompatibles(cultivo, c))

      // Si hay incompatibilidad, saltar esta zona (guardar para otra zona)
      if (incompatible) {
        break
      }

      // Asignar hasta llenar la cantidad solicitada O la zona
      for (let i = posicionEnZona; i < puntos.length && cantidadAsignada < cantidadSolicitada; i++) {
        asignaciones[puntos[i].idx] = cultivo
        posicionEnZona++
        cantidadAsignada++
      }

      // Registrar que este cultivo está en esta zona
      if (cantidadAsignada > 0) {
        cultivosPorZona[zonaKey].push(cultivo)
      }

      // Si se asignaron todas las plantas de este cultivo, pasar al siguiente
      if (cantidadAsignada === cantidadSolicitada) {
        cultivoIdx++
      } else {
        // Si la zona se acabó pero aún hay cantidad solicitada, pasar a la siguiente zona
        break
      }
    }

    return posicionEnZona
  }

  // 🌾 ASIGNACIÓN POR ZONAS CON COMPATIBILIDADES:
  // Zona 1: Cultivos más exigentes (agua)
  asignarACultivos('zona1')
  // Zona 2: Cultivos moderados, respetando incompatibilidades
  asignarACultivos('zona2')
  // Zona 3: Cultivos resistentes, respetando incompatibilidades
  asignarACultivos('zona3')

  // Si quedan puntos sin asignar, asignarlos al cultivo más exigente
  pointsConZona.forEach(p => {
    if (!asignaciones[p.idx]) {
      asignaciones[p.idx] = cultivosOrdenados[0] || 'tomate'
    }
  })

  // Mapear resultado final con propiedades
  const pointsConCultivo = pointsConZona.map(p => {
    return {
      ...p.point,
      properties: {
        cultivo: asignaciones[p.idx] || cultivosOrdenados[0] || 'tomate',
        distanciaPozo: Math.round(p.distanciaMetros),
        zonaTipo: p.zonaTipo
      }
    }
  })

  return pointsConCultivo
}

/**
 * Distribución legacy por zonas (cuando no hay cantidades especificadas)
 */
function asignarCultivosMultiplesLegacy(points, pozoCord, cultivos, ranges, pozoPoint) {
  return points.map(point => {
    const distanciaMetros = turf.distance(pozoPoint, point, { units: 'kilometers' }) * 1000

    let zonaTipo = 'zona1'
    let cultivo = cultivos[0]

    // Determinar zona basada en distancia
    if (distanciaMetros <= ranges.zone1) {
      zonaTipo = 'zona1'
    } else if (distanciaMetros <= ranges.zone2) {
      zonaTipo = 'zona2'
    } else {
      zonaTipo = 'zona3'
    }

    // Asignar cultivo según número de cultivos seleccionados (old logic)
    if (cultivos.length === 1) {
      cultivo = cultivos[0]
    } else if (cultivos.length === 2) {
      cultivo = (zonaTipo === 'zona3') ? cultivos[1] : cultivos[0]
    } else if (cultivos.length >= 3) {
      if (zonaTipo === 'zona1') {
        cultivo = cultivos[0]
      } else if (zonaTipo === 'zona2') {
        cultivo = cultivos[1]
      } else {
        cultivo = cultivos[2]
      }
    }

    return {
      ...point,
      properties: {
        cultivo: cultivo,
        distanciaPozo: Math.round(distanciaMetros),
        zonaTipo: zonaTipo
      }
    }
  })
}

/**
 * Generate grid with Surcos mode (line rows)
 * Plants arranged in continuous rows following the orientation angle
 */
function generateSurcosGrid(parcelaCoords, pozoCord, config) {
  try {
    // Start with base grid
    const baseResult = generatePlantingGridBase(parcelaCoords, pozoCord, config)
    const points = baseResult.points

    // Group points by latitude (rows) and sort by longitude within each row
    const tolerance = config.marcoVertical / 100 / 111000
    const rows = {}

    points.forEach(point => {
      const lat = Math.round(point.geometry.coordinates[1] / tolerance) * tolerance
      if (!rows[lat]) {
        rows[lat] = []
      }
      rows[lat].push(point)
    })

    // Sort each row by longitude (left to right)
    Object.keys(rows).forEach(lat => {
      rows[lat].sort((a, b) => a.geometry.coordinates[0] - b.geometry.coordinates[0])
    })

    // Flatten back to points array (maintains row structure but sorted)
    const sortedPoints = Object.values(rows).flat()

    return {
      ...baseResult,
      points: sortedPoints,
      metricas: {
        ...baseResult.metricas,
        plantingMode: 'surcos',
        numberOfRows: Object.keys(rows).length,
        avgPlantsPerRow: Math.round(sortedPoints.length / Object.keys(rows).length)
      }
    }
  } catch (error) {
    console.error('Error generating Surcos grid:', error)
    return generatePlantingGridBase(parcelaCoords, pozoCord, config)
  }
}

/**
 * Generate grid with Filas Dobles mode (double rows)
 * Twin rows with controlled spacing between them
 */
function generateFilasDoublesGrid(parcelaCoords, pozoCord, config) {
  try {
    // Use a smaller vertical spacing for double rows
    const doubleRowConfig = {
      ...config,
      marcoVertical: Math.max(config.marcoVertical, 200) // Ensure minimum spacing
    }

    const baseResult = generatePlantingGridBase(parcelaCoords, pozoCord, doubleRowConfig)
    const points = baseResult.points

    // Create pairs of rows (filas dobles)
    const tolerance = doubleRowConfig.marcoVertical / 100 / 111000
    const rows = {}

    points.forEach(point => {
      const lat = Math.round(point.geometry.coordinates[1] / tolerance) * tolerance
      if (!rows[lat]) {
        rows[lat] = []
      }
      rows[lat].push(point)
    })

    // Sort each row and maintain double-row structure
    const sortedRows = Object.keys(rows).sort((a, b) => parseFloat(a) - parseFloat(b))
    const doubleRows = []

    for (let i = 0; i < sortedRows.length; i += 2) {
      if (i + 1 < sortedRows.length) {
        doubleRows.push([sortedRows[i], sortedRows[i + 1]])
      }
    }

    const sortedPoints = doubleRows.flat().map(lat => rows[lat]).flat()

    return {
      ...baseResult,
      points: sortedPoints,
      metricas: {
        ...baseResult.metricas,
        plantingMode: 'filas_dobles',
        numberOfDoubleRows: doubleRows.length,
        rowSpacing: doubleRowConfig.marcoVertical
      }
    }
  } catch (error) {
    console.error('Error generating Filas Dobles grid:', error)
    return generatePlantingGridBase(parcelaCoords, pozoCord, config)
  }
}

/**
 * Generate grid with Tresbolillo mode (honeycomb/offset pattern)
 * Alternating rows offset by half spacing for optimized density
 */
function generateTresbolilloGrid(parcelaCoords, pozoCord, config) {
  try {
    const parcelaPolygon = turf.polygon([parcelaCoords])
    let bufferedParcela
    try {
      bufferedParcela = turf.buffer(parcelaPolygon, -(config.retranqueo / 100 / 1000), {
        units: 'kilometers'
      })
    } catch (e) {
      bufferedParcela = parcelaPolygon
    }

    const pozoPoint = turf.point(pozoCord)
    const pozoBuffer = turf.buffer(pozoPoint, 5 / 1000, { units: 'kilometers' })

    const bbox = turf.bbox(bufferedParcela)
    const cellSizeKm = Math.min(config.marcoHorizontal, config.marcoVertical) / 100 / 1000

    // Generate offset grid for tresbolillo
    const points = []
    const [minLng, minLat, maxLng, maxLat] = bbox

    // Horizontal spacing (half offset)
    const halfHorizontal = config.marcoHorizontal / 2 / 100 / 1000 / 111000

    for (let lat = minLat; lat <= maxLat; lat += cellSizeKm) {
      const isOddRow = Math.round((lat - minLat) / cellSizeKm) % 2

      for (let lng = minLng; lng <= maxLng; lng += cellSizeKm) {
        // Offset odd rows by half the horizontal spacing
        const offsetLng = isOddRow ? lng + halfHorizontal : lng

        const point = turf.point([offsetLng, lat])

        try {
          const insideParcela = turf.booleanPointInPolygon(point, bufferedParcela)
          const insidePozo = turf.booleanPointInPolygon(point, pozoBuffer)

          if (insideParcela && !insidePozo) {
            points.push(point)
          }
        } catch (e) {
          // Skip invalid points
        }
      }
    }

    // Assign crops and calculate metrics
    const pointsConCultivo = asignarCultivosMultiples(points, pozoCord, config)

    const areaTotalHa = turf.area(parcelaPolygon) / 10000
    const areaValidaHa = bufferedParcela ? turf.area(bufferedParcela) / 10000 : areaTotalHa
    const numeroPlantas = pointsConCultivo.length
    const densidad = areaValidaHa > 0 ? numeroPlantas / areaValidaHa : 0

    return {
      points: pointsConCultivo,
      metricas: {
        areaTotalHa: areaTotalHa,
        areaValidaHa: areaValidaHa,
        numeroPlantas: numeroPlantas,
        densidad: densidad,
        marcoH: config.marcoHorizontal,
        marcoV: config.marcoVertical,
        retranqueo: config.retranqueo,
        cultivosSeleccionados: config.cultivosSeleccionados,
        tipoRiego: config.tipoRiego,
        plantingMode: 'tresbolillo',
        offsetPercentage: 50
      }
    }
  } catch (error) {
    console.error('Error generating Tresbolillo grid:', error)
    return generatePlantingGridBase(parcelaCoords, pozoCord, config)
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

/**
 * UNIT CONVERSION UTILITIES
 * Internal storage: ALL values in centimeters (cm)
 * Display: Convert to user-selected unit at UI boundaries
 */

/**
 * Convert centimeters to meters
 */
export function cmToM(cm) {
  return cm / 100
}

/**
 * Convert meters to centimeters
 */
export function mToCm(m) {
  return m * 100
}

/**
 * Format a value stored in cm for display in selected unit
 * @param {number} valueCm - Value in centimeters
 * @param {string} displayUnit - 'cm' or 'm'
 * @returns {number} - Formatted value for display
 */
export function formatDisplayValue(valueCm, displayUnit) {
  if (!valueCm && valueCm !== 0) return ''

  if (displayUnit === 'm') {
    return cmToM(valueCm)
  }
  return valueCm // Default to cm
}

/**
 * Parse user input and convert to centimeters for internal storage
 * @param {string|number} inputValue - User input value
 * @param {string} inputUnit - 'cm' or 'm'
 * @returns {number} - Value in centimeters
 */
export function parseInputValue(inputValue, inputUnit) {
  const numValue = parseFloat(inputValue)

  if (isNaN(numValue)) {
    return 0
  }

  if (inputUnit === 'm') {
    return mToCm(numValue)
  }
  return numValue // Assume cm if not specified
}

/**
 * Format metrics for display with selected unit
 * @param {object} metricas - Metrics object with marcoH, marcoV, retranqueo in cm
 * @param {string} displayUnit - 'cm' or 'm'
 * @returns {object} - Formatted metrics
 */
export function formatMetricsForDisplay(metricas, displayUnit) {
  if (!metricas) return null

  return {
    ...metricas,
    marcoH: formatDisplayValue(metricas.marcoH, displayUnit),
    marcoV: formatDisplayValue(metricas.marcoV, displayUnit),
    retranqueo: formatDisplayValue(metricas.retranqueo, displayUnit),
  }
}

/**
 * Determine if a point is inside a polygon using ray-casting algorithm
 * @param {Array<number>} point - Point as [lng, lat]
 * @param {Array<Array<number>>} polygon - Polygon vertices as array of [lng, lat]
 * @returns {boolean} - True if point is inside polygon
 */
export function isPointInPolygon(point, polygon) {
  if (!point || !polygon || polygon.length < 3) {
    return false
  }

  const [x, y] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)

    if (intersect) inside = !inside
  }

  return inside
}
