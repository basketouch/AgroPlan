/**
 * Real-time drag preview tooltip
 * Shows coordinates and distance during point dragging
 */
export default function DragPreviewTooltip({ dragPreview }) {
  if (!dragPreview) return null

  const { pointIndex, currentCoords, distanceMoved } = dragPreview

  return (
    <div className="drag-preview-tooltip">
      <div className="preview-header">
        <span className="point-label">Punto {pointIndex + 1}</span>
      </div>

      <div className="preview-content">
        <div className="preview-row">
          <span className="label">Coords:</span>
          <code className="coords">
            {currentCoords[0].toFixed(6)}, {currentCoords[1].toFixed(6)}
          </code>
        </div>

        <div className="preview-row">
          <span className="label">Dist:</span>
          <code className="distance">
            {(distanceMoved * 1000).toFixed(1)}m
          </code>
        </div>
      </div>
    </div>
  )
}
