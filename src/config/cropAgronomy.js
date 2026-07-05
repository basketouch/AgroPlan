/**
 * Datos agronómicos de cultivos para la UI
 * Complementa waterDemand y cropCompatibility (utils/geometry.js, usados
 * por el algoritmo de asignación) con información legible por el usuario:
 * ciclo de cultivo, época de siembra/cosecha y nivel de agua.
 * Valores orientativos para clima mediterráneo (España).
 */

import { waterDemand, cropCompatibility } from '../utils/geometry'

export const CROP_CYCLES = {
  // Hortalizas
  tomate: { cicloDias: 120, siembra: 'Feb–Abr', cosecha: 'Jul–Oct' },
  lechuga: { cicloDias: 70, siembra: 'Feb–Oct', cosecha: 'Todo el año' },
  pepino: { cicloDias: 90, siembra: 'Abr–Jun', cosecha: 'Jul–Sep' },
  pimiento: { cicloDias: 135, siembra: 'Feb–Abr', cosecha: 'Jul–Oct' },
  cebolla: { cicloDias: 150, siembra: 'Ene–Mar', cosecha: 'Jun–Ago' },

  // Extensivo
  trigo: { cicloDias: 210, siembra: 'Oct–Dic', cosecha: 'Jun–Jul' },
  maiz: { cicloDias: 140, siembra: 'Abr–Jun', cosecha: 'Sep–Oct' },
  girasol: { cicloDias: 130, siembra: 'Abr–May', cosecha: 'Sep' },

  // Aromáticas (perennes)
  romero: { cicloDias: null, siembra: 'Mar–May', cosecha: 'Perenne' },
  tomillo: { cicloDias: null, siembra: 'Mar–May', cosecha: 'Perenne' },
  oregano: { cicloDias: null, siembra: 'Mar–May', cosecha: 'Perenne' },

  // Tubérculos
  patata: { cicloDias: 120, siembra: 'Feb–May', cosecha: 'Jun–Sep' },
  zanahoria: { cicloDias: 100, siembra: 'Feb–Jun', cosecha: 'May–Oct' },
}

/**
 * Ficha agronómica completa de un cultivo (o null si no hay datos)
 */
export function getCropAgroInfo(cropId) {
  const cycle = CROP_CYCLES[cropId]
  if (!cycle) return null
  return {
    ...cycle,
    agua: getWaterLevelLabel(cropId),
  }
}

/**
 * Nivel de agua legible a partir del índice de demanda hídrica (1-10)
 */
export function getWaterLevelLabel(cropId) {
  const demand = waterDemand[cropId]
  if (demand === undefined) return null
  if (demand >= 8) return { label: 'Muy alta', icon: '💧💧💧' }
  if (demand >= 6) return { label: 'Alta', icon: '💧💧' }
  if (demand >= 4) return { label: 'Media', icon: '💧' }
  return { label: 'Baja', icon: '🌵' }
}

/**
 * Pares de cultivos incompatibles dentro de una selección
 * (plagas/enfermedades comunes según cropCompatibility)
 */
export function getIncompatiblePairs(cultivos) {
  const pairs = []
  for (let i = 0; i < cultivos.length; i++) {
    for (let j = i + 1; j < cultivos.length; j++) {
      if (cropCompatibility[cultivos[i]]?.[cultivos[j]] === -1) {
        pairs.push([cultivos[i], cultivos[j]])
      }
    }
  }
  return pairs
}
