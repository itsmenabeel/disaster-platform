import React, { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import api from "../services/api";
import Camptooltip from "./Camptooltip";
import "../css/NearbyMap.css";

const STATUS_META = {
  pending: { label: "Pending", color: "#f39c12" },
  assigned: { label: "Assigned", color: "#3498db" },
  on_the_way: { label: "On Way", color: "#9b59b6" },
  rescued: { label: "Rescued", color: "#2ecc71" },
  closed: { label: "Closed", color: "#8892a4" },
};

const PRIORITY_META = {
  critical: { label: "Critical", color: "#e63946" },
  high: { label: "High", color: "#e67e22" },
  medium: { label: "Medium", color: "#f39c12" },
  low: { label: "Low", color: "#2ecc71" },
};

const createCampIcon = (color, borderColor) =>
  L.divIcon({
    className: "live-camp-square-marker",
    html: `<span style="display:block;width:18px;height:18px;border-radius:3px;background:${color};border:2px solid ${borderColor};box-shadow:0 0 0 4px ${color}33,0 8px 18px rgba(0,0,0,0.35);"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    tooltipAnchor: [0, -12],
  });

const CAMP_ICONS = {
  active: createCampIcon("#2ecc71", "#ffffff"),
  inactive: createCampIcon("#8892a4", "#d9dee8"),
};

const styles = {
  mapPanel: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    boxShadow: "var(--shadow)",
  },
  mapHeader: {
    padding: "16px 18px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  mapTitle: {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.2rem",
    letterSpacing: "0.04em",
  },
  liveNote: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--success)",
    fontSize: "0.72rem",
    fontFamily: "IBM Plex Mono, monospace",
    letterSpacing: "0.07em",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--success)",
    animation: "pulse-dot 1s infinite",
  },
  mapWrap: {
    height: "520px",
    position: "relative",
  },
  markerLegend: {
    position: "absolute",
    zIndex: 500,
    right: 14,
    bottom: 14,
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
    padding: "9px 11px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "rgba(10, 14, 20, 0.84)",
    color: "var(--text-secondary)",
    fontSize: "0.72rem",
    fontFamily: "IBM Plex Mono, monospace",
  },
  legendItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  legendDot: (color) => ({
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: color,
    boxShadow: `0 0 0 2px ${color}30`,
  }),
  legendSquare: (color) => ({
    width: 10,
    height: 10,
    borderRadius: 2,
    background: color,
    boxShadow: `0 0 0 2px ${color}30`,
  }),
  empty: {
    border: "1px dashed var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "28px",
    textAlign: "center",
    color: "var(--text-muted)",
  },
  error: {
    padding: "12px 18px",
    borderBottom: "1px solid rgba(230,57,70,0.28)",
    color: "#ff8b96",
    background: "rgba(230,57,70,0.1)",
    fontSize: "0.84rem",
  },
};

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

const FitToMapData = ({ requests, camps }) => {
  const map = useMap();
  const lastSignature = useRef("");

  useEffect(() => {
    map.invalidateSize();

    const requestPoints = requests
      .map((item) => item.location?.coordinates)
      .filter((coords) => Array.isArray(coords) && coords.length === 2)
      .map(([lng, lat]) => [lat, lng]);
    const campPoints = camps
      .map((item) => item.location?.coordinates)
      .filter((coords) => Array.isArray(coords) && coords.length === 2)
      .map(([lng, lat]) => [lat, lng]);
    const points = [...requestPoints, ...campPoints];
    const signature = points.map(([lat, lng]) => `${lat},${lng}`).join("|");

    if (!points.length || signature === lastSignature.current) return;
    lastSignature.current = signature;

    if (points.length === 1) {
      map.setView(points[0], 12);
    } else {
      map.fitBounds(points, { padding: [42, 42] });
    }
  }, [map, requests, camps]);

  return null;
};

const LiveOperationsMap = ({ title = "All Requests On Map", onData }) => {
  const [requests, setRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const hasLoaded = useRef(false);
  const center = [23.8103, 90.4125];

  const loadMapData = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet && !hasLoaded.current) setLoading(true);
      setError("");

      try {
        const response = await api.get("/analytics/live-map");
        const nextRequests = response.data.data?.requests || [];
        const nextCamps = response.data.data?.camps || [];

        setRequests(nextRequests);
        setCamps(nextCamps);
        setUpdatedAt(new Date());
        hasLoaded.current = true;
        onData?.({ requests: nextRequests, camps: nextCamps });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load live map.");
      } finally {
        setLoading(false);
      }
    },
    [onData],
  );

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  useEffect(() => {
    const interval = setInterval(() => loadMapData({ quiet: true }), 5000);
    return () => clearInterval(interval);
  }, [loadMapData]);

  return (
    <div style={styles.mapPanel}>
      <div style={styles.mapHeader}>
        <div>
          <div style={styles.mapTitle}>{title}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
            Last updated {formatTime(updatedAt)}
          </div>
        </div>
        <div style={styles.liveNote}>
          <span style={styles.liveDot} />
          LIVE HTTP POLLING
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.mapWrap}>
        {loading ? (
          <div style={styles.empty}>Loading live map data...</div>
        ) : (
          <MapContainer
            center={center}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
            zoomControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
            />
            <FitToMapData requests={requests} camps={camps} />

            {requests.map((request) => {
              const coords = request.location?.coordinates;
              if (!Array.isArray(coords) || coords.length !== 2) return null;
              const [lng, lat] = coords;
              const status = STATUS_META[request.status] || STATUS_META.pending;
              const priority =
                PRIORITY_META[request.priority] || PRIORITY_META.medium;
              const isUrgent =
                request.priority === "critical" || request.priority === "high";

              return (
                <CircleMarker
                  key={request._id}
                  center={[lat, lng]}
                  radius={isUrgent ? 15 : 11}
                  pathOptions={{
                    fillColor: priority.color,
                    fillOpacity: 0.84,
                    color: status.color,
                    weight: isUrgent ? 4 : 2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -12]} className="sos-tip">
                    <div>
                      <strong>#{request._id.slice(-6).toUpperCase()}</strong>
                      <br />
                      {request.needs?.join(", ") || "No needs listed"}
                      <br />
                      Status: {status.label}
                      <br />
                      Priority: {priority.label}
                      <br />
                      Victim: {request.victim?.name || "Unknown"}
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}

            {camps.map((camp) => {
              const coords = camp.location?.coordinates;
              if (!Array.isArray(coords) || coords.length !== 2) return null;
              const [lng, lat] = coords;

              return (
                <Marker
                  key={camp._id}
                  position={[lat, lng]}
                  icon={camp.isActive ? CAMP_ICONS.active : CAMP_ICONS.inactive}
                >
                  <Tooltip direction="top" offset={[0, -12]} className="sos-tip">
                    <Camptooltip camp={camp} lat={lat} lng={lng} />
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>
        )}
        <div style={styles.markerLegend}>
          <span style={styles.legendItem}>
            <span style={styles.legendDot("#e63946")} />
            SOS PRIORITY
          </span>
          <span style={styles.legendItem}>
            <span style={styles.legendSquare("#2ecc71")} />
            RELIEF CAMP
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveOperationsMap;
