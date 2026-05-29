/**
 * Utility functions for calculating grid orientation based on a direction line
 */

/**
 * Calculate the angle (in degrees) from a line defined by two points
 * @param {[lng, lat]} point1 - First point [longitude, latitude]
 * @param {[lng, lat]} point2 - Second point [longitude, latitude]
 * @returns {number} Angle in degrees (0-360)
 */
export function calculateAngleFromLine(point1, point2) {
  const [lng1, lat1] = point1
  const [lng2, lat2] = point2

  const dLng = lng2 - lng1
  const dLat = lat2 - lat1

  // Calculate angle in radians, then convert to degrees
  let angle = Math.atan2(dLat, dLng) * (180 / Math.PI)

  // Normalize to 0-360 range
  if (angle < 0) {
    angle += 360
  }

  return angle
}

/**
 * Calculate perpendicular angle (90 degrees offset)
 * @param {number} angle - Base angle in degrees
 * @returns {number} Perpendicular angle in degrees
 */
export function getPerpendicularAngle(angle) {
  return (angle + 90) % 360
}

/**
 * Rotate a point around a center point by a given angle
 * @param {[lng, lat]} point - Point to rotate
 * @param {[lng, lat]} center - Center of rotation
 * @param {number} angleDegrees - Rotation angle in degrees
 * @returns {[lng, lat]} Rotated point
 */
export function rotatePoint(point, center, angleDegrees) {
  const [lng, lat] = point
  const [centerLng, centerLat] = center

  // Convert angle to radians
  const angleRad = angleDegrees * (Math.PI / 180)

  // Translate to origin
  const x = lng - centerLng
  const y = lat - centerLat

  // Rotate
  const rotatedX = x * Math.cos(angleRad) - y * Math.sin(angleRad)
  const rotatedY = x * Math.sin(angleRad) + y * Math.cos(angleRad)

  // Translate back
  return [centerLng + rotatedX, centerLat + rotatedY]
}

/**
 * Rotate multiple points around a center
 * @param {[lng, lat][]} points - Array of points to rotate
 * @param {[lng, lat]} center - Center of rotation
 * @param {number} angleDegrees - Rotation angle in degrees
 * @returns {[lng, lat][]} Array of rotated points
 */
export function rotatePoints(points, center, angleDegrees) {
  return points.map(point => rotatePoint(point, center, angleDegrees))
}

/**
 * Calculate the bounding box of a set of points
 * @param {[lng, lat][]} points - Array of points
 * @returns {{minLng: number, maxLng: number, minLat: number, maxLat: number}}
 */
export function getBoundingBox(points) {
  if (!points || points.length === 0) {
    return { minLng: 0, maxLng: 0, minLat: 0, maxLat: 0 }
  }

  let minLng = points[0][0]
  let maxLng = points[0][0]
  let minLat = points[0][1]
  let maxLat = points[0][1]

  for (let i = 1; i < points.length; i++) {
    const [lng, lat] = points[i]
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }

  return { minLng, maxLng, minLat, maxLat }
}

/**
 * Calculate center point of a polygon
 * @param {[lng, lat][]} points - Array of points forming a polygon
 * @returns {[lng, lat]} Center point (centroid approximation)
 */
export function calculatePolygonCenter(points) {
  if (!points || points.length === 0) {
    return [0, 0]
  }

  let sumLng = 0
  let sumLat = 0

  for (const [lng, lat] of points) {
    sumLng += lng
    sumLat += lat
  }

  return [sumLng / points.length, sumLat / points.length]
}

/**
 * Distance between two points in degrees (approximate, valid for small distances)
 * @param {[lng, lat]} point1
 * @param {[lng, lat]} point2
 * @returns {number} Distance in degrees
 */
export function distanceDegrees(point1, point2) {
  const [lng1, lat1] = point1
  const [lng2, lat2] = point2

  const dLng = lng2 - lng1
  const dLat = lat2 - lat1

  return Math.sqrt(dLng * dLng + dLat * dLat)
}

/**
 * Normalize angle to 0-360 range
 * @param {number} angle - Angle in degrees
 * @returns {number} Normalized angle
 */
export function normalizeAngle(angle) {
  let normalized = angle % 360
  if (normalized < 0) {
    normalized += 360
  }
  return normalized
}

/**
 * Get the smallest angle difference between two angles
 * @param {number} angle1 - First angle in degrees
 * @param {number} angle2 - Second angle in degrees
 * @returns {number} Difference in degrees (-180 to 180)
 */
export function getAngleDifference(angle1, angle2) {
  let diff = normalizeAngle(angle2 - angle1)
  if (diff > 180) {
    diff -= 360
  }
  return diff
}
