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
        <span className="metric-value">{metricas.numeroPlantas}</span>
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
        <span className="metric-value">{metricas.marcoH} × {metricas.marcoV} m</span>
      </div>
    </div>
  )
}
