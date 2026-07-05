# 🗺️ Google Maps Setup Guide

## El Problema: Google Maps no aparece en Vercel

**Causa:** El archivo `.env.local` no se sube a GitHub ni a Vercel. La API key está solo en tu máquina local.

---

## ✅ Solución CORRECTA para Vercel

### Paso 1: Añade la API key a Vercel
1. Ve a [Vercel Project Settings](https://vercel.com/dashboard)
2. Selecciona tu proyecto `agrofit`
3. Ir a **Settings** → **Environment Variables**
4. Añade una nueva variable:
   ```
   Name:  VITE_GOOGLE_MAPS_API_KEY
   Value: AIzaSyBx6IbZfGeo85krBKl8DNSTcqH1bRE9GLk
   ```
5. Selecciona **Production** (o Production + Preview si quieres probar antes)
6. Click **Save**

### Paso 2: Redeploy
- Vercel redeploy automáticamente, O
- Ejecuta: `vercel deploy --prod` localmente

---

## ⚠️ PROBLEMAS DE SEGURIDAD

Tu API key está **expuesta** en:
1. GitHub (publico en repositorio)
2. Código fuente (visible al inspeccionar browser)

### Cómo Protegerla

**Opción A: Restricciones en Google Cloud Console (RECOMENDADO)**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Click en tu API key
5. En **Application restrictions** selecciona **HTTP referrers (web sites)**
6. Añade tus dominios:
   ```
   https://tudominio.vercel.app/*
   https://localhost:3000/*
   ```
7. En **API restrictions** selecciona solo:
   - ✅ Maps JavaScript API
   - ✅ Maps Embed API
   - ❌ (deshabilita el resto)

**Opción B: Server-side API Gateway (MÁXIMA SEGURIDAD)**
- Crear un endpoint en Node/Vercel que valide la request antes de pasar a Google Maps
- No exponer la API key en el frontend

---

## 🔍 Cómo Debuggear

Si Google Maps aún no carga en Vercel:

1. **Abre Console en Vercel** (F12 → Console):
   ```javascript
   console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
   // Debe mostrar tu API key, no undefined
   ```

2. **Verifica que la variable está configurada:**
   ```bash
   vercel env list
   ```

3. **Comprueba errores en network:**
   - Network tab → busca `maps.googleapis.com`
   - Si hay 403/401, es problema de API key
   - Si hay 404, es un typo en la URL

---

## 📋 Checklist

- [ ] Tengo una API key de Google Maps válida
- [ ] La API key está añadida en Vercel Environment Variables
- [ ] La API key tiene HTTP referrer restrictions configuradas
- [ ] Vercel ha hecho re-deploy después de añadir la variable
- [ ] Google Maps aparece en `https://tudominio.vercel.app`

---

## Alternativa: .env.production.local (NO RECOMENDADO)

Si quieres que funcione sin Vercel Environment Variables:
```
.env.production.local
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBx6IbZfGeo85krBKl8DNSTcqH1bRE9GLk
```

**Pero NUNCA pushees esto a GitHub.** Añade a `.gitignore`:
```
.env.local
.env.production.local
.env.*.local
```

---

## Estado Actual de Seguridad

| Item | Estado | Action |
|------|--------|--------|
| API key en `.env.local` | ✅ | Verificar si está en `.gitignore` |
| API key en `.env.example` | ✅ Placeholder | OK - no contiene clave real |
| API key en código fuente | ⚠️ Línea 20 | Remover valor de test |
| API key en Vercel env vars | ❌ MISSING | **ADD IMMEDIATELY** |
| Google Cloud restrictions | ❌ MISSING | **CONFIGURE** |

---

## Próximos Pasos

1. **YA:** Añade API key a Vercel
2. **HOY:** Configura HTTP referrer restrictions en Google Cloud
3. **PRONTO:** Considera regenerar la API key si la actual fue expuesta públicamente
