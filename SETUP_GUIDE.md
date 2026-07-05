# 🚀 Setup Rápido - AgroPlan MVP

## Paso 1: Obtener Google Maps API Key (5 min)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. **Crea un proyecto nuevo** (si no lo has hecho):
   - Click en "Selecciona un proyecto" (arriba izquierda)
   - Click en "Nuevo proyecto"
   - Nombre: "AgroPlan"
   - Click en "Crear"

3. **Habilita APIs necesarias**:
   - En la barra de búsqueda, busca: **"Maps JavaScript API"**
   - Click en el resultado → Click en "Habilitar"
   - Vuelve atrás, busca: **"Maps Drawing Library"** → Habilitar
   - Busca: **"Maps Geocoding API"** → Habilitar

4. **Obtén la API Key**:
   - Menu izquierdo → Click en "Credenciales"
   - Click en botón azul "+ Crear credenciales"
   - Selecciona "Clave de API"
   - Se genera una clave automáticamente
   - **CÓPIALA** (verás algo como: `AIzaSy...`)

## Paso 2: Configurar tu proyecto local

```bash
# 1. Navega a la carpeta
cd /Users/jorgelorenzo/Desktop/AgroPlan

# 2. Abre el archivo .env.local (ya existe)
# Reemplaza: YOUR_API_KEY_HERE
# Con tu clave real que copiaste

# En .env.local debe quedar:
# VITE_GOOGLE_MAPS_API_KEY=AIzaSy...tu_clave_aqui...

# 3. Instala dependencias
npm install

# 4. Inicia el servidor
npm run dev
```

## Paso 3: Probar la app

1. Se abrirá automáticamente en **http://localhost:3000**
2. Deberías ver:
   - Panel verde a la izquierda (ControlPanel)
   - Mapa satélite a la derecha (MapContainer)

3. **Dibuja una parcela**:
   - Haz clicks en el mapa para crear polígono
   - Termina haciendo clic en el primer punto (cierra el polígono)

4. **Marca el pozo**:
   - Selecciona herramienta de marcador
   - Haz clic en el mapa para poner marcador azul

5. **Genera layout**:
   - Cambia los valores en el panel (Marco 7×7, Retranqueo 5m)
   - Verás que se generan automáticamente los puntos verdes
   - Panel de resultados aparecerá abajo a la derecha

## Solución de Problemas

### "Cannot read property 'maps' of undefined"
- La API key no está configurada correctamente
- Asegúrate que `.env.local` tiene la clave correcta
- Reinicia el servidor: `npm run dev`

### Mapa no carga
- Comprueba que Google Maps API está habilitada en Cloud Console
- Espera 5 minutos después de habilitar la API
- Limpia cache del navegador: Ctrl+Shift+Del

### "OVER_QUERY_LIMIT"
- Has dibujado demasiados puntos. El algoritmo está generando un grid muy denso
- Aumenta el marco (ej. 10×10 en lugar de 5×5)
- O reduce el tamaño de la parcela

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `.env.local` | Tu API key va aquí |
| `src/components/MapContainer.jsx` | Google Maps + drawing tools |
| `src/components/ControlPanel.jsx` | UI inputs y botones |
| `src/components/MetricsPanel.jsx` | Resultados en vivo |
| `src/utils/geometry.js` | Algoritmo geométrico (Turf.js) |
| `src/App.jsx` | State management |

## Próximos Pasos

Una vez que funcione:
1. ✅ Fase 1: Google Maps integration (ya está hecha)
2. ✅ Fase 2: Algoritmo ↔ UI (ya está hecha)
3. Fase 3: Exportación PDF/PNG (opcional)
4. Fase 4: Mejoras de UX (búsqueda, etc.)

## Tips de Desarrollo

```bash
# Ver logs en tiempo real
npm run dev

# Lint el código
npm run lint

# Build para producción
npm run build
```

## Support

Si algo no funciona:
1. Abre la consola del navegador: F12 → Console
2. Busca mensajes de error rojo
3. Copia el error y búscalo en CLAUDE.md

---

**¡Listo!** AgroPlan está completo. Disfruta el "wow moment" al generar tu primer layout. 🌱
