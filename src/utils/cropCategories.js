/**
 * Crop Categories and Metadata
 * Organizes crops into hierarchical categories for UI display
 * Maintains backward compatibility with crop IDs used in geometry.js
 */

/**
 * Hierarchical crop categories
 * Each category contains a list of crop IDs
 */
export const CROP_CATEGORIES = {
  hortalizas: {
    id: 'hortalizas',
    name: 'Hortalizas',
    icon: '🥗',
    crops: ['tomate', 'lechuga', 'pepino', 'pimiento', 'cebolla']
  },
  extensivo: {
    id: 'extensivo',
    name: 'Extensivo',
    icon: '🌾',
    crops: ['trigo', 'maiz', 'girasol']
  },
  aromaticas: {
    id: 'aromaticas',
    name: 'Aromáticas',
    icon: '🌿',
    crops: ['romero', 'tomillo', 'oregano']
  },
  tuberculos: {
    id: 'tuberculos',
    name: 'Tubérculos',
    icon: '🥔',
    crops: ['patata', 'zanahoria']
  }
}

/**
 * Flat lookup table for crop metadata
 * Maintains compatibility with geometry.js crop ID references
 */
export const CROP_METADATA = {
  // Hortalizas
  tomate: { name: 'Tomate', emoji: '🍅' },
  lechuga: { name: 'Lechuga', emoji: '🥬' },
  pepino: { name: 'Pepino', emoji: '🥒' },
  pimiento: { name: 'Pimiento', emoji: '🫑' },
  cebolla: { name: 'Cebolla', emoji: '🧅' },

  // Extensivo
  trigo: { name: 'Trigo', emoji: '🌾' },
  maiz: { name: 'Maíz', emoji: '🌽' },
  girasol: { name: 'Girasol', emoji: '🌻' },

  // Aromáticas
  romero: { name: 'Romero', emoji: '🌿' },
  tomillo: { name: 'Tomillo', emoji: '🌱' },
  oregano: { name: 'Orégano', emoji: '🌿' },

  // Tubérculos
  patata: { name: 'Patata', emoji: '🥔' },
  zanahoria: { name: 'Zanahoria', emoji: '🥕' }
}

/**
 * Get all crop IDs from categories
 */
export function getAllCropIds() {
  return Object.values(CROP_CATEGORIES).flatMap(cat => cat.crops)
}

/**
 * Get crop metadata by ID
 */
export function getCropMetadata(cropId) {
  return CROP_METADATA[cropId] || { name: cropId, emoji: '🌱' }
}

/**
 * Get category by crop ID
 */
export function getCategoryByCropId(cropId) {
  for (const [categoryId, category] of Object.entries(CROP_CATEGORIES)) {
    if (category.crops.includes(cropId)) {
      return category
    }
  }
  return null
}
