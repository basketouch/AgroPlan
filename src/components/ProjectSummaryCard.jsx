import './ProjectSummaryCard.css'

export default function ProjectSummaryCard({ metricas, isIsometric, onToggleIsometric }) {
  if (!metricas) return null

  return (
    <div className="project-summary-card">
      <div className="project-summary-header">
        <h4>📊 Resumen del Proyecto</h4>
        <button
          className={`isometric-toggle ${isIsometric ? 'active' : ''}`}
          onClick={onToggleIsometric}
          title={isIsometric ? 'Volver a vista plana' : 'Ver en 3D / isométrico'}
        >
          {isIsometric ? '🗺️ 2D' : '🧊 3D'}
        </button>
      </div>

      <div className="project-summary-grid">
        <div className="project-summary-item">
          <span className="project-summary-label">Área</span>
          <span className="project-summary-value">{metricas.areaTotalHa?.toFixed(2)} ha</span>
        </div>
        <div className="project-summary-item">
          <span className="project-summary-label">Plantas</span>
          <span className="project-summary-value">{metricas.numeroPlantas}</span>
        </div>
        <div className="project-summary-item">
          <span className="project-summary-label">Densidad</span>
          <span className="project-summary-value">{metricas.densidad?.toFixed(0)} pl/ha</span>
        </div>
        <div className="project-summary-item">
          <span className="project-summary-label">Marco</span>
          <span className="project-summary-value">{(metricas.marcoH / 100).toFixed(1)}×{(metricas.marcoV / 100).toFixed(1)}m</span>
        </div>
        <div className="project-summary-item project-summary-item-wide">
          <span className="project-summary-label">Tubería estimada</span>
          <span className="project-summary-value">{metricas.metrosLineales?.toFixed(0)} m</span>
        </div>
      </div>
    </div>
  )
}
