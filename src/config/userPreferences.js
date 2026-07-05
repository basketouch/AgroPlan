/**
 * Preferencias de usuario editables desde la UI de Ajustes
 * Se persisten en localStorage y sobreescriben los defaults de config
 */

import { DEFAULT_MAP_CONFIG, DEFAULT_DRAWING_CONFIG, DEFAULT_UI_CONFIG } from './defaults'

const STORAGE_KEY = 'agroplan-preferences'

export const DEFAULT_PREFERENCES = {
  mapTypeId: DEFAULT_MAP_CONFIG.mapTypeId,           // 'satellite' | 'hybrid' | 'roadmap'
  searchZoom: DEFAULT_MAP_CONFIG.searchZoom,         // zoom al buscar un lugar
  snapGridSizeMeters: DEFAULT_DRAWING_CONFIG.snapGridSizeMeters,
  displayUnit: DEFAULT_UI_CONFIG.displayUnit,        // 'cm' | 'm'
}

/**
 * Carga preferencias guardadas fusionadas con los defaults
 * (claves nuevas en futuras versiones caen al default)
 */
export function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { ...DEFAULT_PREFERENCES }
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

/**
 * Guarda las preferencias en localStorage
 */
export function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // localStorage no disponible (modo privado, etc.) - ignorar
  }
}
