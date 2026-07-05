/**
 * Perfiles agrícolas predefinidos
 * Cada perfil aplica en un clic una combinación coherente de marco,
 * retranqueo, tipo de riego y modo de plantación. Distancias en cm.
 */

export const AGRICULTURAL_PROFILES = {
  huerto: {
    id: 'huerto',
    name: 'Huerto intensivo',
    icon: '🥗',
    description: 'Hortalizas en marco estrecho con goteo',
    config: {
      marcoHorizontal: 70,
      marcoVertical: 70,
      retranqueo: 50,
      tipoRiego: 'goteo',
      plantingMode: 'puntos',
    },
  },
  extensivo: {
    id: 'extensivo',
    name: 'Extensivo',
    icon: '🌾',
    description: 'Cereal y girasol en surcos con aspersión',
    config: {
      marcoHorizontal: 150,
      marcoVertical: 70,
      retranqueo: 100,
      tipoRiego: 'aspersion',
      plantingMode: 'surcos',
    },
  },
  aromaticas: {
    id: 'aromaticas',
    name: 'Aromáticas',
    icon: '🌿',
    description: 'Romero, tomillo y orégano a tresbolillo',
    config: {
      marcoHorizontal: 100,
      marcoVertical: 100,
      retranqueo: 60,
      tipoRiego: 'goteo',
      plantingMode: 'tresbolillo',
    },
  },
  tuberculos: {
    id: 'tuberculos',
    name: 'Tubérculos',
    icon: '🥔',
    description: 'Patata y zanahoria en caballones con riego por surcos',
    config: {
      marcoHorizontal: 75,
      marcoVertical: 35,
      retranqueo: 60,
      tipoRiego: 'surcos',
      plantingMode: 'surcos',
    },
  },
}

/**
 * Aplica un perfil sobre la config actual (no toca cultivos ni cantidades)
 */
export function applyProfile(currentConfig, profileId) {
  const profile = AGRICULTURAL_PROFILES[profileId]
  if (!profile) return currentConfig
  return { ...currentConfig, ...profile.config }
}

/**
 * Detecta si la config actual coincide exactamente con un perfil
 * (para resaltar el chip activo en la UI)
 */
export function getMatchingProfileId(config) {
  for (const profile of Object.values(AGRICULTURAL_PROFILES)) {
    const match = Object.entries(profile.config).every(
      ([key, value]) => config[key] === value
    )
    if (match) return profile.id
  }
  return null
}
