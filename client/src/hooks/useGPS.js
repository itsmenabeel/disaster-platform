import { useState, useEffect, useCallback } from "react";

const useGPS = () => {
  const [myCoords, setMyCoords] = useState(null); // [lat, lng]
  const [gpsStatus, setGpsStatus] = useState("idle");

  const acquireGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }

    setGpsStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyCoords([pos.coords.latitude, pos.coords.longitude]);
        setGpsStatus("success");
      },
      () => {
        setGpsStatus("error");
      },
      { timeout: 12000, enableHighAccuracy: true },
    );
  }, []);

  useEffect(() => {
    acquireGPS();
  }, [acquireGPS]);

  return { myCoords, gpsStatus, acquireGPS };
};

export default useGPS;
