import { useEffect, useRef } from 'react';
import L, { type LayerGroup, type Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place } from '../../types';

export interface MapPoint { latitude: number; longitude: number }

export function PlaceMap({
  places,
  selectedId,
  draftPoint,
  picking = false,
  onSelect,
  onPick,
}: {
  places: Place[];
  selectedId: string | null;
  draftPoint?: MapPoint | null;
  picking?: boolean;
  onSelect: (id: string) => void;
  onPick?: (point: MapPoint) => void;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);
  const onPickRef = useRef(onPick);

  useEffect(() => { onPickRef.current = onPick; }, [onPick]);

  useEffect(() => {
    if (!elementRef.current) return;
    const map = L.map(elementRef.current, { center: [-6.2, 106.8167], zoom: 11, zoomControl: false });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    const click = (event: L.LeafletMouseEvent) => onPickRef.current?.({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    map.on('click', click);
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(elementRef.current);
    return () => {
      observer.disconnect();
      map.off('click', click);
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const points: L.LatLngExpression[] = [];
    for (const place of places) {
      if (place.latitude == null || place.longitude == null) continue;
      const point: L.LatLngExpression = [place.latitude, place.longitude];
      points.push(point);
      const icon = L.divIcon({
        className: '',
        html: `<span class="kk-place-marker${selectedId === place.id ? ' is-selected' : ''}"><span>${place.icon}</span></span>`,
        iconSize: [42, 48],
        iconAnchor: [21, 44],
      });
      L.marker(point, { icon, title: place.title, keyboard: true })
        .addTo(layer)
        .bindTooltip(place.title, { direction: 'top' })
        .on('click', () => onSelect(place.id));
    }
    if (draftPoint) {
      const point: L.LatLngExpression = [draftPoint.latitude, draftPoint.longitude];
      points.push(point);
      L.circleMarker(point, { radius: 10, color: '#c95270', fillColor: '#ffb7c3', fillOpacity: 0.9, weight: 3 })
        .addTo(layer)
        .bindTooltip('Selected location', { permanent: true, direction: 'top' });
    }
    if (points.length === 1) map.flyTo(points[0], 15, { duration: 0.6 });
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [42, 42], maxZoom: 15, animate: true });
  }, [draftPoint, places, selectedId, onSelect]);

  return <div ref={elementRef} className={`kk-place-map${picking ? ' is-picking' : ''}`} aria-label={picking ? 'Location picker map, tap to choose' : 'Shared places map'} />;
}
