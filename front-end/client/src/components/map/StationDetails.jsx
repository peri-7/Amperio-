import "./StationDetails.css";


const ConnectorIcon = ({ type }) => {
  switch(type) {
    case 'Type 2':
      return <img src="src/assets/images/type2.png" alt="Type 2 Connector" className="connector-icon" />;
      case 'CCS1':
        return <img src="src/assets/images/ccs1.png" alt="CCS1 Connector" className="connector-icon" />;
        case 'CCS2':
          return <img src="src/assets/images/ccs2.png" alt="CCS2 Connector" className="connector-icon" />;
          case 'CHAdeMO':
            return <img src="src/assets/images/chademo.png" alt="CHAdeMO Connector" className="connector-icon" />;
  }
};

export default function StationDetails({ station, onClose }) {

  //check if a station doesnt have any chargers yet 
  if(!station) return null;

  const sortedChargers = station.chargers ? [...station.chargers].sort((a,b) => {
    const statusOrder = { 'available': 1, 'charging': 2, 'reserved': 3, 'malfunction': 4, 'offline': 5 };
    return statusOrder[a.charger_status] - statusOrder[b.charger_status];
  }) : [];

  station.chargers = sortedChargers;
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

        <p className="facilities"> <strong>Nearby:</strong> {station.facilities || "N/A"}</p>

        <div className="charger-list">
          { station.chargers && station.chargers.length >0 ? (
          station.chargers.map((charger) => (
            <div key={charger.charger_id} className="charger-card">
              <div className="charger-info-main"> 
                <div className="connector-icon-wrapper">
                  <ConnectorIcon type={charger.connector_type} />
                </div>
                <div className="text-container"> 
                  <span className="connector-name">{charger.connector_type}</span>
                <span className = "power-level">{charger.power} kW</span>
                <span className={`status-pill ${charger.charger_status}`}>
                  {charger.charger_status} </span>
                </div>
              </div>

              {/* Corrected logic to use charger_status to match your status above */}
              {charger.charger_status === 'available' && (
                <button className="reserve-btn">Reserve Now</button>
              )}
            </div>
          ))
        ):(
          <p className="no-chargers">No chargers available at this location.</p>
        )}
        </div>
      </div>
    </>
  );
}