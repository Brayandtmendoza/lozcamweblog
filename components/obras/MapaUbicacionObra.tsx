'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { toast } from 'sonner'
import { Navigation } from 'lucide-react'

// SVG pin con color de marca — no requiere imágenes externas ni API key
const MARKER_ICON = L.divIcon({
  className: '',
  html: `<svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 7.9 10.7 21.8 11.2 22.4.2.4.5.6.8.6s.6-.2.8-.6C13.3 33.8 24 19.9 24 12 24 5.4 18.6 0 12 0z" fill="#1E6FBF" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
})

const DEFAULT_CENTER: [number, number] = [-12.0653, -75.2049] // Huancayo, Perú
const DEFAULT_ZOOM = 13

interface Props {
  value: { lat: number | null; lng: number | null }
  onChange: (lat: number, lng: number) => void
}

function createMarker(
  map: L.Map,
  lat: number,
  lng: number,
  onDragEnd: (lat: number, lng: number) => void,
): L.Marker {
  const marker = L.marker([lat, lng], { icon: MARKER_ICON, draggable: true })
  marker.on('dragend', () => {
    const latlng = marker.getLatLng()
    onDragEnd(latlng.lat, latlng.lng)
  })
  return marker.addTo(map)
}

export default function MapaUbicacionObra({ value, onChange }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<L.Map | null>(null)
  const markerRef     = useRef<L.Marker | null>(null)
  // Ref para onChange — el closure del mapa siempre accede a la versión más reciente
  const onChangeRef   = useRef(onChange)
  const initValueRef  = useRef(value) // valor inicial, solo se lee en Effect 1

  useEffect(() => { onChangeRef.current = onChange })

  // ── Effect 1: inicializar el mapa UNA sola vez ───────────────────────────
  // La limpieza (map.remove()) garantiza que StrictMode pueda re-montar sin
  // lanzar "Map container is already initialized".
  useEffect(() => {
    if (!containerRef.current) return

    const iv = initValueRef.current
    const hasInitial = iv.lat != null && iv.lng != null
    const center: [number, number] = hasInitial
      ? [iv.lat!, iv.lng!]
      : DEFAULT_CENTER

    const map = L.map(containerRef.current, {
      center,
      zoom: hasInitial ? 16 : DEFAULT_ZOOM,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Clic en el mapa → mover/crear pin y notificar al padre
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      onChangeRef.current(lat, lng)
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = createMarker(map, lat, lng, (la, ln) =>
          onChangeRef.current(la, ln),
        )
      }
    })

    mapRef.current = map

    // Cleanup: destruye el mapa al desmontar y limpia los refs
    return () => {
      map.remove()
      mapRef.current  = null
      markerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 2: sincronizar el marcador cuando el prop value cambia ─────────
  // Cubre el caso de geolocalización (padre actualiza value desde fuera del mapa)
  // y la precarga en editar (coords iniciales desde la DB).
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (value.lat == null || value.lng == null) {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      return
    }

    const pos: [number, number] = [value.lat, value.lng]

    if (markerRef.current) {
      markerRef.current.setLatLng(pos)
    } else {
      markerRef.current = createMarker(map, value.lat, value.lng, (la, ln) =>
        onChangeRef.current(la, ln),
      )
    }
  }, [value.lat, value.lng])

  // ── Geolocalización ──────────────────────────────────────────────────────
  function handleGeolocate() {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChangeRef.current(coords.latitude, coords.longitude)
        // Pan inmediato vía ref; Effect 2 pondrá el marcador
        mapRef.current?.setView([coords.latitude, coords.longitude], 16, { animate: true })
      },
      () => {
        toast.error('No se pudo obtener tu ubicación. Verifica los permisos del navegador.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const hasCoords = value.lat != null && value.lng != null

  return (
    <div>
      {/* Leaflet se monta directamente en este div — sin children */}
      <div
        ref={containerRef}
        style={{
          border: '1px solid var(--card-border)',
          borderRadius: 8,
          overflow: 'hidden',
          height: 300,
        }}
      />

      <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGeolocate}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--card-border)',
            color: 'var(--text-primary)',
          }}
        >
          <Navigation size={13} />
          Usar mi ubicación actual
        </button>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {hasCoords
            ? `Lat: ${value.lat!.toFixed(6)}, Lng: ${value.lng!.toFixed(6)}`
            : 'Haz clic en el mapa para fijar la ubicación'}
        </p>
      </div>
    </div>
  )
}
