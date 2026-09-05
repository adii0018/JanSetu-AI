import React, { useEffect, useRef, useState } from 'react';
import type { MapWard, GeoCluster } from '../../services/types';
import { ErrorState, Skeleton } from '../ui/ErrorState';
import { Layers, Compass, Zap, Flame } from 'lucide-react';
import { playTick } from '../../utils/sounds';

interface HotspotMapProps {
  data: MapWard[];
  geoClusters?: GeoCluster[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const CITY_PRESETS: { label: string; city: string; center?: [number, number]; zoom?: number }[] = [
  { label: 'All India 🇮🇳', city: 'ALL' },
  { label: 'Indore', city: 'Indore', center: [22.7196, 75.8577], zoom: 12 },
  { label: 'Delhi NCR', city: 'Delhi', center: [28.6315, 77.2167], zoom: 11 },
  { label: 'Mumbai', city: 'Mumbai', center: [19.0760, 72.8777], zoom: 11 },
  { label: 'Bengaluru', city: 'Bengaluru', center: [12.9716, 77.5946], zoom: 11 },
  { label: 'Lucknow', city: 'Lucknow', center: [26.8467, 80.9462], zoom: 12 },
  { label: 'Hyderabad', city: 'Hyderabad', center: [17.3850, 78.4867], zoom: 12 },
  { label: 'Jaipur', city: 'Jaipur', center: [26.9124, 75.7873], zoom: 12 },
  { label: 'Kolkata', city: 'Kolkata', center: [22.5726, 88.3639], zoom: 12 },
];

function urgencyColor(urgency: number): string {
  if (urgency >= 75) return '#C0392B'; // High Critical - Deep Red
  if (urgency >= 50) return '#D97706'; // Medium - Amber
  return 'var(--moss)'; // Low - Deep Moss
}

function bubbleRadius(count: number, maxCount: number): number {
  if (maxCount === 0) return 14;
  const min = 12;
  const max = 36;
  return min + ((count / maxCount) * (max - min));
}

export function HotspotMap({ data, geoClusters = [], loading, error, onRetry }: HotspotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  useEffect(() => {
    if (loading || error || data.length === 0) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapRef.current) return;

      // Fix default marker icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Safely destroy previous map instance
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }

      // Initialize map instance
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      leafletMap.current = map;

      // Clean, high-contrast tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Render DBSCAN AI Hotspot Density Overlays if available
      geoClusters.forEach((cluster) => {
        if (cluster.center_lat && cluster.center_lng) {
          L.circle([cluster.center_lat, cluster.center_lng], {
            radius: 3500, // 3.5 km DBSCAN radius
            color: '#C0392B',
            fillColor: '#E74C3C',
            fillOpacity: 0.18,
            weight: 1.5,
            dashArray: '4, 4',
          })
            .bindTooltip(
              `<div style="font-weight:700;font-size:0.78rem">🔥 ${cluster.name} (${cluster.total_wards} Wards DBSCAN Hotspot)</div>`,
              { permanent: false, direction: 'center' }
            )
            .addTo(map);
        }
      });

      // Render Ward Circle Markers
      const maxCount = Math.max(...data.map((w) => w.complaint_count), 1);
      const latLngList: [number, number][] = [];

      data.forEach((ward) => {
        if (ward.lat && ward.lng) {
          latLngList.push([ward.lat, ward.lng]);
          const radius = bubbleRadius(ward.complaint_count, maxCount);
          const color = urgencyColor(ward.avg_urgency);

          const circle = L.circleMarker([ward.lat, ward.lng], {
            radius,
            fillColor: color,
            fillOpacity: 0.82,
            color: '#FFFFFF',
            weight: 2.5,
          });

          const urgencyLabel =
            ward.avg_urgency >= 75 ? '🔴 Critical' : ward.avg_urgency >= 50 ? '🟡 Medium' : '🟢 Low';

          circle.bindPopup(
            `<div style="font-family:var(--font-body),sans-serif;min-width:180px;padding:4px">
              <div style="font-weight:700;font-size:1rem;color:#1F3A24;margin-bottom:6px">${ward.name}</div>
              <div style="font-size:0.84rem;color:#333;margin-bottom:4px">
                📋 <strong>${ward.complaint_count}</strong> Citizen Complaints
              </div>
              <div style="font-size:0.84rem;color:#333;margin-bottom:4px">
                ⚡ Avg Urgency: <strong>${ward.avg_urgency.toFixed(0)}/100</strong> (${urgencyLabel})
              </div>
              <div style="font-size:0.75rem;color:#666;margin-top:6px;border-top:1px solid #E5E7EB;padding-top:6px">
                Infra Index: ${ward.infra_index}/100 · Budget: ${ward.budget_index}/100
              </div>
            </div>`,
            { maxWidth: 240 }
          );

          circle.addTo(map);

          // Ward name label overlay
          L.tooltip({
            permanent: true,
            direction: 'top',
            className: 'ward-label',
            offset: [0, -radius - 2],
          })
            .setContent(`<span style="font-size:0.72rem;font-weight:700;color:#1F3A24;background:#FFFFFF;padding:2px 6px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.12)">${ward.name}</span>`)
            .setLatLng([ward.lat, ward.lng])
            .addTo(map);
        }
      });

      // Fit bounds to cover all wards across India smoothly
      if (latLngList.length > 0) {
        const bounds = L.latLngBounds(latLngList);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }

      // Fix tile loading delay timing issue
      setTimeout(() => {
        if (leafletMap.current) {
          leafletMap.current.invalidateSize();
        }
      }, 200);
    });

