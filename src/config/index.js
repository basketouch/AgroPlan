/**
 * Punto de entrada centralizado de configuración de AgroPlan
 * Re-exporta constantes dispersas en utils/ junto a los nuevos defaults
 * para que el resto de la app importe todo desde 'src/config'
 */

export {
  DEFAULT_AGRICULTURAL_CONFIG,
  DEFAULT_MAP_CONFIG,
  DEFAULT_DRAWING_CONFIG,
  DEFAULT_UI_CONFIG,
} from './defaults'

export {
  CROP_CATEGORIES,
  CROP_METADATA,
  getAllCropIds,
  getCropMetadata,
  getCategoryByCropId,
} from '../utils/cropCategories'

export { cropColors, getCropColor } from '../utils/cropColors'

export { CROP_SPACING, getRecommendedSpacing } from '../utils/cropSpacing'

export {
  OBSTACLE_TYPES,
  distanceBetweenPoints,
  isPointInObstacleRadius,
  filterPointsByObstacles,
  createObstacle,
  calculateObstacleImpact,
} from '../utils/obstacleHelpers'
