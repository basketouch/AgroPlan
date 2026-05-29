import { useState, useCallback } from 'react'
import { generatePlantingGrid } from '../utils/geometry'

/**
 * Hook para comparar múltiples escenarios de ángulos de orientación
 * Calcula métricas para 12 ángulos diferentes automáticamente
 */
export function useScenarioComparator() {
  const [scenarios, setScenarios] = useState([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [bestScenario, setBestScenario] = useState(null)

  const compareAngles = useCallback((parcela, pozo, config, obstacles = []) => {
    if (!parcela || !pozo || !config) {
      console.error('Missing required parameters for scenario comparison')
      return
    }

    setIsCalculating(true)
    try {
      // Generar ángulos a testear: 0°, 30°, 45°, 60°, 90°, 135°, 150°, 180°, 210°, 225°, 270°, 315°
      const anglesToTest = [0, 30, 45, 60, 90, 135, 150, 180, 210, 225, 270, 315]

      const results = anglesToTest.map(angle => {
        try {
          const configWithAngle = {
            ...config,
            orientationAngle: angle
          }

          const result = generatePlantingGrid(parcela, pozo, configWithAngle, obstacles)

          return {
            angle: angle,
            numeroPlantas: result.metricas.numeroPlantas,
            areaTotalHa: result.metricas.areaTotalHa,
            densidad: result.metricas.densidad,
            tuberíaTotal: result.metricas.tuberíaTotal || 0,
            longitud: result.metricas.longitud || 0,
            anchura: result.metricas.anchura || 0,
            perimeter: result.metricas.perimeter || 0
          }
        } catch (error) {
          console.error(`Error calculating angle ${angle}:`, error)
          return null
        }
      }).filter(s => s !== null)

      // Encontrar el mejor escenario (más plantas)
      const best = results.reduce((prev, current) =>
        current.numeroPlantas > prev.numeroPlantas ? current : prev
      )

      setScenarios(results)
      setBestScenario(best)
    } catch (error) {
      console.error('Error in scenario comparison:', error)
    } finally {
      setIsCalculating(false)
    }
  }, [])

  return {
    scenarios,
    bestScenario,
    isCalculating,
    compareAngles,
    reset: () => {
      setScenarios([])
      setBestScenario(null)
    }
  }
}
