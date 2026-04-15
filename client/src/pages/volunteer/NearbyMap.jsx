// src/pages/volunteer/NearbyMap.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import useGPS from "../../hooks/useGPS.js";
import ControlBar from "../../components/ControlBar.jsx";
import MapOverlays from "../../components/Mapoverlays.jsx";
import MapLegend from "../../components/Maplegend.jsx";
import SosTooltip from "../../components/Sostooltip.jsx";
import NavTopBar from "../../components/NavTopBar.jsx";
import "../../css/NearbyMap.css";

/* ─── Static config ──────────────────────────────────────────────── */
const PRIORITY = {
  critical: { color: "#e63946", label: "CRITICAL" },
  high: { color: "#e67e22", label: "HIGH" },
  medium: { color: "#f39c12", label: "MEDIUM" },
  low: { color: "#2ecc71", label: "LOW" },
};

/* ─── RecenterMap ────────────────────────────────────────────────── */
const RecenterMap = ({ center }) => {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (!center) return;
    if (first.current) {
      map.setView(center, 14);
      first.current = false;
    } else {
      map.panTo(center);
    }
  }, [center, map]);
  return null;
};

/* ─── NearbyMap ──────────────────────────────────────────────────── */
const NearbyMap = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { myCoords, gpsStatus, acquireGPS } = useGPS();
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [radius, setRadius] = useState(10000);

  const mapRef = useRef(null);

  /* ── Fetch nearby SOS ── */
  const loadNearby = useCallback(async () => {
    if (!myCoords) return;
    setFetching(true);
    setFetchErr("");
    try {
      const [lat, lng] = myCoords;
      const res = await api.get(
        `/sos/nearby?lng=${lng}&lat=${lat}&radius=${radius}`,
      );
      setRequests(res.data.data || []);
      setUpdatedAt(new Date());
    } catch (err) {
      setFetchErr(err.response?.data?.message || "Failed to load requests.");
    } finally {
      setFetching(false);
    }
  }, [myCoords, radius]);

  useEffect(() => {
    if (myCoords) loadNearby();
  }, [myCoords, radius, loadNearby]);

  /* ── Derived counts ── */
  const counts = {
    total: requests.length,
    critical: requests.filter((r) => r.priority === "critical").length,
    high: requests.filter((r) => r.priority === "high").length,
    medium: requests.filter((r) => r.priority === "medium").length,
    low: requests.filter((r) => r.priority === "low").length,
  };

  const mapCenter = myCoords || [23.8103, 90.4125]; // Dhaka fallback

  /* ── Render ── */
  return (
    <div className="nm-page">
      {/* Top bar */}
      <NavTopBar
        user={user}
        onBack={() => navigate("/volunteer")}
        subtitle="VOLUNTEER PORTAL — RESCUE TASK VIEW"
      />

      <ControlBar
        radius={radius}
        setRadius={setRadius}
        myCoords={myCoords}
        fetching={fetching}
        fetchErr={fetchErr}
        updatedAt={updatedAt}
        loadNearby={loadNearby}
        counts={counts}
      />

      {/* Map area */}
      <div className="nm-map-area">
        {/* GPS / no-results overlays */}
        <MapOverlays
          gpsStatus={gpsStatus}
          fetching={fetching}
          requestCount={requests.length}
          radius={radius}
          onRetryGps={acquireGPS}
        />

        {/* Leaflet map */}
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />

          {myCoords && <RecenterMap center={myCoords} />}

          {/* Volunteer "You Are Here" */}
          {myCoords && (
            <CircleMarker
              center={myCoords}
              radius={13}
              pathOptions={{
                fillColor: "#3498db",
                fillOpacity: 0.92,
                color: "#ffffff",
                weight: 2.5,
              }}
            >
              <Tooltip direction="top" offset={[0, -15]} className="vol-tip">
                YOU ARE HERE
              </Tooltip>
            </CircleMarker>
          )}

          {/* SOS request circles */}
          {requests.map((req) => {
            const [lng, lat] = req.location.coordinates;
            const p = PRIORITY[req.priority] || PRIORITY.medium;
            const urgent =
              req.priority === "critical" || req.priority === "high";

            return (
              <CircleMarker
                key={req._id}
                center={[lat, lng]}
                radius={urgent ? 15 : 11}
                pathOptions={{
                  fillColor: p.color,
                  fillOpacity: 0.85,
                  color: p.color,
                  weight: urgent ? 3 : 2,
                  opacity: 1,
                }}
                eventHandlers={{
                  click: () => navigate(`/volunteer/sos/${req._id}`),
                  mouseover: (e) =>
                    e.target.setStyle({
                      weight: urgent ? 5 : 4,
                      fillOpacity: 1,
                    }),
                  mouseout: (e) =>
                    e.target.setStyle({
                      weight: urgent ? 3 : 2,
                      fillOpacity: 0.85,
                    }),
                }}
              >
                <Tooltip direction="top" offset={[0, -12]} className="sos-tip">
                  <SosTooltip req={req} priorityCfg={p} lat={lat} lng={lng} />
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* My Location button */}
        {myCoords && (
          <button
            className="nm-my-location-btn"
            onClick={() =>
              mapRef.current?.setView(myCoords, 14, { animate: true })
            }
            title="Center map on your location"
          >
            📍 MY LOCATION
          </button>
        )}

        {/* Legend */}
        <MapLegend role={"volunteer"} />
      </div>
    </div>
  );
};

export default NearbyMap;
