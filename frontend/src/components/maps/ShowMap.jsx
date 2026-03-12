import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function ShowMap({ campground }) {
  const mapContainer = useRef(null)
  const mapRef       = useRef(null)

  useEffect(() => {
    if (!campground?.geometry?.coordinates) return
    if (mapRef.current) return

    const [lng, lat] = campground.geometry.coordinates

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [lng, lat],
      zoom: 10,
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    new mapboxgl.Marker({ color: '#2f6a47' })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<strong>${campground.title}</strong><br/><small>${campground.location}</small>`)
      )
      .addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [campground])

  return (
    <div
      ref={mapContainer}
      className="w-full h-64 rounded-2xl overflow-hidden shadow-card"
    />
  )
}
