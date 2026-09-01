export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export function currentDeviceLocation(): Promise<GeoPoint> {
  if (!navigator.geolocation) return Promise.reject(new Error('This device does not provide location access.'));
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => reject(new Error(error.code === error.PERMISSION_DENIED
        ? 'Location permission is blocked. Enable it in device or site settings and try again.'
        : 'The device location could not be read. Check GPS and your internet connection, then try again.')),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 12_000 },
    );
  });
}

export function coordinateLabel(point: GeoPoint, prefix = 'GPS') {
  return `${prefix} · ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
}
