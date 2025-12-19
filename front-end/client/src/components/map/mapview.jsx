
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { dummyStations } from "../../data/dummychargers";
import L from "leaflet";

const getMarkerIcon = (status) => {
  let color;

  // Logic to determine color based on your requirements
  switch (status) {
    case 'available': color = 'green'; break;
    case 'charging': color = 'red'; break;
    case 'offline': color = 'grey'; break;
    case 'malfunction': color = 'black'; break;
    default: color = 'blue';
  }

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 15px;
      height: 15px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [15, 15],
    iconAnchor: [7, 7] // Centers the circle on the coordinates
  });
};

export default function MapView({onStationClick}) {
  return (
    <MapContainer //boss component , creates the map object
      center={[37.9838, 23.7275]}   // Athens
      zoom={13} //1 is the whole world, 18 is a street corner, 13 a city view
      style={{ height: "100%", width: "100%", }}
    // DEBUG
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {dummyStations.map((station) => {
        // Logic: Find if any charger is available
        const isAvailable = station.chargers.some(c => c.status === 'available');
        const isCharging = station.chargers.some(c => c.status === 'charging');

        // Set the "Master Status" for the pin
        let stationStatus = 'offline';
        if (isAvailable) stationStatus = 'available';
        else if (isCharging) stationStatus = 'charging';
        // You can add more complex logic here for malfunction etc.

        return (
          <Marker
            key={station.station_id}
            position={[station.lat, station.lng]}
            icon={getMarkerIcon(stationStatus)} // Apply the custom icon here
            eventHandlers={{
              click: () => {
                console.log("Marker clicked:",station.address);
                onStationClick(station); //this triggers the sidebar to open
              },
            }}
          >
            
          </Marker>
        );
      })}
    </MapContainer>
  );
}

