// src/components/MapOverlays.jsx
import React from "react";
import "../css/NearbyMap.css";
import { Radio, MapPin, CheckCircle2 } from "lucide-react";

const RADIUS_OPTIONS = [
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 },
  { label: "50 km", value: 50000 },
];

const MapOverlays = ({
  gpsStatus,
  fetching,
  requestCount,
  radius,
  onRetryGps,
}) => (
  <>
    {/* GPS acquiring */}
    {gpsStatus === "loading" && (
      <div className="nm-overlay">
        <div className="nm-overlay__icon"><Radio size={28} /></div>
        <div className="nm-overlay__text">Acquiring GPS signal...</div>
      </div>
    )}

    {/* GPS denied / unavailable */}
    {gpsStatus === "error" && (
      <div className="nm-overlay">
        <div className="nm-overlay__icon"><MapPin size={28} /></div>
        <div className="nm-overlay__text nm-overlay__text--error">
          GPS access denied or unavailable.
          <br />
          Enable location permissions and try again.
        </div>
        <button className="nm-overlay__retry-btn" onClick={onRetryGps}>
          RETRY LOCATION
        </button>
      </div>
    )}

    {/* No results */}
    {gpsStatus === "success" && !fetching && requestCount === 0 && (
      <div className="nm-no-results">
        <div className="nm-no-results__icon"><CheckCircle2 size={28} /></div>
        <div className="nm-no-results__title">NO ACTIVE REQUESTS</div>
        <div className="nm-no-results__sub">
          No pending SOS within{" "}
          {RADIUS_OPTIONS.find((r) => r.value === radius)?.label}
        </div>
      </div>
    )}
  </>
);

export default MapOverlays;
