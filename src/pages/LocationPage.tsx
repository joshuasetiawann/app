import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { useAuthState } from '../state/AuthState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { CoupleMap } from '../components/shared/CoupleMap';
import {
  getLatestLocationPings,
  publishLocationPing,
  subscribeToLocationPings,
  type LocationPing,
} from '../services/authService';

type GeoStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'unavailable' | 'error';

function distanceKm(a: LocationPing | null, b: LocationPing | null) {
  if (!a || !b) return null;
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latDelta = radians(b.latitude - a.latitude);
  const lngDelta = radians(b.longitude - a.longitude);
  const startLat = radians(a.latitude);
  const endLat = radians(b.latitude);
  const h = Math.sin(latDelta / 2) ** 2
    + Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2;
  return 6_371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function relativeUpdate(value: string | null, now: number) {
  if (!value) return 'Belum ada';
  const seconds = Math.max(0, Math.floor((now - new Date(value).getTime()) / 1_000));
  if (seconds < 60) return `${seconds} dtk lalu`;
  if (seconds < 3_600) return `${Math.floor(seconds / 60)} mnt lalu`;
  return `${Math.floor(seconds / 3_600)} jam lalu`;
}

function locationError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return 'denied' as const;
  if (error.code === error.POSITION_UNAVAILABLE) return 'unavailable' as const;
  return 'error' as const;
}

