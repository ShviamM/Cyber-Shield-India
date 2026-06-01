import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

export type NearbyCityStatus = "loading" | "granted" | "denied" | "unavailable";

/**
 * Known metro areas we have scam data for, with approximate centroids. The
 * device location is matched to the nearest of these so the home screen always
 * has data to show for the detected city.
 */
const KNOWN_CITIES: { city: string; lat: number; lng: number }[] = [
  { city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { city: "Delhi NCR", lat: 28.6139, lng: 77.209 },
  { city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { city: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { city: "Pune", lat: 18.5204, lng: 73.8567 },
  { city: "Chennai", lat: 13.0827, lng: 80.2707 },
  { city: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { city: "Kanpur", lat: 26.4499, lng: 80.3319 },
  { city: "Lucknow", lat: 26.8467, lng: 80.9462 },
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
  let best = KNOWN_CITIES[0];
  let bestDist = Infinity;
  for (const c of KNOWN_CITIES) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best.city;
}

/**
 * Detects the user's nearest supported city from the device location. Runs
 * automatically on mount; returns the detected city plus a permission/loading
 * status and a `retry` to ask again after a denial or failure.
 */
export function useNearbyCity() {
  const [city, setCity] = useState<string | null>(null);
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
      setCity(nearestCity(pos.coords.latitude, pos.coords.longitude));
      setStatus("granted");
    } catch {
      setStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  return { city, status, canAskAgain, retry: detect };
}
