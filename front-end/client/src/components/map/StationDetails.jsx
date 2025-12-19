import "./StationDetails.css";

const CONNECTOR_NAMES = {
    1: 'Type 2',
    2: 'CCS',
    3: 'CHAdeMO',
    4: 'Tesla Supercharger'
};

export default function StationDetails({ station, onClose }) {
  return (
    <>
      {/* The Dark Overlay */}
      <div className="map-overlay" onClick={onClose}></div>

      {/* The Sliding Block */}
      <div className="station-drawer">

        <div className ="drawer-header">
        <h2>{station.address}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <p className="facilities">Facilities: {station.facilities}</p>
        
        <div className="charger-list">
          {station.chargers.map((charger) => (
  <div key={charger.charger_id} className="charger-card">
    <div style={{ color: "#333" }}> {/* Explicitly set text color */}
      <strong style={{ display: "block", fontSize: "1.1rem" }}>
        ⚡ {charger.power}kW
      </strong>
      <span style={{ fontSize: "0.9rem", color: "#666" }}>
        ({CONNECTOR_NAMES[charger.connector_id] || 'Unknown'})
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
))}
        </div>
      </div>
    </>
  );
}