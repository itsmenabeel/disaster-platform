import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

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
  }, [center]);

  return null;
};

export default RecenterMap;
