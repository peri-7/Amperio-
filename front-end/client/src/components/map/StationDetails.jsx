import "./StationDetails.css";


const ConnectorIcon = ({ type }) => {
  switch (type) {
    case 'Type 2':
      return <img src="/type2.png" alt="Type 2 Connector" className="connector-icon" />;
    case 'CCS1':
      return <img src="/ccs1.png" alt="CCS1 Connector" className="connector-icon" />;
    case 'CCS2':
      return <img src="/ccs2.png" alt="CCS2 Connector" className="connector-icon" />;
    case 'CHAdeMO':
      return <img src="/chademo.png" alt="CHAdeMO Connector" className="connector-icon" />;
  }
};


const Score = ({ value }) => {
  const stars = [];
  const numericValue = Number(value) || 0; // Ensure it's a number

  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(numericValue)) {
      stars.push(<span key={i} className="star filled">★</span>);
    } else if (i - numericValue < 1) {
      stars.push(
        <span key={i} className="star half-filled">
          ★
        </span>
      );
    } else {
      stars.push(<span key={i} className="star">☆</span>);
    }
  }

  return (
    <div className="score-wrapper">
      <div className="stars-row">{stars}</div>
      <span className="score-number">
        {numericValue.toFixed(1)} / 5
      </span>
    </div>
  );
};

export default function StationDetails({ station, onClose }) {

  // If the station exists but doesn't have chargers yet, it's still loading
  if (!station || !station.chargers || !Array.isArray(station.chargers)) {
    return (
      <div className="station-drawer loading-state">
        <div className="station-content">
          <p>Fetching charger availability...</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const sortedChargers = station.chargers ? [...station.chargers].sort((a, b) => {
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
        <div className="station-ribbon"></div>
        <div className="station-content">
          <div className="drawer-header">
            <h2>{station.station_name || station.address}</h2>
            {station.name && (
              <p className="station-address" style={{ margin: 0, color: '#f6cc41ff' }}>{station.address}</p>
            )}
            {station.address && (
              <p className="station-subtitle" style={{ margin: "4px 0 0 0", color: "#666", fontSize: "0.95rem" }}>
                {station.address}
              </p>
            )}
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <Score value={station.score || 0} />
          <p className="facilities"> <strong>Nearby:</strong> {station.facilities || "N/A"}</p>
          <p className="google-maps-link">
            <a href={station.google_maps_link} target="_blank" rel="noopener noreferrer">
              View on Google Maps
            </a>
          </p>

          <div className="charger-list">
            {station.chargers && station.chargers.length > 0 ? (
              station.chargers.map((charger) => (
                <div key={charger.charger_id} className="charger-card">
                  <div className="charger-info-main">
                    <div className="connector-icon-wrapper">
                      <ConnectorIcon type={charger.connector_type} />
                    </div>
                    <div className="text-container">
                      <span className="connector-name">{charger.connector_type}</span>

                      <div className="specs-line">
                        <span className="power-level">{charger.power} kW</span>
                        <span className="separator">&bull;</span>
                        <span className="price-tag">
                          {/* Add a fallback to 0 if the value is missing or null */}
                          {(Number(charger.current_price) || 0).toFixed(2)}€/kWh
                        </span>
                      </div>
                      <span className={`status-pill ${charger.charger_status}`}>
                        {charger.charger_status} </span>
                    </div>
                  </div>

                  {/* Corrected logic to use charger_status to match your status above */}
                  {charger.charger_status === 'available' && (
                    <button className="reserve-btn">Reserve</button>
                  )}
                </div>
              ))
            ) : (
              <p className="no-chargers">No chargers available at this location.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
