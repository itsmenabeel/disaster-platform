import { CircleMarker, Tooltip } from "react-leaflet";

const MyLocationMarker = ({ coords }) => {
  if (!coords) return null;

  return (
    <CircleMarker center={coords} radius={13}>
      <Tooltip>YOU ARE HERE</Tooltip>
    </CircleMarker>
  );
};

export default MyLocationMarker;
