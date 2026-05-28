import { useRef, useEffect, useState } from 'react'
import './MapContainer.css'

const MAP_STYLES = {
  container: {
    width: '100%',
    height: '100%'
  }
}

export default function MapContainer({ parcela, setParcela, pozo, setPozo, grid }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    // TODO: Initialize Google Map
    // - Load Google Maps API
    // - Set center to default municipality
    // - Enable satellite view
    // - Initialize drawing tools
  }, [])

  useEffect(() => {
    // TODO: Render parcela polygon on map
  }, [parcela])

  useEffect(() => {
    // TODO: Render grid points on map
  }, [grid])

  useEffect(() => {
    // TODO: Render pozo marker with exclusion radius
  }, [pozo])

  return <div ref={mapRef} style={MAP_STYLES.container} className="map-container" />
}
