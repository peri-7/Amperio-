import "./StationDetails.css";


export default function StationDetails({ station, onClose }) {

  //check if a station doesnt have any chargers yet 
  if(!station) return null;

  return (
    <>
      {/* The Dark Overlay */}
      <div className="map-overlay" onClick={onClose}></div>

      {/* The Sliding Block */}
      <div className="station-drawer">

        <div className="drawer-header">
          <h2>{station.station_name || station.address}</h2>
          {station.name && (
            <p className="station-address" style={{ margin: 0, color: '#666' }}>{station.address}</p>
          )}
          {station.address && (
           <p className="station-subtitle" style={{ margin: "4px 0 0 0", color: "#666", fontSize: "0.95rem" }}>
          {station.address}
          </p>
           )}
       <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <p className="facilities">Facilities: {station.facilities}</p>

        <div className="charger-list">
          { station.chargers && station.chargers.length >0 ? (
          station.chargers.map((charger) => (
            <div key={charger.charger_id} className="charger-card">
              <div style={{ color: "#333" }}> {/* Explicitly set text color */}
                <strong style={{ display: "block", fontSize: "1.1rem" }}>
                  ⚡ {charger.power}kW
                </strong>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>
                  ({charger.connector_type || 'Unknown'})
                </span>
                <p className={`status ${charger.charger_status}`} style={{ fontWeight: "bold", marginTop: "5px" }}>
                  {charger.charger_status ? charger.charger_status.toUpperCase() : "UNKNOWN"}
                </p>
              </div>

              {/* Corrected logic to use charger_status to match your status above */}
              {charger.charger_status === 'available' && (
                <button className="reserve-btn">Reserve Now</button>
              )}
            </div>
          ))
        ):(
          <p>No chargers available at this location.</p>
        )}
        </div>
      </div>
    </>
  );
}