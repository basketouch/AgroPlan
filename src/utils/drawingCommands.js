/**
 * Command Pattern for Drawing Operations
 * Each command is responsible for executing an action and can be undone
 */

/**
 * AddPointCommand: Add a new point to the polygon
 */
export class AddPointCommand {
  constructor(polygonPoints, newPoint) {
    this.previousState = {
      polygonPoints: [...polygonPoints]
    }
    this.newPoint = newPoint
  }

  execute() {
    return {
      polygonPoints: [...this.previousState.polygonPoints, this.newPoint]
    }
  }

  undo() {
    return this.previousState
  }
}

/**
 * RemovePointCommand: Remove the last point from the polygon
 */
export class RemovePointCommand {
  constructor(polygonPoints) {
    this.previousState = {
      polygonPoints: [...polygonPoints]
    }
  }

  execute() {
    if (this.previousState.polygonPoints.length > 0) {
      return {
        polygonPoints: this.previousState.polygonPoints.slice(0, -1)
      }
    }
    return this.previousState
  }

  undo() {
    return this.previousState
  }
}

/**
 * RemovePointAtIndexCommand: Remove a specific point by index
 */
export class RemovePointAtIndexCommand {
  constructor(polygonPoints, index) {
    this.previousState = {
      polygonPoints: [...polygonPoints]
    }
    this.index = index
  }

  execute() {
    return {
      polygonPoints: this.previousState.polygonPoints.filter((_, i) => i !== this.index)
    }
  }

  undo() {
    return this.previousState
  }
}

/**
 * MovePointCommand: Move a point to a new location
 */
export class MovePointCommand {
  constructor(polygonPoints, index, newCoords) {
    this.previousState = {
      polygonPoints: [...polygonPoints]
    }
    this.index = index
    this.newCoords = newCoords
  }

  execute() {
    const newPoints = [...this.previousState.polygonPoints]
    newPoints[this.index] = this.newCoords
    return {
      polygonPoints: newPoints
    }
  }

  undo() {
    return this.previousState
  }
}

/**
 * InsertPointCommand: Insert a new point at a specific index (between existing points)
 */
export class InsertPointCommand {
  constructor(polygonPoints, index, newCoords) {
    this.previousState = {
      polygonPoints: [...polygonPoints]
    }
    this.index = index
    this.newCoords = newCoords
  }

  execute() {
    const newPoints = [...this.previousState.polygonPoints]
    newPoints.splice(this.index, 0, this.newCoords)
    return {
      polygonPoints: newPoints
    }
  }

  undo() {
    return this.previousState
  }
}

/**
 * ClearPolygonCommand: Clear all points (reset drawing)
 */
export class ClearPolygonCommand {
  constructor(polygonPoints) {
    this.previousState = {
      polygonPoints: [...polygonPoints]
    }
  }

  execute() {
    return {
      polygonPoints: []
    }
  }

  undo() {
    return this.previousState
  }
}

/**
 * Utility function to find the closest point on a line segment to a given point
 */
export function findClosestPointOnSegment(segmentStart, segmentEnd, targetPoint) {
  const [x1, y1] = segmentStart
  const [x2, y2] = segmentEnd
  const [x, y] = targetPoint

  const A = x - x1
  const B = y - y1
  const C = x2 - x1
  const D = y2 - y1

  const dot = A * C + B * D
  const lenSq = C * C + D * D

  let param = -1
  if (lenSq !== 0) param = dot / lenSq

  let xx, yy

  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }

  const distance = Math.sqrt((x - xx) * (x - xx) + (y - yy) * (y - yy))
  return { point: [xx, yy], distance, parameter: param }
}

/**
 * Snap point to grid
 * @param {number[]} coords - [lng, lat] coordinates
 * @param {number} gridSize - Grid size in meters (e.g., 5 or 10)
 * @returns {number[]} - Snapped coordinates
 */
export function snapToGrid(coords, gridSize = 5) {
  // Approximate conversion from degrees to meters at equator (111,000 meters per degree)
  const metersPerDegree = 111000
  const degreeGridSize = gridSize / metersPerDegree

  return [
    Math.round(coords[0] / degreeGridSize) * degreeGridSize,
    Math.round(coords[1] / degreeGridSize) * degreeGridSize
  ]
}

/**
 * Generate smooth curve through points using Catmull-Rom interpolation
 * @param {number[][]} points - Array of [lng, lat] coordinates
 * @param {number} subdivisions - Number of points to generate between each pair
 * @returns {number[][]} - Smooth curve points
 */
export function generateSmoothCurve(points, subdivisions = 10) {
  if (points.length < 2) return points

  const smoothPoints = []

  for (let i = 0; i < points.length; i++) {
    // Get the four control points for Catmull-Rom
    const p0 = points[(i - 1 + points.length) % points.length]
    const p1 = points[i]
    const p2 = points[(i + 1) % points.length]
    const p3 = points[(i + 2) % points.length]

    // Add the current point
    smoothPoints.push(p1)

    // Generate interpolated points
    for (let t = 1; t < subdivisions; t++) {
      const s = t / subdivisions

      // Catmull-Rom basis functions
      const s2 = s * s
      const s3 = s2 * s

      const c0 = -0.5 * s3 + s2 - 0.5 * s
      const c1 = 1.5 * s3 - 2.5 * s2 + 1
      const c2 = -1.5 * s3 + 2 * s2 + 0.5 * s
      const c3 = 0.5 * s3 - 0.5 * s2

      const interpolated = [
        p0[0] * c0 + p1[0] * c1 + p2[0] * c2 + p3[0] * c3,
        p0[1] * c0 + p1[1] * c1 + p2[1] * c2 + p3[1] * c3
      ]

      smoothPoints.push(interpolated)
    }
  }

  return smoothPoints
}

/**
 * Calculate distance between two points in degrees
 * (approximate, good for small distances)
 */
export function calculateDistance(point1, point2) {
  const [x1, y1] = point1
  const [x2, y2] = point2
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}
