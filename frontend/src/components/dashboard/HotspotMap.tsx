import React, { useEffect, useRef } from 'react';
import type { MapWard } from '../../services/types';
import { ErrorState, Skeleton } from '../ui/ErrorState';

interface HotspotMapProps {
  data: MapWard[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/** Returns a color based on avg urgency (0–100) */
function urgencyColor(urgency: number): string {
  if (urgency >= 75) return '#d64545'; // coral — high
  if (urgency >= 50) return '#e8a33d'; // saffron — medium
  return '#1f8a70'; // teal — low
}

/** Returns a radius in pixels scaled to complaint count */
function bubbleRadius(count: number, maxCount: number): number {
  if (maxCount === 0) return 16;
  const min = 14;
  const max = 48;
  return min + ((count / maxCount) * (max - min));
}

export function HotspotMap({ data, loading, error, onRetry }: HotspotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    if (loading || error || data.length === 0) return;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      // Destroy existing map instance if re-rendering
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }

      // Centre the map on the mean lat/lng of all wards
      const avgLat = data.reduce((s, w) => s + w.lat, 0) / data.length;
      const avgLng = data.reduce((s, w) => s + w.lng, 0) / data.length;

      const map = L.map(mapRef.current, {
        center: [avgLat, avgLng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      leafletMap.current = map;

      // OpenStreetMap tiles — completely free
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const maxCount = Math.max(...data.map((w) => w.complaint_count), 1);

      data.forEach((ward) => {
        const radius = bubbleRadius(ward.complaint_count, maxCount);
        const color = urgencyColor(ward.avg_urgency);

        const circle = L.circleMarker([ward.lat, ward.lng], {
          radius,
          fillColor: color,
          fillOpacity: 0.75,
          color: '#fff',
          weight: 2,
        });

        const urgencyLabel =
          ward.avg_urgency >= 75 ? '🔴 High' :
          ward.avg_urgency >= 50 ? '🟡 Medium' : '🟢 Low';

        circle.bindPopup(
          `<div style="font-family:Inter,sans-serif;min-width:160px">
            <div style="font-weight:700;font-size:1rem;margin-bottom:6px">${ward.name}</div>
            <div style="font-size:0.85rem;color:#555;margin-bottom:4px">
              📋 <strong>${ward.complaint_count}</strong> complaints
            </div>
            <div style="font-size:0.85rem;color:#555;margin-bottom:4px">
              ⚡ Avg urgency: <strong>${ward.avg_urgency.toFixed(0)}/100</strong> ${urgencyLabel}
            </div>
            <div style="font-size:0.8rem;color:#888;margin-top:6px;border-top:1px solid #eee;padding-top:6px">
              Infra index: ${ward.infra_index} · Budget: ${ward.budget_index}
            </div>
          </div>`,
          { maxWidth: 220 }
        );

        circle.addTo(map);

        // Add ward label
        L.tooltip({
          permanent: true,
          direction: 'top',
          className: 'ward-label',
          offset: [0, -radius - 2],
        })
          .setContent(`<span style="font-size:0.7rem;font-weight:600;color:#1b2340">${ward.name}</span>`)
          .setLatLng([ward.lat, ward.lng])
          .addTo(map);
      });
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [data, loading, error]);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid var(--line)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.2rem' }}>
          🗺️ Complaint Hotspot Map
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
          Bubble size = complaint count · Color = urgency level
        </p>
        {/* Legend */}
        {!loading && !error && data.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { color: '#d64545', label: 'High urgency (≥75)' },
              { color: '#e8a33d', label: 'Medium (50–74)' },
              { color: '#1f8a70', label: 'Low (<50)' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.15)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map area */}
      {loading && <Skeleton height={380} style={{ borderRadius: 0 }} />}
      {error && (
        <div style={{ padding: '1.5rem' }}>
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
          No ward location data available yet.
        </div>
      )}
      {!loading && !error && data.length > 0 && (
        <>
          {/* Inject leaflet CSS */}
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />
          <style>{`
            .leaflet-container { font-family: Inter, sans-serif; }
            .ward-label { background: transparent !important; border: none !important; box-shadow: none !important; }
            .ward-label::before { display: none !important; }
          `}</style>
          <div
            ref={mapRef}
            style={{ height: 380, width: '100%', zIndex: 0 }}
            aria-label="Complaint hotspot map showing ward-level complaint density"
          />
        </>
      )}
    </div>
  );
}
