import './ValidationStatusIndicator.css'

export default function ValidationStatusIndicator({ validation, visible }) {
  if (!visible || !validation) return null

  const hasErrors = validation.errors.length > 0
  const hasWarnings = validation.warnings.length > 0 && !hasErrors
  const isValid = validation.isValid && validation.warnings.length === 0

  const statusClass = hasErrors ? 'error' : hasWarnings ? 'warning' : 'valid'
  const statusIcon = hasErrors ? '❌' : hasWarnings ? '⚠️' : '✓'
  const statusText = hasErrors ? 'Errores' : hasWarnings ? 'Advertencias' : 'Válido'

  return (
    <div className={`validation-status-indicator ${statusClass}`}>
      <div className="validation-header">
        <span className="validation-icon">{statusIcon}</span>
        <span className="validation-text">{statusText}</span>
        <span className="validation-area">Área: {validation.area.toFixed(3)} km² ({(validation.area * 100).toFixed(2)} ha)</span>
      </div>

      {validation.errors.length > 0 && (
        <div className="validation-errors">
          <div className="validation-list-label">Errores:</div>
          {validation.errors.map((error, idx) => (
            <div key={idx} className="validation-item error-item">
              • {error}
            </div>
          ))}
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="validation-warnings">
          <div className="validation-list-label">Advertencias:</div>
          {validation.warnings.map((warning, idx) => (
            <div key={idx} className="validation-item warning-item">
              • {warning}
            </div>
          ))}
        </div>
      )}

      {isValid && (
        <div className="validation-success">
          ✓ Polígono válido con {validation.pointCount} puntos
        </div>
      )}
    </div>
  )
}
