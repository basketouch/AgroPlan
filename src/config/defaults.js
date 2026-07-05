/**
 * Valores por defecto centralizados de AgroPlan
 * Punto único de verdad para configuración inicial de la app
 */

/**
 * Configuración agrícola inicial (marco de plantación, riego, cultivos)
 * Todas las medidas de distancia en centímetros
 */
export const DEFAULT_AGRICULTURAL_CONFIG = {
  marcoHorizontal: 70,   // cm - espaciamiento horizontal entre plantas
  marcoVertical: 70,     // cm - espaciamiento vertical entre plantas
  retranqueo: 50,        // cm - margen desde bordes de la parcela
  tipoRiego: 'goteo',    // 'goteo' | 'aspersion' | 'surcos'
  cultivosSeleccionados: [],
  modoPlantacion: 'espaciamiento', // 'espaciamiento' | 'cantidad-fija'
  plantingMode: 'puntos', // 'puntos' | 'surcos' | 'filas_dobles' | 'tresbolillo'
  cantidadesCultivos: {
    // Hortalizas
    tomate: 0,
    patata: 0,
    lechuga: 0,
    cebolla: 0,
    pimiento: 0,
    pepino: 0,
    zanahoria: 0,
    // Extensivo
    trigo: 0,
    maiz: 0,
    girasol: 0,
    // Aromáticas
    romero: 0,
    tomillo: 0,
    oregano: 0,
  },
}

/**
 * Configuración inicial del mapa
 */
export const DEFAULT_MAP_CONFIG = {
  center: { lat: 40.4168, lng: -3.7038 }, // Madrid, España
  zoom: 15,
  mapTypeId: 'satellite',
  tilt: 0,
  heading: 0,
  searchZoom: 17, // zoom aplicado al centrar por búsqueda de lugar
}

/**
 * Configuración del editor de dibujo de parcelas
 */
export const DEFAULT_DRAWING_CONFIG = {
  snapToGrid: false,
  snapGridSizeMeters: 5,   // tamaño de rejilla para snap-to-grid
  smoothCurves: false,
  insertPointMaxDistance: 0.005, // distancia máx. (grados) para insertar punto en segmento
}

/**
 * Preferencias generales de UI
 */
export const DEFAULT_UI_CONFIG = {
  displayUnit: 'cm',   // 'cm' | 'm'
  panelWidth: 380,
  panelWidthMin: 300,
  panelWidthMax: 600,
}
