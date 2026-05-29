import './OptimizationResultsModal.css'

export default function OptimizationResultsModal({
  isOpen,
  optimizationResults,
  bestConfiguration,
  isCalculating,
  onApplyConfiguration,
  onClose
}) {
  if (!isOpen) return null

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'puntos':
        return 'Puntos'
      case 'surcos':
        return 'Surcos'
      case 'filas_dobles':
        return 'Filas Dobles'
      case 'tresbolillo':
        return 'Tresbolillo'
      default:
        return mode
    }
  }

  return (
    <div className="optimizer-overlay" onClick={onClose}>
      <div className="optimizer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="optimizer-header">
          <h2>🎯 Optimización Automática</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {isCalculating ? (
          <div className="optimizer-loading">
            <div className="loading-spinner"></div>
            <span>Analizando {optimizationResults?.totalTested || '1000+'} configuraciones...</span>
          </div>
        ) : optimizationResults && bestConfiguration ? (
          <>
            <div className="best-config-section">
              <div className="best-config-title">⭐ MEJOR CONFIGURACIÓN</div>

              <div className="config-summary">
                <div className="summary-item">
                  <span className="label">Máximo de Plantas</span>
                  <span className="value-highlight">{bestConfiguration.numeroPlantas}</span>
                </div>

                <div className="summary-item">
                  <span className="label">Marco Óptimo</span>
                  <span className="value">
                    {(bestConfiguration.marcoH / 100).toFixed(1)} × {(bestConfiguration.marcoV / 100).toFixed(1)} m
                  </span>
                </div>

                <div className="summary-item">
                  <span className="label">Ángulo Óptimo</span>
                  <span className="value">{bestConfiguration.angle}°</span>
                </div>

                <div className="summary-item">
                  <span className="label">Modo</span>
                  <span className="value">{getModeLabel(bestConfiguration.plantingMode)}</span>
                </div>

                <div className="summary-item">
                  <span className="label">Densidad</span>
                  <span className="value">{bestConfiguration.densidad?.toFixed(0)} plantas/ha</span>
                </div>

                {bestConfiguration.plantasExcluidas > 0 && (
                  <div className="summary-item warning">
                    <span className="label">Plantas Excluidas</span>
                    <span className="value">{bestConfiguration.plantasExcluidas} ({bestConfiguration.porcentajeExcluido}%)</span>
                  </div>
                )}
              </div>

              <button
                className="apply-btn"
                onClick={() => {
                  onApplyConfiguration({
                    marcoH: bestConfiguration.marcoH,
                    marcoV: bestConfiguration.marcoV,
                    angle: bestConfiguration.angle,
                    mode: bestConfiguration.plantingMode
                  })
                  onClose()
                }}
                title="Aplicar esta configuración al layout"
              >
                ✓ Aplicar Configuración Óptima
              </button>
            </div>

            {optimizationResults.all && optimizationResults.all.length > 1 && (
              <div className="alternatives-section">
                <div className="alternatives-title">Alternativas (Top 10)</div>

                <div className="alternatives-table">
                  <div className="table-header">
                    <div className="col-ranking">#</div>
                    <div className="col-plants">Plantas</div>
                    <div className="col-spacing">Marco</div>
                    <div className="col-angle">Ángulo</div>
                    <div className="col-mode">Modo</div>
                    <div className="col-action">Acción</div>
                  </div>

                  {optimizationResults.all.slice(0, 10).map((config, idx) => (
                    <div
                      key={idx}
                      className={`table-row ${idx === 0 ? 'best' : ''}`}
                    >
                      <div className="col-ranking">
                        {idx === 0 ? '⭐' : idx + 1}
                      </div>
                      <div className="col-plants">{config.numeroPlantas}</div>
                      <div className="col-spacing">
                        {(config.marcoH / 100).toFixed(1)} × {(config.marcoV / 100).toFixed(1)} m
                      </div>
                      <div className="col-angle">{config.angle}°</div>
                      <div className="col-mode">{getModeLabel(config.plantingMode)}</div>
                      <div className="col-action">
                        <button
                          className="alt-apply-btn"
                          onClick={() => {
                            onApplyConfiguration({
                              marcoH: config.marcoH,
                              marcoV: config.marcoV,
                              angle: config.angle,
                              mode: config.plantingMode
                            })
                            onClose()
                          }}
                          title="Aplicar esta configuración"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-stats">
                  <p>
                    Se analizaron <strong>{optimizationResults.totalTested}</strong> configuraciones diferentes.
                    La mejor opción tiene <strong>{Math.round((bestConfiguration.numeroPlantas / optimizationResults.all[optimizationResults.all.length - 1].numeroPlantas - 1) * 100)}%</strong> más plantas que la peor.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="optimizer-empty">
            <p>Sin resultados. Intenta de nuevo.</p>
          </div>
        )}
      </div>
    </div>
  )
}
