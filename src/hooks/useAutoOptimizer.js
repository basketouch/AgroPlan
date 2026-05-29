import { useState, useCallback } from 'react'
import { generatePlantingGrid } from '../utils/geometry'

/**
 * Hook para optimizar automáticamente la configuración del layout
 * Testea múltiples combinaciones de orientación, espaciamientos y modos
 */
export function useAutoOptimizer() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResults, setOptimizationResults] = useState(null)
  const [bestConfiguration, setBestConfiguration] = useState(null)

  const optimize = useCallback((parcela, pozo, config, obstacles = []) => {
    if (!parcela || !pozo || !config) {
      console.error('Missing required parameters for optimization')
      return
    }

    setIsOptimizing(true)
    try {
      // Ángulos a testear
      const anglesToTest = [0, 30, 45, 60, 90, 135, 150, 180, 210, 225, 270, 315]

      // Espaciamientos a testear (variaciones del espaciamiento actual)
      // 70%, 85%, 100%, 115%, 130%
      const spacingMultipliers = [0.7, 0.85, 1.0, 1.15, 1.3]

      // Modos de plantación a testear
      const plantingModes = ['puntos', 'surcos', 'filas_dobles', 'tresbolillo']

      const results = []

      // Iterar sobre todas las combinaciones
      for (const multiplier of spacingMultipliers) {
        for (const angle of anglesToTest) {
          for (const mode of plantingModes) {
            try {
              // Calcular nuevos espaciamientos
              const newMarcoH = Math.round(config.marcoHorizontal * multiplier)
              const newMarcoV = Math.round(config.marcoVertical * multiplier)

              const testConfig = {
                ...config,
                marcoHorizontal: newMarcoH,
                marcoVertical: newMarcoV,
                orientationAngle: angle,
                plantingMode: mode
              }

              const result = generatePlantingGrid(parcela, pozo, testConfig, obstacles)

              results.push({
                angle: angle,
                spacingMultiplier: multiplier,
                marcoH: newMarcoH,
                marcoV: newMarcoV,
                plantingMode: mode,
                numeroPlantas: result.metricas.numeroPlantas,
                areaTotalHa: result.metricas.areaTotalHa,
                densidad: result.metricas.densidad,
                tuberíaTotal: result.metricas.tuberíaTotal || 0,
                metrosLineales: result.metricas.metrosLineales || 0,
                plantasExcluidas: result.metricas.plantasExcluidas || 0,
                porcentajeExcluido: result.metricas.porcentajeExcluido || 0
              })
            } catch (error) {
              console.error(`Error testing angle ${angle}, spacing ${multiplier}, mode ${mode}:`, error)
              // Continue to next iteration
            }
          }
        }
      }

      // Encontrar el mejor escenario (más plantas)
      if (results.length > 0) {
        const best = results.reduce((prev, current) =>
          current.numeroPlantas > prev.numeroPlantas ? current : prev
        )

        // Ordenar por número de plantas descendente
        const sorted = results.sort((a, b) => b.numeroPlantas - a.numeroPlantas)

        setOptimizationResults({
          all: sorted.slice(0, 20), // Top 20
          totalTested: results.length
        })
        setBestConfiguration(best)
      }
    } catch (error) {
      console.error('Error in optimization:', error)
    } finally {
      setIsOptimizing(false)
    }
  }, [])

  return {
    isOptimizing,
    optimizationResults,
    bestConfiguration,
    optimize,
    reset: () => {
      setOptimizationResults(null)
      setBestConfiguration(null)
    }
  }
}
