import { useState, useRef, useEffect } from 'react'
import { calculateAngleFromLine, calculatePolygonCenter } from '../utils/orientationCalculator'
import './TractorLineGuide.css'

export default function TractorLineGuide({
  isActive,
  parcela,
  onLineChange,
  currentAngle = 0,
  onAngleChange
}) {
  const [linePoints, setLinePoints] = useState(null)
  const [isDraggingStart, setIsDraggingStart] = useState(false)
  const [isDraggingEnd, setIsDraggingEnd] = useState(false)
  const [tempAngle, setTempAngle] = useState(currentAngle)

  // Update temp angle when currentAngle prop changes
  useEffect(() => {
    setTempAngle(currentAngle)
  }, [currentAngle])

  // Initialize line points when parcela is provided
  useEffect(() => {
    if (parcela && !linePoints) {
      const center = calculatePolygonCenter(parcela.slice(0, -1)) // Remove duplicate closing point
      const [centerLng, centerLat] = center

      // Create initial line pointing horizontally (0 degrees)
      const distance = 0.001 // Small distance in degrees
      const point1 = [centerLng - distance, centerLat]
      const point2 = [centerLng + distance, centerLat]

      setLinePoints([point1, point2])
      onLineChange([point1, point2], 0)
    }
  }, [parcela, linePoints, onLineChange])

  // Calculate angle from line points
  const calculateAndNotifyAngle = (points) => {
    if (points && points.length === 2) {
      const angle = calculateAngleFromLine(points[0], points[1])
      setTempAngle(angle)
      onAngleChange(angle)
      onLineChange(points, angle)
    }
  }

  // Update line point and recalculate angle
  const updateLinePoint = (index, newPoint) => {
    const newPoints = [...linePoints]
    newPoints[index] = newPoint
    setLinePoints(newPoints)
    calculateAndNotifyAngle(newPoints)
  }

  // Handle slider change
  const handleSliderChange = (angle) => {
    setTempAngle(angle)
    onAngleChange(angle)

    if (linePoints && parcela) {
      const center = calculatePolygonCenter(parcela.slice(0, -1))
      const [centerLng, centerLat] = center
      const distance = 0.002

      // Recalculate line points based on new angle
      const angleRad = angle * (Math.PI / 180)
      const point1 = [centerLng - distance * Math.cos(angleRad), centerLat - distance * Math.sin(angleRad)]
      const point2 = [centerLng + distance * Math.cos(angleRad), centerLat + distance * Math.sin(angleRad)]

      setLinePoints([point1, point2])
      onLineChange([point1, point2], angle)
    }
  }

  if (!isActive || !parcela || !linePoints) {
    return null
  }

  return (
    <div className="tractor-guide-overlay">
      <div className="tractor-guide-container">
        <div className="tractor-guide-header">
          <h3>🚜 Línea de Dirección del Tractor</h3>
          <p className="guide-subtitle">Dibuja la dirección de plantación</p>
        </div>

        <div className="tractor-guide-controls">
          <div className="angle-display">
            <label>Ángulo de Dirección</label>
            <div className="angle-value">{Math.round(tempAngle)}°</div>
          </div>

          <div className="angle-slider-group">
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={Math.round(tempAngle)}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="angle-slider"
            />
            <div className="slider-labels">
              <span>0°</span>
              <span>90°</span>
              <span>180°</span>
              <span>270°</span>
            </div>
          </div>

          <div className="preset-angles">
            <button
              className={`angle-preset ${Math.abs(tempAngle - 0) < 5 ? 'active' : ''}`}
              onClick={() => handleSliderChange(0)}
              title="Dirección horizontal (Este-Oeste)"
            >
              ↔ 0°
            </button>
            <button
              className={`angle-preset ${Math.abs(tempAngle - 45) < 5 ? 'active' : ''}`}
              onClick={() => handleSliderChange(45)}
              title="Diagonal 45°"
            >
              ↗ 45°
            </button>
            <button
              className={`angle-preset ${Math.abs(tempAngle - 90) < 5 ? 'active' : ''}`}
              onClick={() => handleSliderChange(90)}
              title="Dirección vertical (Norte-Sur)"
            >
              ↕ 90°
            </button>
            <button
              className={`angle-preset ${Math.abs(tempAngle - 135) < 5 ? 'active' : ''}`}
              onClick={() => handleSliderChange(135)}
              title="Diagonal 135°"
            >
              ↙ 135°
            </button>
          </div>

          <div className="guide-info">
            <p>💡 Ajusta la línea para cambiar la orientación de la plantación. El sistema generará todas las filas paralelas a esta dirección.</p>
          </div>
        </div>
      </div>

      {/* CSS para renderización visual se maneja desde MapContainer */}
    </div>
  )
}
