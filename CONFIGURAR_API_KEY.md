# ⚡ Configura tu Google Maps API Key (5 minutos)

## 🎯 El servidor está corriendo en http://localhost:3000
pero el mapa no funciona hasta que agregues tu API key.

---

## Paso 1: Obtén tu API Key

### Opción A: Si NO tienes Google Cloud Console configurado

1. Ve a https://console.cloud.google.com/
2. Haz clic en el selector de proyecto (arriba izquierda)
3. Haz clic en "+ NUEVO PROYECTO"
4. Nombre: `AgroFit` → Crear
5. Espera 1 minuto a que se cree
6. En el buscador superior, escribe: `Maps JavaScript API`
7. Haz clic en el resultado
8. Haz clic en el botón azul "HABILITAR"
9. Repite los pasos 6-8 para:
   - `Maps Drawing Library`
   - `Maps Geocoding API`
10. En el menú izquierdo, haz clic en "Credenciales"
11. Haz clic en "+ CREAR CREDENCIALES" (botón azul)
12. Selecciona "Clave de API"
13. **¡COPIA la clave que aparece!** (algo como: `AIzaSy...`)

### Opción B: Si YA tienes Google Cloud Console

1. Ve a https://console.cloud.google.com/
2. Selecciona tu proyecto "AgroFit"
3. Menú izquierdo → "Credenciales"
4. Busca tu API Key (o crea una nueva si no la encuentras)
5. Cópiala

---

## Paso 2: Pega tu clave en .env.local

1. Abre este archivo en tu editor:
   ```
   /Users/jorgelorenzo/Desktop/AgroFit/.env.local
   ```

2. Verás:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```

3. Reemplaza `YOUR_API_KEY_HERE` con tu clave real:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSy1234567890ABCDEFGHIJKLMNOP
   ```
   (sin comillas, sin espacios)

4. **Guarda el archivo** (Ctrl+S o Cmd+S)

---

## Paso 3: Recarga el navegador

1. Ve a http://localhost:3000
2. Recarga la página (Ctrl+R o Cmd+R)
3. **¡Deberías ver el mapa satélite!**

---

## ✅ Si funciona:

Deberías ver:
- Panel verde a la izquierda (controles)
- Mapa satélite a la derecha (centrado en Madrid)
- Cursor listo para dibujar

---

## ❌ Si NO funciona:

### Problema: "El mapa no aparece"
**Solución**: 
- Asegúrate que `.env.local` tiene la API key correcta
- Recarga la página (Ctrl+R)
- Abre DevTools (F12) → Console → busca errores rojos
- Si ves "Unauthorized" → tu API key no es válida

### Problema: "ERR_INVALID_ARG_VALUE"
**Solución**:
- La clave tiene espacios o caracteres especiales
- Copia/pega solo la clave, sin comillas

### Problema: "Google Maps is not initialized"
**Solución**:
- Espera 5-10 minutos después de habilitar la API
- Las APIs necesitan tiempo para activarse

---

## 🚀 Una vez que funcione:

1. **Dibuja un polígono**
   - Haz clicks en el mapa para crear una parcela
   - Cierra el polígono haciendo clic en el primer punto

2. **Marca el pozo**
   - Selecciona la herramienta de marcador (arriba del mapa)
   - Haz clic en el mapa donde está el agua

3. **¡MAGIA! 🎉**
   - Automáticamente ves:
   - Puntos verdes (plantas) en el mapa
   - Panel de resultados con: plantas, densidad, área

---

## 💡 Tips

- **API Key pública**: Es normal que sea pública. Protege solo tu proyecto en Google Cloud (configura restricciones por referer/IP si quieres)
- **Múltiples APIs**: Puedes usar la MISMA API key en otros proyectos
- **Testing**: Si ves el mapa pero no funcionan las herramientas de dibujo, probablemente falta la Drawing Library

---

## 📞 Soporte

Si algo más falla:
1. Abre DevTools: F12
2. Pestaña "Console"
3. Busca mensajes rojos
4. Cópialos y búscalos en SETUP_GUIDE.md

---

**¡Feliz diseño de layouts! 🌱**
