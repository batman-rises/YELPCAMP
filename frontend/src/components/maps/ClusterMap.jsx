import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function ClusterMap({ geoJSON }) {
  const mapContainer = useRef(null)
  const mapRef       = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [78.9629, 20.5937],
      zoom: 4,
      maxBounds: [[60, 5], [100, 38]],
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    mapRef.current.on('load', () => {
      mapRef.current.addSource('campgrounds', {
        type: 'geojson',
        data: geoJSON,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      mapRef.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#3d8459', 10, '#2f6a47', 30, '#1d3827'],
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      mapRef.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      })

      mapRef.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#c9ad7e',
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      // Click cluster → zoom in
      mapRef.current.on('click', 'clusters', (e) => {
        const features  = mapRef.current.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        const clusterId = features[0].properties.cluster_id
        mapRef.current.getSource('campgrounds').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          mapRef.current.easeTo({ center: features[0].geometry.coordinates, zoom: Math.max(zoom, 6) })
        })
      })

      // Click point → popup
      mapRef.current.on('click', 'unclustered-point', (e) => {
        const { popUpMarkup } = e.features[0].properties
        const coordinates    = e.features[0].geometry.coordinates.slice()
        new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setLngLat(coordinates)
          .setHTML(popUpMarkup)
          .addTo(mapRef.current)
      })

      mapRef.current.on('mouseenter', 'clusters', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer'
      })
      mapRef.current.on('mouseleave', 'clusters', () => {
        mapRef.current.getCanvas().style.cursor = ''
      })
      mapRef.current.on('mouseenter', 'unclustered-point', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer'
      })
      mapRef.current.on('mouseleave', 'unclustered-point', () => {
        mapRef.current.getCanvas().style.cursor = ''
      })
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update data when geoJSON changes
  useEffect(() => {
    if (!mapRef.current || !geoJSON) return
    const src = mapRef.current.getSource('campgrounds')
    if (src) src.setData(geoJSON)
  }, [geoJSON])

  return (
    <div
      ref={mapContainer}
      className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-card"
    />
  )
}
