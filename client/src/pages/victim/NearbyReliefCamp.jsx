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
import Camptooltip from "../../components/Camptooltip.jsx";

import "../../css/NearbyMap.css";

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

const NearbyReliefCamp = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	const { myCoords, gpsStatus, acquireGPS } = useGPS();
	const [requests, setRequests] = useState([]);
	const [fetching, setFetching] = useState(false);
	const [fetchErr, setFetchErr] = useState("");
	const [updatedAt, setUpdatedAt] = useState(null);
	const [radius, setRadius] = useState(10000);

	const mapRef = useRef(null);
	const mapCenter = myCoords || [23.8103, 90.4125]; // Dhaka fallback

	/* ── Fetch nearby camps ── */
	const loadNearbycamps = useCallback(async () => {
		if (!myCoords) return;
		setFetching(true);
		setFetchErr("");
		try {
			const [lat, lng] = myCoords;
			const res = await api.get(
				`/camps/nearby?lng=${lng}&lat=${lat}&radius=${radius}`,
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
		if (myCoords) loadNearbycamps();
	}, [myCoords, radius, loadNearbycamps]);

	/* ── Derived counts ── */
	const counts = {
		total: requests.length,
	};

	return (
		<div className="nm-page">
			{/* Top bar */}
			<NavTopBar
				user={user}
				onBack={() => navigate("/victim")}
				subtitle="VICTIM PORTAL — RELIEF CAMP VIEW"
			/>

			<ControlBar
				radius={radius}
				setRadius={setRadius}
				myCoords={myCoords}
				fetching={fetching}
				fetchErr={fetchErr}
				updatedAt={updatedAt}
				loadNearby={loadNearbycamps}
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

					{/* Victim "You Are Here" */}
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

					{/* Camps  circles */}
					{requests.map((camp) => {
						const [lng, lat] = camp.location.coordinates;

						const isActive = camp.isActive;

						return (
							<CircleMarker
								key={camp._id}
								center={[lat, lng]}
								radius={isActive ? 14 : 10}
								pathOptions={{
									fillColor: isActive ? "#2ecc71" : "#95a5a6", // green / gray
									fillOpacity: 0.85,
									color: isActive ? "#2ecc71" : "#95a5a6",
									weight: isActive ? 3 : 2,
									opacity: 1,
								}}
								eventHandlers={{
									mouseover: (e) =>
										e.target.setStyle({
											weight: isActive ? 5 : 4,
											fillOpacity: 1,
										}),
									mouseout: (e) =>
										e.target.setStyle({
											weight: isActive ? 3 : 2,
											fillOpacity: 0.85,
										}),
								}}
							>
								<Tooltip direction="top" offset={[0, -12]} className="sos-tip">
									<Camptooltip camp={camp} lat={lat} lng={lng} />
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
				<MapLegend role={"victim"} />
			</div>
		</div>
	);
};
export default NearbyReliefCamp;
