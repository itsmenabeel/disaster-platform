import { CircleMarker, Tooltip } from "react-leaflet";

const SOSMarkers = ({ requests, navigate }) => {
  return (
    <>
      {requests.map((req) => {
        const [lng, lat] = req.location.coordinates;

        return (
          <CircleMarker
            key={req._id}
            center={[lat, lng]}
            eventHandlers={{
              click: () => navigate(`/volunteer/sos/${req._id}`),
            }}
          >
            <Tooltip>{req.victim?.name || "SOS Request"}</Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
};

export default SOSMarkers;
