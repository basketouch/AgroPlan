# AgroPlan - Generador de Layouts Agrícolas

Una plataforma web interactiva para diseñar y optimizar distribuciones de cultivos. Dibuja tu parcela, marca el pozo, y obtén al instante la retícula de plantación óptima con cálculos de densidad y materiales.

## Características MVP

- 🗺️ Mapa satélite interactivo (Google Maps)
- ✏️ Dibujo libre de polígonos (parcela)
- 📍 Marcador de infraestructura (pozo)
- ⚡ Generación instantánea de grid de plantación
- 📊 Métricas en vivo: área, nº plantas, densidad, materiales
- 💾 Exportación de resultados (PDF/PNG)

## Instalación Rápida

```bash
cd /Users/jorgelorenzo/Desktop/AgroFit
npm install
npm run dev
```

> ⚠️ Necesitas una API key de Google Maps. Copia `.env.example` a `.env.local` y añade tu clave.

## Flujo de Usuario

1. **Búsqueda**: Introduce municipio o coordenadas
2. **Dibujo**: Traza el perímetro de tu parcela haciendo clic
3. **Infraestructura**: Arrastra un marcador al pozo
4. **Configuración**: Selecciona marco de plantación (ej. 7×7) y retranqueo
5. **Generación**: El sistema dibuja instantáneamente los puntos y calcula métricas
6. **Exportación**: Descarga PDF/PNG con el diseño y datos

## Stack Tecnológico

- **React 18** + Vite (dev server muy rápido)
- **Google Maps API** (Drawing Library + Geometry Library)
- **Turf.js** (análisis espacial en el navegador)
- **CSS** (diseño responsive)

## Documentación para Desarrolladores

Ver [CLAUDE.md](./CLAUDE.md) para:
- Arquitectura de componentes
- Explicación del algoritmo generativo
- Comandos de desarrollo
- Workflow de iteración

## Estado del Proyecto

MVP inicial con:
- ✅ Estructura React lista
- ✅ Componentes stubbed (listos para implementar)
- ✅ Algoritmo geométrico base (Turf.js)
- ⏳ Integración Google Maps (TODO)
- ⏳ Lógica de dibujo/marcadores (TODO)
- ⏳ Conexión algorithm ↔ UI (TODO)

## Next Steps

1. Obtener Google Maps API key
2. Implementar MapContainer con Google Maps init
3. Conectar herramientas de dibujo a estado React
4. Integrar `generatePlantingGrid()` al botón "Generar"
5. Renderizar grid points + actualizar MetricsPanel
6. Pulir UI/UX y manejo de errores

---

**Visión**: Validar interés de mercado con MVP rápido. Cálculos instantáneos, sin topografía 3D. Escalar luego con backend, auth, histórico de proyectos.