    return () => {
      isMounted = false;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [data, geoClusters, loading, error]);

  // Handle City Region Quick Fly
  const handleCitySelect = (cityObj: (typeof CITY_PRESETS)[0]) => {
    playTick();
    setSelectedCity(cityObj.city);

    if (!leafletMap.current) return;

    if (cityObj.city === 'ALL') {
      const L = (window as any).L;
      const validWards = data.filter((w) => w.lat && w.lng);
      if (validWards.length > 0 && L) {
        const bounds = L.latLngBounds(validWards.map((w) => [w.lat, w.lng]));
        leafletMap.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    } else if (cityObj.center) {
      leafletMap.current.flyTo(cityObj.center, cityObj.zoom || 12, { animate: true, duration: 1.4 });
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', borderRadius: 16 }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={20} color="var(--deep-moss)" />
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', margin: 0 }}>
                🗺️ Pan-India Civic Demand & DBSCAN Hotspot Map
              </h2>
            </div>
            <p style={{ fontSize: '0.78125rem', color: 'var(--ink-soft)', margin: '2px 0 0' }}>
              Real-time spatial density circles (DBSCAN ML Engine) · Bubble size = demand · Color = urgency
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C0392B' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 600 }}>High (≥75)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 600 }}>Medium (50-74)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--moss)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 600 }}>Low (&lt;50)</span>
            </div>
          </div>
        </div>

        {/* City Quick-Fly Bar */}
        {!loading && !error && data.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {CITY_PRESETS.map((preset) => {
              const active = selectedCity === preset.city;
              return (
                <button
                  key={preset.city}
                  onClick={() => handleCitySelect(preset)}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.75rem',
                    borderRadius: 20,
                    border: active ? '1.5px solid var(--deep-moss)' : '1px solid var(--border)',
                    background: active ? 'var(--deep-moss)' : 'var(--leaf-pale)',
                    color: active ? '#FFFFFF' : 'var(--ink)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Map Content */}
      {loading && <Skeleton height={420} style={{ borderRadius: 0 }} />}
      {error && (
        <div style={{ padding: '2rem' }}>
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-soft)' }}>
          No location data available.
        </div>
      )}
      {!loading && !error && data.length > 0 && (
        <>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>{`
            .leaflet-container { font-family: var(--font-body), sans-serif; background: #F8FAFC; }
            .ward-label { background: transparent !important; border: none !important; box-shadow: none !important; }
            .ward-label::before { display: none !important; }
          `}</style>
          <div
            ref={mapRef}
            style={{ height: 420, width: '100%', zIndex: 1 }}
            aria-label="Interactive Pan-India Hotspot Map"
          />
        </>
      )}
    </div>
  );
}
