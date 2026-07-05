/**
 * Utilidades de geometría para la vista 3D
 * Convierte coordenadas geográficas [lng, lat] a un plano local en metros
 * centrado en la parcela, con y-up (convención de three.js):
 *   x = este, z = sur (norte queda hacia -z)
 */

const METERS_PER_DEG_LAT = 110540

/**
 * Centroide simple de un anillo de coordenadas [lng, lat]
 */
export function polygonCentroid(coords) {
  let lng = 0
  let lat = 0
  coords.forEach(p => {
    lng += p[0]
    lat += p[1]
  })
  return [lng / coords.length, lat / coords.length]
}

/**
 * Crea una función de proyección [lng, lat] -> [x, z] en metros
 * relativa al origen dado (proyección equirectangular local,
 * suficiente para parcelas de menos de unos pocos km)
 */
export function createLocalProjection(origin) {
  const [lng0, lat0] = origin
  const metersPerDegLng = 111320 * Math.cos((lat0 * Math.PI) / 180)

  return ([lng, lat]) => [
    (lng - lng0) * metersPerDegLng,
    -(lat - lat0) * METERS_PER_DEG_LAT,
  ]
}

/**
 * Proyecta la escena completa (parcela, pozo, plantas) a coordenadas locales.
 * Devuelve también el radio aproximado de la parcela para encuadrar la cámara.
 */
export function projectScene(parcela, pozo, grid) {
  // La parcela llega cerrada (último punto = primero); quitar el duplicado
  const ring = parcela.length > 1 &&
    parcela[0][0] === parcela[parcela.length - 1][0] &&
    parcela[0][1] === parcela[parcela.length - 1][1]
    ? parcela.slice(0, -1)
    : parcela

  const origin = polygonCentroid(ring)
  const project = createLocalProjection(origin)

  const parcelaXZ = ring.map(project)
  const pozoXZ = pozo ? project(pozo) : null

  const plants = (grid || []).map(point => ({
    position: project(point.geometry.coordinates),
    cultivo: point.properties?.cultivo || 'tomate',
  }))

  const radius = Math.max(
    10,
    ...parcelaXZ.map(([x, z]) => Math.sqrt(x * x + z * z))
  )

  return { parcelaXZ, pozoXZ, plants, radius }
}
