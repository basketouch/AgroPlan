# Próximos Pasos - AgroFit MVP

## 🎯 Estado Actual

✅ Estructura React + Vite completa  
✅ Componentes UI creados (MapContainer, ControlPanel, MetricsPanel)  
✅ Algoritmo geométrico listo (src/utils/geometry.js)  
✅ Documentación CLAUDE.md y README.md  
✅ Git inicializado con primer commit

## 🚀 Roadmap de Desarrollo (En Orden)

### Fase 1: Integración Google Maps (CRÍTICA)

**Archivo**: `src/components/MapContainer.jsx`

1. Instancia Google Maps en el elemento `ref`
   - Centro inicial: Madrid (40.4168, -3.7038)
   - Zoom: 15
   - Tipo: SATELLITE

2. Cargar Google Maps API (en index.html o vía módulo)
   - Necesitas API key en `.env.local`
   - Librerias: Maps JS API, Drawing Library, Geometry Library

3. Herramienta de dibujo de polígonos
   - DrawingManager para capturar clics del usuario
   - Evento: `overlaycomplete` → guardar coords en estado

4. Herramienta de marcador para pozo
   - Drag & drop o clic doble en mapa
   - Guardar lat/lng en estado

**TODO Code**:
```jsx
// En MapContainer, useEffect():
const mapOptions = { 
  center: { lat: 40.4168, lng: -3.7038 },
  zoom: 15,
  mapTypeId: 'satellite'
}
const map = new window.google.maps.Map(mapRef.current, mapOptions)

// DrawingManager para polígonos
const drawingManager = new google.maps.drawing.DrawingManager({
  drawingMode: google.maps.drawing.OverlayType.POLYGON,
  drawingControl: true
})
drawingManager.setMap(map)

// Listener para capturar el polígono
google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {
  const coords = event.overlay.getPath().getArray()
  setParcela(coords)
})
```

---

### Fase 2: Conexión Algorithm ↔ UI

**Archivos**: `src/App.jsx`, `src/components/ControlPanel.jsx`

1. En `ControlPanel`, botón "Generar Layout":
   ```jsx
   const handleGenerate = () => {
     const { points, metricas } = generatePlantingGrid(
       parcela,
       pozo,
       config
     )
     setGrid(points)
     setMetricas(metricas)
   }
   ```

2. En `App.jsx`, observar cambios en `config` → regenerar grid automáticamente (opcional pero cool)
   ```jsx
   useEffect(() => {
     if (parcela && pozo) {
       const result = generatePlantingGrid(parcela, pozo, config)
       setGrid(result.points)
       setMetricas(result.metricas)
     }
   }, [config, parcela, pozo])
   ```

---

### Fase 3: Renderizar Grid en Mapa

**Archivo**: `src/components/MapContainer.jsx`

1. En useEffect, observar cambios en `grid` prop
2. Renderizar cada punto del grid como marcador/círculo pequeño verde
3. Dibujar líneas de tubería (opcional para MVP)

```jsx
useEffect(() => {
  if (!map || !grid) return
  
  grid.forEach(point => {
    new google.maps.Marker({
      position: { lat: point.geometry.coordinates[1], lng: point.geometry.coordinates[0] },
      map: map,
      icon: '🌱' // o imagen custom
    })
  })
}, [grid, map])
```

---

### Fase 4: Geocoding (Búsqueda)

**Archivo**: `src/components/ControlPanel.jsx`

En el input de búsqueda:
```jsx
const handleBusqueda = async () => {
  const geocoder = new google.maps.Geocoder()
  const result = await geocoder.geocode({ address: busqueda })
  if (result[0]) {
    map.setCenter(result[0].geometry.location)
    map.setZoom(15)
  }
}
```

---

### Fase 5: Exportación (Baja Prioridad MVP)

**Archivo**: Nuevo `src/utils/export.js`

Para MVP simple: usar `html2canvas` + jsPDF para screenshot PDF
Para futuro: exportar datos como CSV

---

## 📝 Checklist Antes de Comenzar

- [ ] API key de Google Maps obtenida y en `.env.local`
- [ ] `npm install` ejecutado sin errores
- [ ] `npm run dev` abre el navegador en http://localhost:3000
- [ ] Consola del navegador sin errores críticos

## 🔍 Testing del Algoritmo (Sin UI)

Puedes probar el algoritmo directamente en la consola:

```javascript
import { generatePlantingGrid } from './src/utils/geometry.js'

const testParcela = [
  [-3.7, 40.41], [-3.69, 40.41], [-3.69, 40.42], [-3.7, 40.42], [-3.7, 40.41]
]
const testPozo = [-3.695, 40.415]
const testConfig = { marcoHorizontal: 7, marcoVertical: 7, retranqueo: 5 }

const result = generatePlantingGrid(testParcela, testPozo, testConfig)
console.log(result)
```

## 📚 Documentación Referencia

- **CLAUDE.md**: Arquitectura completa y decisiones de diseño
- **README.md**: Setup y flujo de usuario
- **Turf.js Docs**: https://turfjs.org/
- **Google Maps API**: https://developers.google.com/maps/documentation

## ⚡ Tips de Desarrollo

1. **Hot reload**: Vite detecta cambios automáticamente
2. **DevTools**: Usa Chrome DevTools para inspeccionar estado de React
3. **Debugging**: Agrega `console.log` en los handlers para ver qué se pasa
4. **Performance**: El grid se regenera cada vez que config cambia — ojo si la parcela es enorme

---

**Pregunta al volver**: ¿Necesitas ayuda con algo específico o continuamos en orden?
