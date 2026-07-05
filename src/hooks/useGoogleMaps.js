import { useEffect } from 'react'

let googleMapsLoaded = false

// Hook para cargar Google Maps API
export function useGoogleMaps() {
  useEffect(() => {
    // Si ya está cargado o se está cargando, no hacer nada
    if (window.google && window.google.maps) {
      return
    }

    if (googleMapsLoaded) {
      return
    }

    // Obtener API key del .env.local
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error('❌ Google Maps API key no configurada')
      if (import.meta.env.MODE === 'development') {
        console.error('Para desarrollo local:')
        console.error('  1. Crea .env.local en la raíz del proyecto')
        console.error('  2. Añade: VITE_GOOGLE_MAPS_API_KEY=tu_clave_aqui')
      } else {
        console.error('Para producción (Vercel):')
        console.error('  Añade VITE_GOOGLE_MAPS_API_KEY a Vercel Environment Variables')
      }
      return
    }

    // Marcar como que se está cargando para evitar cargas múltiples
    googleMapsLoaded = true

    // Crear script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing&language=es&loading=async`
    script.async = true

    script.onload = () => {
      console.log('✅ Google Maps API cargada')
    }

    script.onerror = () => {
      console.error('❌ Error cargando Google Maps API')
      console.error('Verifica tu API key')
      googleMapsLoaded = false
    }

    document.head.appendChild(script)

    return () => {
      // Limpiar si es necesario
    }
  }, [])
}
