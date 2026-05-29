import './MetricsPanel.css'

export default function MetricsPanel({ metricas }) {
  return (
    <div className="metrics-panel">
      <h2>Resultados</h2>

      <div className="metric-item">
        <span className="metric-label">Área Total</span>
        <span className="metric-value">{metricas.areaTotalHa?.toFixed(2)} ha</span>
      </div>

      <div className="metric-item">
        <span className="metric-label">Nº de Plantas</span>
        <span className="metric-value">
          {metricas.numeroPlantas}
          {metricas.plantasExcluidas > 0 && (
            <span className="excluded-info" title={`${metricas.plantasExcluidas} plantas excluidas por obstáculos (${metricas.porcentajeExcluido}%)`}>
              {' '}-{metricas.plantasExcluidas}
            </span>
          )}
        </span>
      </div>

      <div className="metric-item">
        <span className="metric-label">Densidad</span>
        <span className="metric-value">{metricas.densidad?.toFixed(0)} plantas/ha</span>
      </div>

      <div className="metric-item">
        <span className="metric-label">Tubería (estimado)</span>
        <span className="metric-value">{metricas.metrosLineales?.toFixed(0)} m</span>
      </div>

      <div className="metric-item">
        <span className="metric-label">Marco</span>
        <span className="metric-value">{(metricas.marcoH / 100).toFixed(1)} × {(metricas.marcoV / 100).toFixed(1)} m</span>
      </div>

      {metricas.cultivosSeleccionados && metricas.cultivosSeleccionados.length > 0 && (
        <>
          <div className="divider"></div>

          <div className="metric-item">
            <span className="metric-label">Cultivos Seleccionados</span>
            <span className="metric-value">
              {metricas.cultivosSeleccionados.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Tipo de Riego</span>
            <span className="metric-value">
              {metricas.tipoRiego === 'goteo' && 'Goteo'}
              {metricas.tipoRiego === 'aspersion' && 'Aspersión'}
              {metricas.tipoRiego === 'surcos' && 'Surcos'}
            </span>
          </div>

          <div className="zones-section">
            <h3>Distribución por Zona y Cultivo</h3>
            {metricas.cultivosSeleccionados.length === 1 && (
              <>
                <div className="zone-item">
                  <span className="zone-label">Zona 1 (óptima)</span>
                  <span className="zone-value">{metricas.distribucionPorZona?.zona1 || 0} de {metricas.cultivosSeleccionados[0].charAt(0).toUpperCase() + metricas.cultivosSeleccionados[0].slice(1)}</span>
                </div>
                <div className="zone-item">
                  <span className="zone-label">Zona 2 (adecuada)</span>
                  <span className="zone-value">{metricas.distribucionPorZona?.zona2 || 0} de {metricas.cultivosSeleccionados[0].charAt(0).toUpperCase() + metricas.cultivosSeleccionados[0].slice(1)}</span>
                </div>
                <div className="zone-item">
                  <span className="zone-label">Zona 3 (complementaria)</span>
                  <span className="zone-value">{metricas.distribucionPorZona?.zona3 || 0} de {metricas.cultivosSeleccionados[0].charAt(0).toUpperCase() + metricas.cultivosSeleccionados[0].slice(1)}</span>
                </div>
              </>
            )}
            {metricas.cultivosSeleccionados.length === 2 && (
              <>
                <div className="zone-item">
                  <span className="zone-label">Zona 1 (óptima)</span>
                  <span className="zone-value">{metricas.distribucionPorZona?.zona1 || 0} de {metricas.cultivosSeleccionados[0].charAt(0).toUpperCase() + metricas.cultivosSeleccionados[0].slice(1)}</span>
                </div>
                <div className="zone-item">
                  <span className="zone-label">Zona 2 (adecuada)</span>
                  <span className="zone-value">{metricas.distribucionPorZona?.zona2 || 0} de {metricas.cultivosSeleccionados[0].charAt(0).toUpperCase() + metricas.cultivosSeleccionados[0].slice(1)}</span>
                </div>
                <div className="zone-item">
                  <span className="zone-label">Zona 3 (complementaria)</span>
                  <span className="zone-value">{metricas.distribucionPorZona?.zona3 || 0} de {metricas.cultivosSeleccionados[1].charAt(0).toUpperCase() + metricas.cultivosSeleccionados[1].slice(1)}</span>
                </div>
              </>
            )}
            {metricas.cultivosSeleccionados.length === 3 && (
              <>
                <div className="zone-item">
                  <span className="zone-label">Zona 1 (óptima)</span>
                  <span className="zone-value">{metricas.distribucionPorZona?.zona1 || 0} de {metricas.cultivosSeleccionados[0].charAt(0).toUpperCase() + metricas.cultivosSeleccionados[0].slice(1)}</span>
                </div>
                <div className="zone-item">
                  <span className="zone-label">Zona 2 (adecuada)</span>
                  <span className="zone-value">{metricas.distribucionPorZona?.zona2 || 0} de {metricas.cultivosSeleccionados[1].charAt(0).toUpperCase() + metricas.cultivosSeleccionados[1].slice(1)}</span>
                </div>
                <div className="zone-item">
                  <span className="zone-label">Zona 3 (complementaria)</span>
                  <span className="zone-value">{metricas.distribucionPorZona?.zona3 || 0} de {metricas.cultivosSeleccionados[2].charAt(0).toUpperCase() + metricas.cultivosSeleccionados[2].slice(1)}</span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
