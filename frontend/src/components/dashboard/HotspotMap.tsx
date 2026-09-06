import React, { useEffect, useRef, useState } from 'react';
import type { MapWard, GeoCluster } from '../../services/types';
import { ErrorState, Skeleton } from '../ui/ErrorState';
import {
  Layers,
  Compass,
  Zap,
  Flame,
  MapPin,
  Sparkles,
  Search,
  Moon,
  Sun,
  Globe,
  X,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
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
  { label: 'Mumbai', city: 'Mumbai', center: [19.076, 72.8777], zoom: 11 },
  { label: 'Bengaluru', city: 'Bengaluru', center: [12.9716, 77.5946], zoom: 11 },
  { label: 'Lucknow', city: 'Lucknow', center: [26.8467, 80.9462], zoom: 12 },
  { label: 'Hyderabad', city: 'Hyderabad', center: [17.385, 78.4867], zoom: 12 },
  { label: 'Jaipur', city: 'Jaipur', center: [26.9124, 75.7873], zoom: 12 },
  { label: 'Kolkata', city: 'Kolkata', center: [22.5726, 88.3639], zoom: 12 },
  { label: 'Pune', city: 'Pune', center: [18.5204, 73.8567], zoom: 12 },
  { label: 'Ahmedabad', city: 'Ahmedabad', center: [23.0225, 72.5714], zoom: 12 },
];

type MapStyleKey = 'voyager' | 'dark' | 'satellite';

const TILE_LAYERS: Record<MapStyleKey, { url: string; subdomains: string; maxZoom: number }> = {
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: '',
    maxZoom: 18,
  },
};

function urgencyColor(urgency: number): string {
  if (urgency >= 75) return '#EF4444'; // Critical - Crimson Red
  if (urgency >= 50) return '#F59E0B'; // Medium - Amber Orange
  return '#10B981'; // Low - Emerald Green
}

function bubbleRadius(count: number, maxCount: number): number {
  if (maxCount === 0) return 14;
  const min = 14;
  const max = 38;
  return min + (count / maxCount) * (max - min);
}