export default function LocationPage() {
  const auth = useAuthState();
  const { locationOn, setLocation, toast } = useAppState();
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [mine, setMine] = useState<LocationPing | null>(null);
  const [partnerPing, setPartnerPing] = useState<LocationPing | null>(null);
  const [syncError, setSyncError] = useState('');
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const lastPublishRef = useRef(0);

  const refreshPings = useCallback(async () => {
    try {
      const latest = await getLatestLocationPings();
      setMine((current) => current ?? latest.mine);
      setPartnerPing(latest.partner);
      setSyncError('');
      setCurrentTime(Date.now());
      return true;
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Status lokasi belum bisa dimuat.');
      return false;
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refreshPings(), 0);
    const timer = window.setInterval(() => void refreshPings(), 15_000);
    const unsubscribe = auth.couple?.id
      ? subscribeToLocationPings(auth.couple.id, () => void refreshPings())
      : () => undefined;
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
      unsubscribe();
    };
  }, [auth.couple?.id, refreshPings]);

  useEffect(() => {
    if (!locationOn || !navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const next: LocationPing = {
          profileId: auth.profile?.id ?? '',
          coupleId: auth.couple?.id ?? '',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyM: position.coords.accuracy,
          speedKmh: position.coords.speed == null ? null : position.coords.speed * 3.6,
          recordedAt: new Date(position.timestamp).toISOString(),
        };
        setMine(next);
        setGeoStatus('ready');
        setCurrentTime(position.timestamp);
        if (Date.now() - lastPublishRef.current < 30_000) return;
        lastPublishRef.current = Date.now();
        void publishLocationPing(next)
          .then(() => refreshPings())
          .catch((error) => setSyncError(error instanceof Error ? error.message : 'Lokasi belum bisa dibagikan.'));
      },
      (error) => {
        setGeoStatus(locationError(error));
        setLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 12_000 },
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [auth.couple?.id, auth.profile?.id, locationOn, refreshPings, setLocation]);

  const distance = useMemo(() => distanceKm(mine, partnerPing), [mine, partnerPing]);
  const partnerFresh = !!partnerPing && currentTime - new Date(partnerPing.recordedAt).getTime() < 5 * 60_000;
  const partnerName = auth.partner?.name || 'Pasangan';

  const enableLocation = () => {
    setSyncError('');
    if (!navigator.geolocation) {
      setGeoStatus('unavailable');
      return;
    }
    setGeoStatus('requesting');
    setLocation(true);
    toast('Konfirmasi izin lokasi di perangkatmu 📍');
  };

  const disableLocation = () => {
    setGeoStatus('idle');
    setLocation(false);
    toast('Berbagi lokasi dihentikan 👻');
  };

  return (
    <ScrollColumn>
      <div style={pcss('border-radius:26px;overflow:hidden;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div className="kk-map-shell">
          <CoupleMap mine={mine} partner={partnerPing} me={auth.profile} partnerProfile={auth.partner} />
          {!mine && !partnerPing && (
            <div className="kk-map-empty">
              <span>📍</span>
              <strong>Peta siap dipakai</strong>
              <small>Nyalakan lokasi agar posisi kalian muncul di sini.</small>
            </div>
          )}
          <button
            type="button"
            className="kk-map-refresh"
            aria-label="Perbarui lokasi pasangan"
            onClick={() => void refreshPings().then((refreshed) => refreshed && toast('Status lokasi diperbarui'))}
          >
            ↻
          </button>
        </div>
        <div style={{ padding: '16px 17px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>{partnerPing ? `Lokasi ${partnerName}` : `Menunggu ${partnerName}`}</span>
            <span style={pcss(`font:700 10px 'Nunito',sans-serif;padding:4px 9px;border-radius:100px;color:${partnerFresh ? '#377452' : 'var(--mut,#A99A9E)'};background:${partnerFresh ? '#E4F5EB' : 'var(--sf2,#FFF4F1)'}`)}>
              {partnerFresh ? 'LIVE' : partnerPing ? 'TERAKHIR' : 'BELUM ADA'}
            </span>
          </div>
          <div className="kk-location-stats">
            {[
              ['JARAK', distance == null ? '—' : `${distance < 10 ? distance.toFixed(1) : Math.round(distance)} km`],
              ['KECEPATAN', partnerPing?.speedKmh == null ? '—' : `${partnerPing.speedKmh.toFixed(1)} km/j`],
              ['AKURASI', partnerPing?.accuracyM == null ? '—' : `±${Math.round(partnerPing.accuracyM)} m`],
              ['UPDATE', relativeUpdate(partnerPing?.recordedAt ?? null, currentTime)],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{label}</div>
                <div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:3px")}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:16px 17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <div>
            <div style={pcss("font:700 13.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Bagikan lokasi perangkat ini</div>
            <div style={pcss("font:600 10.5px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>
              {geoStatus === 'ready' ? `Aktif · akurasi ±${Math.round(mine?.accuracyM ?? 0)} m` : locationOn ? 'Meminta posisi dari perangkat…' : 'Mati · tidak ada posisi baru yang dikirim'}
            </div>
          </div>
          <button
            type="button"
            style={pcss(`width:48px;height:28px;border:0;border-radius:100px;cursor:pointer;padding:3px;display:flex;flex:none;justify-content:${locationOn ? 'flex-end' : 'flex-start'};background:${locationOn ? 'var(--pk,#FFB7B2)' : 'var(--ln,rgba(74,74,74,.16))'};transition:background .2s`)}
            onClick={locationOn ? disableLocation : enableLocation}
            aria-pressed={locationOn}
            aria-label="Bagikan lokasi"
          >
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.16)' }} />
          </button>
        </div>
        {mine && (
          <div style={pcss("margin-top:13px;padding:11px 13px;border-radius:14px;background:var(--sf2,#FFF4F1);font:600 10.5px/1.5 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>
            Posisi terakhir perangkatmu: {mine.latitude.toFixed(4)}, {mine.longitude.toFixed(4)} · {relativeUpdate(mine.recordedAt, currentTime)}
          </div>
        )}
      </div>

      {geoStatus !== 'ready' && (
        <div style={pcss('border-radius:22px;background:var(--sf2,#FFF4F1);border:1px dashed rgba(232,111,135,.4);padding:16px 17px')}>
          <div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Izin lokasi tetap di tanganmu 📍</div>
          <div style={pcss("font:600 11px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>
            {geoStatus === 'denied'
              ? 'Izin ditolak oleh perangkat. Aktifkan kembali dari pengaturan situs atau aplikasi bila kamu berubah pikiran.'
              : geoStatus === 'unavailable'
                ? 'Perangkat atau browser ini belum menyediakan posisi yang bisa dibaca.'
                : 'KisahKita baru membaca dan membagikan posisi setelah kamu menyalakan kontrol di atas.'}
          </div>
          {!locationOn && geoStatus !== 'unavailable' && (
            <button type="button" style={pcss("margin-top:13px;padding:10px 16px;border:0;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")} onClick={enableLocation}>
              Izinkan &amp; bagikan
            </button>
          )}
        </div>
      )}

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:16px 17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={pcss("font:700 13.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Status sinkronisasi</div>
        <div style={pcss("font:600 10.5px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:6px")}>
          Posisi hanya tersimpan di ruang pasanganmu. Saat Supabase aktif, kebijakan akses database membatasi data ini ke dua akun yang sudah terhubung; mode lokal menyimpannya hanya di perangkat ini.
        </div>
        {syncError && <div role="alert" style={pcss("margin-top:10px;font:700 10.5px/1.45 'Nunito',sans-serif;color:#B5485D")}>{syncError}</div>}
      </div>
    </ScrollColumn>
  );
}
