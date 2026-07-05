/**
 * Marco de plantación recomendado por cultivo (valores agronómicos orientativos)
 * Todas las medidas en centímetros. Autocompleta Marco H/V al seleccionar un
 * cultivo; el usuario puede editarlo libremente después.
 */
export const CROP_SPACING = {
  // Hortalizas
  tomate: { horizontal: 40, vertical: 100 },
  lechuga: { horizontal: 30, vertical: 30 },
  pepino: { horizontal: 50, vertical: 150 },
  pimiento: { horizontal: 40, vertical: 70 },
  cebolla: { horizontal: 10, vertical: 30 },

  // Extensivo
  trigo: { horizontal: 17, vertical: 17 },
  maiz: { horizontal: 20, vertical: 70 },
  girasol: { horizontal: 30, vertical: 70 },

  // Aromáticas
  romero: { horizontal: 60, vertical: 60 },
  tomillo: { horizontal: 30, vertical: 30 },
  oregano: { horizontal: 30, vertical: 30 },

  // Tubérculos
  patata: { horizontal: 30, vertical: 70 },
  zanahoria: { horizontal: 5, vertical: 25 },
}

/**
 * Obtiene el marco recomendado para un cultivo, o null si no hay dato
 */
export function getRecommendedSpacing(cropId) {
  return CROP_SPACING[cropId] || null
}
