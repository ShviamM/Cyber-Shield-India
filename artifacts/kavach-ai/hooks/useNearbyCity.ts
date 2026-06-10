import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

export type NearbyCityStatus = "loading" | "granted" | "denied" | "unavailable";

/**
 * Offline fallback only. When reverse geocoding is unavailable (no network or
 * no platform geocoder), the device location is snapped to the nearest of these
 * metros so the home screen still has a plausible city to show. Accurate
 * nationwide detection comes from `Location.reverseGeocodeAsync` below.
 */
const FALLBACK_CITIES: { city: string; lat: number; lng: number }[] = [
  { city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { city: "Delhi", lat: 28.6139, lng: 77.209 },
  { city: "Gurugram", lat: 28.4595, lng: 77.0266 },
  { city: "Noida", lat: 28.5355, lng: 77.391 },
  { city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { city: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { city: "Pune", lat: 18.5204, lng: 73.8567 },
  { city: "Chennai", lat: 13.0827, lng: 80.2707 },
  { city: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { city: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { city: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { city: "Kanpur", lat: 26.4499, lng: 80.3319 },
];

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function nearestCity(lat: number, lng: number): string {
  let best = FALLBACK_CITIES[0];
  let bestDist = Infinity;
  for (const c of FALLBACK_CITIES) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best.city;
}

/**
 * Detects the user's actual city and state from the device location, working
 * anywhere in India via reverse geocoding (not a fixed list of metros). Runs
 * automatically on mount; returns the detected city + state plus a
 * permission/loading status and a `retry` to ask again after a denial/failure.
 */
export function useNearbyCity() {
  const [city, setCity] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [status, setStatus] = useState<NearbyCityStatus>("loading");
  const [canAskAgain, setCanAskAgain] = useState(true);

  const detect = useCallback(async () => {
    setStatus("loading");
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setCanAskAgain(perm.canAskAgain);
        setStatus("denied");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      const { latitude, longitude } = pos.coords;

      // Resolve the real city + state for any location in India. The platform
      // geocoder needs network/Play services, so this can throw or come back
      // empty — in that case we fall back to the nearest known metro below.
      let resolvedCity: string | null = null;
      let resolvedState: string | null = null;
      try {
        const places = await Location.reverseGeocodeAsync({ latitude, longitude });
        const place = places[0];
        if (place) {
          resolvedCity = place.city || place.subregion || place.district || null;
          resolvedState = place.region || null;
        }
      } catch {
        // Geocoder unavailable — fall through to the offline nearest-metro match.
      }

      setCity(resolvedCity ?? nearestCity(latitude, longitude));
      setState(resolvedState);
      setStatus("granted");
    } catch {
      setStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  return { city, state, status, canAskAgain, retry: detect };
}
