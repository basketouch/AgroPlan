/**
 * Utilities para manejar obstáculos/elementos de bloqueo en AgroFit
 */

// Definición de tipos de obstáculos con propiedades
export const OBSTACLE_TYPES = {
  caseta: {
    icon: '🏠',
    label: 'Caseta/Edificio',
    radius: 1500, // metros en proyección
    color: '#FF6B6B'
  },
  camino: {
    icon: '🛣️',
    label: 'Camino',
    radius: 500,
    color: '#FFA500'
  },
  arbol: {
    icon: '🌳',
    label: 'Árbol existente',
    radius: 400,
    color: '#228B22'
  },
  rocosa: {
    icon: '🪨',
    label: 'Zona rocosa',
    radius: 1000,
    color: '#A9A9A9'
  },
  electrica: {
    icon: '⚡',
    label: 'Línea eléctrica',
    radius: 2000,
    color: '#FFD700'
  },
  balsa: {
    icon: '💦',
    label: 'Balsa de agua',
    radius: 1200,
    color: '#1E90FF'
  }
}

/**
 * Calcula la distancia entre dos puntos en coordenadas lat/lng (en grados)
 * Usa aproximación simple de distancia euclidiana en grados
 * Para cálculos más precisos usar turf.distance()
 */
export function distanceBetweenPoints(point1, point2) {
  const [lng1, lat1] = point1
  const [lng2, lat2] = point2

  const dLat = lat2 - lat1
  const dLng = lng2 - lng1

  // Aproximación: 1 grado ≈ 111 km en línea recta
  const kmPerDegree = 111
  const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * kmPerDegree

  return distKm * 1000 // retornar en metros
}

/**
 * Verifica si un punto está dentro del radio de exclusión de un obstacle
 */
export function isPointInObstacleRadius(point, obstacle) {
  const distance = distanceBetweenPoints(point, obstacle.coordinates)
  const obstacleType = OBSTACLE_TYPES[obstacle.type]
  const exclusionRadius = obstacleType.radius / 1000 // convertir a km para la comparación

  return distance / 1000 < exclusionRadius
}

/**
 * Filtra puntos del grid, excluyendo los que caen en radios de exclusión
 */
export function filterPointsByObstacles(gridPoints, obstacles) {
  if (!obstacles || obstacles.length === 0) {
    return gridPoints
  }

  return gridPoints.filter(point => {
    const coordinates = point.geometry.coordinates

    // Verificar si el punto está dentro de algún radio de exclusión
    const isBlocked = obstacles.some(obstacle => {
      return isPointInObstacleRadius(coordinates, obstacle)
    })

    return !isBlocked // Mantener solo los puntos que NO están bloqueados
  })
}

/**
 * Crea un obstacle con valores por defecto
 */
export function createObstacle(type, coordinates, radius = null) {
  const obstacleType = OBSTACLE_TYPES[type]

  if (!obstacleType) {
    throw new Error(`Tipo de obstáculo inválido: ${type}`)
  }

  return {
    id: `obstacle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    coordinates: coordinates,
    radius: radius || obstacleType.radius,
    color: obstacleType.color,
    icon: obstacleType.icon,
    label: obstacleType.label,
    createdAt: new Date().toISOString()
  }
}

/**
 * Calcula el impacto de los obstáculos en el número de plantas
 */
export function calculateObstacleImpact(totalPlants, filteredPlants) {
  const excluded = totalPlants - filteredPlants
  const percentageExcluded = (excluded / totalPlants) * 100

  return {
    totalPlants,
    filteredPlants,
    excluded,
    percentageExcluded: percentageExcluded.toFixed(1)
  }
}