export function HotspotMap({ data, geoClusters = [], loading, error, onRetry }: HotspotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICAL' | 'MEDIUM' | 'LOW'>('ALL');
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('voyager');
  const [selectedWardDetails, setSelectedWardDetails] = useState<MapWard | null>(null);

  const criticalCount = data.filter((w) => w.avg_urgency >= 75).length;
  const mediumCount = data.filter((w) => w.avg_urgency >= 50 && w.avg_urgency < 75).length;
  const lowCount = data.filter((w) => w.avg_urgency < 50).length;

  // Filtered wards based on search and urgency chip
  const filteredWards = data.filter((ward) => {
    const matchesSearch = searchQuery === '' || ward.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency =
      urgencyFilter === 'ALL' ||
      (urgencyFilter === 'CRITICAL' && ward.avg_urgency >= 75) ||
      (urgencyFilter === 'MEDIUM' && ward.avg_urgency >= 50 && ward.avg_urgency < 75) ||
      (urgencyFilter === 'LOW' && ward.avg_urgency < 50);

    return matchesSearch && matchesUrgency;
  });

  // Handle Tile Layer Switch dynamically
  useEffect(() => {
    if (tileLayerRef.current && leafletMap.current) {
      const config = TILE_LAYERS[mapStyle];
      tileLayerRef.current.setUrl(config.url);
    }
  }, [mapStyle]);

  // Main Leaflet Map Initialization and Layer updates
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
        markersRef.current = [];
      }

      // Initialize map instance
      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      leafletMap.current = map;

      // Zoom Control
      L.control.zoom({ position: 'topleft' }).addTo(map);

      // Tile Layer
      const config = TILE_LAYERS[mapStyle];
      const tileLayer = L.tileLayer(config.url, {
        maxZoom: config.maxZoom,
        subdomains: config.subdomains,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Render DBSCAN AI Hotspot Density Overlays
      geoClusters.forEach((cluster) => {
        if (cluster.center_lat && cluster.center_lng) {
          L.circle([cluster.center_lat, cluster.center_lng], {
            radius: 4000,
            color: '#EF4444',
            fillColor: '#EF4444',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '6, 6',
          })
            .bindTooltip(
              `<div style="font-family:var(--font-body),sans-serif;font-weight:700;font-size:0.8rem;color:#991B1B;background:#FEE2E2;padding:4px 10px;border-radius:12px;border:1px solid #FCA5A5;box-shadow:0 4px 12px rgba(239,68,68,0.2)">🔥 ${cluster.name} (${cluster.total_wards} Wards Cluster)</div>`,
              { permanent: false, direction: 'center' }
            )
            .addTo(map);
        }
      });

      // Render Filtered Ward Markers
      const maxCount = Math.max(...data.map((w) => w.complaint_count), 1);
      const latLngList: [number, number][] = [];

      filteredWards.forEach((ward) => {
        if (ward.lat && ward.lng) {
          latLngList.push([ward.lat, ward.lng]);
          const radius = bubbleRadius(ward.complaint_count, maxCount);
          const color = urgencyColor(ward.avg_urgency);
          const isCritical = ward.avg_urgency >= 75;

          // Outer glowing aura circle for high urgency
          if (isCritical) {
            L.circleMarker([ward.lat, ward.lng], {
              radius: radius + 8,
              fillColor: '#EF4444',
              fillOpacity: 0.25,
              color: 'transparent',
              weight: 0,
            }).addTo(map);
          }

          const circle = L.circleMarker([ward.lat, ward.lng], {
            radius,
            fillColor: color,
            fillOpacity: 0.88,
            color: '#FFFFFF',
            weight: 3,
            className: isCritical ? 'pulse-marker' : '',
          });

          const urgencyBadge =
            ward.avg_urgency >= 75
              ? '<span style="background:#FEE2E2;color:#991B1B;border:1px solid #FCA5A5;padding:2px 8px;border-radius:10px;font-size:0.72rem;font-weight:800">🚨 CRITICAL</span>'
              : ward.avg_urgency >= 50
              ? '<span style="background:#FEF3C7;color:#92400E;border:1px solid #FCD34D;padding:2px 8px;border-radius:10px;font-size:0.72rem;font-weight:800">⚠️ MEDIUM</span>'
              : '<span style="background:#D1FAE5;color:#065F46;border:1px solid #6EE7B7;padding:2px 8px;border-radius:10px;font-size:0.72rem;font-weight:800">🟢 LOW</span>';

          circle.bindPopup(
            `<div style="font-family:var(--font-body),sans-serif;min-width:210px;padding:4px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <div style="font-weight:800;font-size:1.05rem;color:#1F3A24;letter-spacing:-0.02em">${ward.name}</div>
                ${urgencyBadge}
              </div>

              <div style="background:#F8FAFC;border-radius:10px;padding:8px 10px;margin-bottom:8px;border:1px solid #E2E8F0">
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px">
                  <span style="color:#64748B;font-weight:600">Citizen Complaints</span>
                  <span style="color:#0F172A;font-weight:800">${ward.complaint_count}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8rem">
                  <span style="color:#64748B;font-weight:600">Urgency Score</span>
                  <span style="color:${color};font-weight:800">${ward.avg_urgency.toFixed(0)}/100</span>
                </div>
              </div>

              <div style="width:100%;height:6px;background:#E2E8F0;border-radius:10px;overflow:hidden;margin-bottom:10px">
                <div style="width:${ward.avg_urgency}%;height:100%;background:${color};border-radius:10px"></div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.73rem;color:#475569;border-top:1px solid #F1F5F9;padding-top:8px">
                <div>🏗️ Infra: <strong>${ward.infra_index}/100</strong></div>
                <div>💰 Budget: <strong>${ward.budget_index}/100</strong></div>
              </div>
            </div>`,
            { maxWidth: 260 }
          );

          circle.on('click', () => {
            playTick();
            setSelectedWardDetails(ward);
          });

          circle.addTo(map);
          markersRef.current.push(circle);

          // Ward name label overlay
          L.tooltip({
            permanent: true,
            direction: 'top',
            className: 'ward-label',
            offset: [0, -radius - 3],
          })
            .setContent(
              `<span style="font-size:0.72rem;font-weight:750;color:#1F3A24;background:rgba(255,255,255,0.92);backdrop-filter:blur(6px);padding:3px 8px;border-radius:12px;box-shadow:0 3px 10px rgba(0,0,0,0.12);border:1px solid rgba(18,53,36,0.12)">${ward.name}</span>`
            )
            .setLatLng([ward.lat, ward.lng])
            .addTo(map);
        }
      });

      // Fit bounds to cover visible wards smoothly
      if (latLngList.length > 0) {
        const bounds = L.latLngBounds(latLngList);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }

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
  }, [data, geoClusters, loading, error, urgencyFilter, searchQuery]);

  // Handle City Select Fly
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

  // Reset Map View
  const handleResetMap = () => {
    playTick();
    setSearchQuery('');
    setUrgencyFilter('ALL');
    setSelectedCity('ALL');
    setSelectedWardDetails(null);
    if (leafletMap.current && data.length > 0) {
      const L = (window as any).L;
      const validWards = data.filter((w) => w.lat && w.lng);
      if (validWards.length > 0 && L) {
        const bounds = L.latLngBounds(validWards.map((w) => [w.lat, w.lng]));
        leafletMap.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
  };

  return (
    <div
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        background: '#FFFFFF',
        border: '1px solid rgba(18, 53, 36, 0.12)',
        boxShadow: '0 12px 36px rgba(18, 53, 36, 0.08)',
        position: 'relative',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '1.25rem 1.75rem',
          background: 'linear-gradient(135deg, #123524 0%, #1F3A24 100%)',
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass size={20} color="#6FBF73" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                  Pan-India Civic Demand & Hotspot Radar
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)', margin: '2px 0 0', fontWeight: 500 }}>
                  Real-time spatial clustering engine · Bubble size = complaint volume · Glow = urgency level
                </p>
              </div>
            </div>
          </div>

          {/* Micro Telemetry Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 20,
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              <MapPin size={13} color="#6FBF73" /> {filteredWards.length} Wards
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 20,
                background: 'rgba(239, 68, 68, 0.22)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#FCA5A5',
              }}
            >
              <Flame size={13} color="#EF4444" /> {criticalCount} Critical
            </div>

            {geoClusters.length > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 20,
                  background: 'rgba(111, 191, 115, 0.2)',
                  border: '1px solid rgba(111, 191, 115, 0.4)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6FBF73',
                }}
              >
                <Sparkles size={13} /> {geoClusters.length} AI Clusters
              </div>
            )}
          </div>
        </div>

        {/* ── NEW HELPFUL TOOLBAR: Search Bar + Urgency Filter Chips + Style Switcher ───── */}
        {!loading && !error && data.length > 0 && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Top Toolbar Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
                <Search size={15} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search Ward or City (e.g. Ward 14, Jaipur)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.42rem 0.85rem 0.42rem 2.2rem',
                    borderRadius: 100,
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    outline: 'none',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Urgency Filter Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginRight: 2 }}>
                  Filter:
                </span>
                {[
                  { key: 'ALL', label: `All (${data.length})` },
                  { key: 'CRITICAL', label: `🚨 Critical (${criticalCount})` },
                  { key: 'MEDIUM', label: `⚠️ Medium (${mediumCount})` },
                  { key: 'LOW', label: `🟢 Low (${lowCount})` },
                ].map((chip) => {
                  const active = urgencyFilter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      onClick={() => { playTick(); setUrgencyFilter(chip.key as any); }}
                      style={{
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        padding: '0.3rem 0.7rem',
                        borderRadius: 100,
                        border: active ? '1.5px solid #25D366' : '1px solid rgba(255,255,255,0.18)',
                        background: active ? '#25D366' : 'rgba(255,255,255,0.08)',
                        color: active ? '#123524' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* Map View Style Selector Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.2)', padding: 3, borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)' }}>
                <button
                  onClick={() => { playTick(); setMapStyle('voyager'); }}
                  title="Light Voyager Map"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: 100,
                    border: 'none',
                    background: mapStyle === 'voyager' ? '#FFFFFF' : 'transparent',
                    color: mapStyle === 'voyager' ? '#123524' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <Sun size={12} /> Light
                </button>

                <button
                  onClick={() => { playTick(); setMapStyle('dark'); }}
                  title="Dark Command Map"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: 100,
                    border: 'none',
                    background: mapStyle === 'dark' ? '#FFFFFF' : 'transparent',
                    color: mapStyle === 'dark' ? '#123524' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <Moon size={12} /> Dark Radar
                </button>

                <button
                  onClick={() => { playTick(); setMapStyle('satellite'); }}
                  title="Satellite Terrain Map"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: 100,
                    border: 'none',
                    background: mapStyle === 'satellite' ? '#FFFFFF' : 'transparent',
                    color: mapStyle === 'satellite' ? '#123524' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <Globe size={12} /> Satellite
                </button>
              </div>
            </div>

            {/* City Presets Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: 2 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', marginRight: 4 }}>
                Fly To City:
              </span>
              {CITY_PRESETS.map((preset) => {
                const active = selectedCity === preset.city;
                return (
                  <button
                    key={preset.city}
                    onClick={() => handleCitySelect(preset)}
                    style={{
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.7rem',
                      borderRadius: 100,
                      border: active ? '1.5px solid #25D366' : '1px solid rgba(255, 255, 255, 0.18)',
                      background: active ? '#25D366' : 'rgba(255, 255, 255, 0.08)',
                      color: active ? '#123524' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 160ms ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}

              <button
                onClick={handleResetMap}
                title="Reset Map View & Filters"
                style={{
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.6rem',
                  borderRadius: 100,
                  border: '1px solid rgba(255,255,255,0.25)',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  whiteSpace: 'nowrap',
                  marginLeft: 'auto',
                }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Content Container */}
      {loading && <Skeleton height={500} style={{ borderRadius: 0 }} />}
      {error && (
        <div style={{ padding: '2.5rem' }}>
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-soft)' }}>
          No spatial location data available.
        </div>
      )}
      {!loading && !error && data.length > 0 && (
        <div style={{ position: 'relative' }}>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>{`
            .leaflet-container { font-family: var(--font-body), sans-serif; background: #F1F5F9; }
            .ward-label { background: transparent !important; border: none !important; box-shadow: none !important; }
            .ward-label::before { display: none !important; }
            .leaflet-popup-content-wrapper {
              border-radius: 16px !important;
              padding: 6px !important;
              box-shadow: 0 10px 30px rgba(0,0,0,0.18) !important;
              border: 1px solid rgba(18, 53, 36, 0.12) !important;
            }
            .leaflet-popup-tip { background: #FFFFFF !important; }
            @keyframes pulseMarker {
              0% { stroke-width: 3px; stroke-opacity: 1; }
              50% { stroke-width: 7px; stroke-opacity: 0.5; }
              100% { stroke-width: 3px; stroke-opacity: 1; }
            }
            .pulse-marker {
              animation: pulseMarker 2s infinite ease-in-out;
            }
          `}</style>

          <div
            ref={mapRef}
            style={{ height: 500, width: '100%', zIndex: 1 }}
            aria-label="Interactive Pan-India Hotspot Map"
          />

          {/* ── NEW FEATURE: Selected Ward Intelligence Card (Bottom Left Floating Overlay) ───── */}
          {selectedWardDetails && (
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                zIndex: 1000,
                background: mapStyle === 'dark' ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(16px)',
                borderRadius: 20,
                padding: '1.25rem',
                border: mapStyle === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(18, 53, 36, 0.15)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22)',
                maxWidth: 310,
                width: 'calc(100% - 40px)',
                color: mapStyle === 'dark' ? '#F8FAFC' : '#123524',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase' }}>
                  WARD INTELLIGENCE
                </span>
                <button onClick={() => setSelectedWardDetails(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: mapStyle === 'dark' ? '#94A3B8' : '#64748B' }}>
                  <X size={16} />
                </button>
              </div>

              <h4 style={{ fontWeight: 800, fontSize: '1.15rem', margin: '0 0 6px' }}>{selectedWardDetails.name}</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '10px 0' }}>
                <div style={{ background: mapStyle === 'dark' ? 'rgba(255,255,255,0.06)' : '#F8FAFC', padding: '8px 10px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.68rem', color: mapStyle === 'dark' ? '#94A3B8' : '#64748B', fontWeight: 600 }}>Complaints</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: 2 }}>{selectedWardDetails.complaint_count}</div>
                </div>
                <div style={{ background: mapStyle === 'dark' ? 'rgba(255,255,255,0.06)' : '#F8FAFC', padding: '8px 10px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.68rem', color: mapStyle === 'dark' ? '#94A3B8' : '#64748B', fontWeight: 600 }}>Urgency Index</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: urgencyColor(selectedWardDetails.avg_urgency), marginTop: 2 }}>
                    {selectedWardDetails.avg_urgency.toFixed(0)}/100
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.74rem', color: mapStyle === 'dark' ? '#CBD5E1' : '#475569', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} color="#25D366" /> GPS: {selectedWardDetails.lat?.toFixed(4)}, {selectedWardDetails.lng?.toFixed(4)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: selectedWardDetails.avg_urgency >= 75 ? '#DC2626' : '#059669', background: selectedWardDetails.avg_urgency >= 75 ? '#FEF2F2' : '#ECFDF5', padding: '3px 8px', borderRadius: 100, border: '1px solid rgba(0,0,0,0.08)' }}>
                  {selectedWardDetails.avg_urgency >= 75 ? '🚨 High Priority Dispatch' : '🟢 Normal Monitoring'}
                </span>
              </div>
            </div>
          )}

          {/* Floating Glassmorphism Map Legend at Bottom Right */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 1000,
              background: mapStyle === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(12px)',
              padding: '0.65rem 1rem',
              borderRadius: 16,
              border: mapStyle === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(18, 53, 36, 0.12)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: mapStyle === 'dark' ? '#F8FAFC' : '#1F3A24',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 750 }}>High (≥75)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 750 }}>Medium (50-74)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 750 }}>Low (&lt;50)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
