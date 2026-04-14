import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "../../css/nearbyMap.css";

import TopBar from "../../components/maptopbar";
import ControlBar from "../../components/ControlBar";
import RecenterMap from "../../components/RecenterMap";
import MyLocationMarker from "../../components/MyLocationMarker";
import SOSMarkers from "../../components/SOSMarkers";
import Overlay from "../../components/Overlay";

const NearbyMap = () => {
  const [myCoords, setMyCoords] = useState(null);
  const [requests, setRequests] = useState([]);
  const [radius, setRadius] = useState(20000);
  const [gpsStatus, setGpsStatus] = useState("idle");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyCoords([pos.coords.latitude, pos.coords.longitude]);
        setGpsStatus("success");
      },
      () => setGpsStatus("error"),
    );
  }, []);

  const loadNearby = () => {
    // API call
  };

  const counts = {
    total: requests.length,
  };

  return (
    <div className="main-container">
      <TopBar />
      <ControlBar
        radius={radius}
        setRadius={setRadius}
        loadNearby={loadNearby}
        counts={counts}
      />

      <div className="map-container">
        <Overlay status={gpsStatus} />

        <MapContainer center={[23.81, 90.41]} zoom={13}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <RecenterMap center={myCoords} />
          <MyLocationMarker coords={myCoords} />
          <SOSMarkers requests={requests} />
        </MapContainer>
      </div>
    </div>
  );
};

export default NearbyMap;
