# 📋 Auditoría de Configuraciones - AgroFit

## 1. VARIABLES DE AMBIENTE (.env)
```
VITE_GOOGLE_MAPS_API_KEY  → useGoogleMaps.js:18
```

---

## 2. CONFIGURACIÓN AGRÍCOLA (App.jsx)
Centralizada en `config` state, pero valores iniciales hardcodeados:
```javascript
const [config, setConfig] = useState({
  marcoHorizontal: 70,        // cm - Espaciamiento horizontal entre plantas
  marcoVertical: 70,          // cm - Espaciamiento vertical
  retranqueo: 50,             // cm - Margen desde bordes de parcela
  tipoRiego: 'goteo',         // goteo | aspersión | surcos
  cultivosSeleccionados: [],  // Array de crop IDs
  modoPlantacion: 'espaciamiento',  // espaciamiento | cantidad-fija
  cantidadesCultivos: {       // Quantities por cultivo
    tomate: 0, patata: 0, lechuga: 0, ...
  },
  plantingMode: 'puntos'      // puntos | surcos | filas_dobles | tresbolillo
})
```

**Problema:** Los valores por defecto son hardcodeados en App.jsx. No hay:
- Perfiles predefinidos (Horticultural, Extensivo, etc.)
- Presets guardables
- Validación de rangos
- Documentación de unidades

---

## 3. CONFIGURACIÓN DEL EDITOR DE DIBUJO (MapContainer.jsx)
Estados dispersos sin centralización:
```javascript
const [snapToGrid, setSnapToGrid] = useState(false)      // Línea 63
const [smoothCurves, setSmoothCurves] = useState(false)  // Línea 64
const [editorDrawingMode, setEditorDrawingMode] = useState('addPoints')  // Línea 65
```

Atajos de teclado hardcodeados en useEffect:
```javascript
// S = snap, C = curvas, I = insertar, Delete = eliminar, Ctrl+Z = undo
```

**Problema:** No hay un objeto centralizado de preferencias del editor.

---

## 4. CONSTANTES DE CULTIVOS (cropColors.js, cropCategories.js)
```javascript
// cropColors.js - Mapeo RGB de cada cultivo
tomate: '#E53935', lechuga: '#7CB342', ...

// cropCategories.js - Jerarquía de categorías
CROP_CATEGORIES = {
  hortalizas: { crops: ['tomate', 'lechuga', ...] },
  extensivo: { crops: ['trigo', 'maiz', ...] },
  ...
}
```

**Ubicación:** Bien organizado en utils/ pero sin:
- Metadatos adicionales (agua requerida, densidad recomendada)
- Compatibilidades entre cultivos
- Ciclos de cultivo

---

## 5. PARÁMETROS DE OBSTÁCULOS (obstacleHelpers.js)
```javascript
OBSTACLE_TYPES = {
  caseta: { radius: 1500, color: '#FF6B6B' },
  camino: { radius: 500, color: '#FFA500' },
  arbol: { radius: 400, color: '#228B22' },
  rocosa: { radius: 1000, color: '#A9A9A9' },
}
```

**Problema:** Radios de exclusión son constantes fijas, no configurables por usuario.

---

## 6. PARÁMETROS DE MAPA (MapContainer.jsx)
Hardcodeados en `initMap()`:
```javascript
center: { lat: 40.4168, lng: -3.7038 }  // Madrid (¿por qué Madrid?)
zoom: 15
mapTypeId: 'satellite'
```

**Problema:** No hay forma de cambiar el punto de partida del mapa ni preferencias de visualización.

---

## 7. PARÁMETROS DE GRID (geometry.js)
Valores mágicos esparcidos:
```javascript
snapToGridFn(coords, 5)  // Grid de 5 metros (línea 109, 173, 438)
generateSmoothCurve(newPoints)  // Sin parámetros de suavidad
```

---

## 8. PARÁMETROS DE MARCADORES (markerIconFactory.js)
Tamaños de iconos hardcodeados:
```javascript
scale: 12  (dragging)
scale: 10  (selected)
scale: 8   (hovered)
scale: 6   (default)
```

---

## ✅ LO QUE ESTÁ BIEN ORGANIZADO
- ✅ Colores de cultivos (cropColors.js)
- ✅ Categorías de cultivos (cropCategories.js)
- ✅ Tipos de obstáculos (obstacleHelpers.js)
- ✅ Comandos de dibujo (drawingCommands.js)

---

## 🔧 LO QUE NECESITA REORGANIZACIÓN

### Opción A: Config Centralizado en `src/config/`
```
src/config/
├── defaults.js          // Valores por defecto de todo
├── agricultural.js      // Perfiles agrícolas (Horticultural, Extensivo, etc.)
├── drawing.js           // Shortcuts, zoom levels, snap grid
├── map.js               // Centro inicial, tipo de mapa
├── obstacles.js         // Exportar desde obstacleHelpers
├── crops.js             // Exportar desde cropCategories + cropColors
└── ui.js                // Tamaños de iconos, colores UI
```

### Opción B: Mantener en utils/ pero añadir index.js
```
src/utils/
├── cropColors.js
├── cropCategories.js
├── obstacleHelpers.js
├── config.js (NUEVO) - re-export centralizado
└── index.js (NUEVO) - export * as config
```

---

## 📊 AUDITORÍA POR CRITICIDAD

| Ámbito | Estado | Criticidad | Usuarios Afectados |
|--------|--------|------------|--------------------|
| Config agrícola | Centralizado pero hardcodeado | ALTA | Agronomistas |
| Editor dibujo | Disperso | MEDIA | Dibujantes |
| Cultivos | Bien organizado | BAJA | Todos |
| Obstáculos | Bien organizado | MEDIA | Terreno |
| Mapa | Hardcodeado | ALTA | Internacionalización |
| Grid/Snap | Hardcodeado | MEDIA | Precisión |

---

## 🎯 PROPUESTA: PRIORIDADES

1. **URGENTE:** Crear `src/config/defaults.js` con valores iniciales por defecto
2. **IMPORTANTE:** Exportar constantes de obstáculos y cultivos desde config/
3. **NICE-TO-HAVE:** Crear perfiles agrícolas (Horticultural, Extensivo, Orgánico, etc.)
4. **FUTURE:** UI para cambiar configuraciones sin code
