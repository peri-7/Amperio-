
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapView() {
  return (
    <MapContainer
      center={[37.9838, 23.7275]}   // Athens
      zoom={13}
      style={{ height: "100%", width: "100%", }}
       // DEBUG
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[37.9838, 23.7275]}>
        <Popup>
          EV Charger <br /> 50kW – Available
        </Popup>
      </Marker>
    </MapContainer>
  );
}

