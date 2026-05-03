import React from "react";
import "../css/NearbyMap.css";

const Camptooltip = ({ camp, lat, lng }) => (
	<div className="nm-sos-tooltip">
		{/* Camp name */}
		<div className="nm-sos-tooltip__row">
			<span className="nm-sos-tooltip__key">Camp</span>
			<span>{camp.name}</span>
		</div>
		{/* Address */}
		{camp.address && (
			<div className="nm-sos-tooltip__row">
				<span className="nm-sos-tooltip__key">Address</span>
				<span>{camp.address}</span>
			</div>
		)}
		{/* Capacity */}
		{camp.capacity && (
			<div className="nm-sos-tooltip__row">
				<span className="nm-sos-tooltip__key">Capacity</span>
				<span>{camp.capacity}</span>
			</div>
		)}
		{/* CurrentOccupancy */}
		<div className="nm-sos-tooltip__row">
			<span className="nm-sos-tooltip__key">Occupancy</span>
			<span>{camp.currentOccupancy}</span>
		</div>
		<div className="nm-sos-tooltip__row">
			{camp.isActive ? "🟢 Active Camp" : "⚫ Inactive Camp"} <br />
		</div>

		{/* GPS */}
		<div className="nm-sos-tooltip__row">
			<span className="nm-sos-tooltip__key">GPS</span>
			<span className="nm-sos-tooltip__gps">
				{lat.toFixed(5)}°N, {lng.toFixed(5)}°E
			</span>
		</div>
	</div>
);

export default Camptooltip;
