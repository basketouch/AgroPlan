export const cropColors = {
  // Hortalizas
  tomate: '#E53935',      // Rojo
  patata: '#A1887F',      // Marrón
  lechuga: '#7CB342',     // Verde claro
  cebolla: '#FFB300',     // Naranja
  pimiento: '#FFEB3B',    // Amarillo
  pepino: '#00897B',      // Verde oscuro

  // Extensivo
  trigo: '#DAA520',       // Marrón dorado (goldenrod)
  maiz: '#FFD700',        // Amarillo dorado
  girasol: '#FFA500',     // Naranja

  // Aromáticas
  romero: '#228B22',      // Verde bosque
  tomillo: '#3CB371',     // Verde medio
  oregano: '#2E8B57',     // Verde mar oscuro

  // Tubérculos
  zanahoria: '#FF8C00',   // Naranja oscuro
}

export function getCropColor(cultivo) {
  return cropColors[cultivo] || '#4CAF50'
}
