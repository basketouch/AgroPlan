import './ScenarioComparatorModal.css'

export default function ScenarioComparatorModal({
  isOpen,
  scenarios,
  bestScenario,
  isCalculating,
  onSelectAngle,
  onClose
}) {
  if (!isOpen) return null

  const sortedScenarios = [...scenarios].sort((a, b) => b.numeroPlantas - a.numeroPlantas)

  return (
    <div className="comparator-overlay" onClick={onClose}>
      <div className="comparator-modal" onClick={e => e.stopPropagation()}>
        <div className="comparator-header">
          <h2>📊 Comparador de Escenarios</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {isCalculating ? (
          <div className="comparator-loading">
            <div className="spinner"></div>
            <p>Analizando 12 ángulos...</p>
          </div>
        ) : scenarios.length > 0 ? (
          <div className="comparator-content">
            <div className="comparator-table-wrapper">
              <table className="comparator-table">
                <thead>
                  <tr>
                    <th>Ángulo</th>
                    <th>Plantas</th>
                    <th>Tubería (m)</th>
                    <th>Densidad</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedScenarios.map(scenario => (
                    <tr
                      key={scenario.angle}
                      className={`scenario-row ${bestScenario?.angle === scenario.angle ? 'best' : ''}`}
                    >
                      <td className="angle-cell">
                        <strong>{scenario.angle}°</strong>
                        {bestScenario?.angle === scenario.angle && <span className="best-badge">⭐ MEJOR</span>}
                      </td>
                      <td className="number-cell">
                        <span className="highlight">{scenario.numeroPlantas}</span>
                      </td>
                      <td className="number-cell">
                        {scenario.tuberíaTotal.toFixed(1)}
                      </td>
                      <td className="number-cell">
                        {scenario.densidad.toFixed(0)} pl/ha
                      </td>
                      <td className="action-cell">
                        <button
                          className={`apply-btn ${bestScenario?.angle === scenario.angle ? 'best' : ''}`}
                          onClick={() => {
                            onSelectAngle(scenario.angle)
                            onClose()
                          }}
                          title={`Aplicar orientación ${scenario.angle}°`}
                        >
                          Aplicar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="comparator-summary">
              <div className="summary-item">
                <span>Mejor ángulo:</span>
                <strong>{bestScenario?.angle}°</strong>
              </div>
              <div className="summary-item">
                <span>Máximo de plantas:</span>
                <strong>{bestScenario?.numeroPlantas}</strong>
              </div>
              <div className="summary-item">
                <span>Rango de variación:</span>
                <strong>
                  {Math.max(...scenarios.map(s => s.numeroPlantas)) - Math.min(...scenarios.map(s => s.numeroPlantas))} plantas
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="comparator-empty">
            <p>No hay escenarios para mostrar</p>
          </div>
        )}
      </div>
    </div>
  )
}
