import { useEffect, useRef } from 'react';
import L, { type Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { AccountProfile, LocationPing } from '../../services/authService';

interface CoupleMapProps {
  mine: LocationPing | null;
  partner: LocationPing | null;
  me: AccountProfile | null;
  partnerProfile: AccountProfile | null;
}

function markerIcon(profile: AccountProfile | null, tone: 'pink' | 'blue') {
  if (profile?.avatarUrl) {
    return L.icon({
      iconUrl: profile.avatarUrl,
      iconSize: [46, 46],
      iconAnchor: [23, 46],
      popupAnchor: [0, -42],
      className: `kk-map-photo-marker kk-map-photo-marker--${tone}`,
    });
  }
  return L.divIcon({
    className: '',
    html: `<span class="kk-map-emoji-marker kk-map-emoji-marker--${tone}">${profile?.avatarEmoji || '🙂'}</span>`,
    iconSize: [46, 52],
    iconAnchor: [23, 48],
  });
}

export function CoupleMap({ mine, partner, me, partnerProfile }: CoupleMapProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;
    const map = L.map(elementRef.current, {
      center: [-6.2, 106.8167],
      zoom: 11,
      zoomControl: false,
      attributionControl: true,
    });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(elementRef.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) layer.remove();
    });
    const points: L.LatLngExpression[] = [];
    const addPerson = (ping: LocationPing | null, profile: AccountProfile | null, tone: 'pink' | 'blue', label: string) => {
      if (!ping) return;
      const point: L.LatLngExpression = [ping.latitude, ping.longitude];
      points.push(point);
      if (ping.accuracyM) {
        L.circle(point, { radius: ping.accuracyM, color: tone === 'pink' ? '#dc7189' : '#6687b0', weight: 1, fillOpacity: 0.09 }).addTo(map);
      }
      L.marker(point, { icon: markerIcon(profile, tone), keyboard: true, title: label })
        .addTo(map)
        .bindTooltip(label, { permanent: true, direction: 'bottom', offset: [0, 6], className: 'kk-map-label' });
    };
    addPerson(mine, me, 'pink', `${me?.name || 'You'} · your location`);
    addPerson(partner, partnerProfile, 'blue', `${partnerProfile?.name || 'Partner'} · partner location`);
    if (mine && partner) L.polyline([[mine.latitude, mine.longitude], [partner.latitude, partner.longitude]], { color: '#d66f87', weight: 3, opacity: 0.7, dashArray: '7 9' }).addTo(map);
    if (points.length === 1) map.flyTo(points[0], 15, { duration: 0.7 });
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [62, 62], maxZoom: 15, animate: true });
  }, [me, mine, partner, partnerProfile]);

  return <div ref={elementRef} className="kk-couple-map" aria-label="Map of you and your partner" />;
}
