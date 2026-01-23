import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { getMarkerIcon } from "../../utils/mapIcons";
import { useEffect } from "react";

//zooming on selected station
function SetViewOnStation({ selectedStation }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedStation?.latitude && selectedStation?.longitude) {
      //zoom in
      map.flyTo(
        [selectedStation.latitude, selectedStation.longitude], 
        16, 
        { animate: true, duration: 1.8 }
      );
    } else if (!selectedStation) {
      // zoom out
      map.flyTo(
        [37.9838, 23.7275], 
        13, 
        { animate: true, duration: 1.5 }
      );
    }
  }, [selectedStation, map]);

  return null;
}

export default function MapView({stations, onStationClick,selectedStation}) {
  return (
    <MapContainer //boss component , creates the map object
      center={[37.9838, 23.7275]}   // Athens
      zoom={13} //1 is the whole world, 18 is a street corner, 13 a city view
      style={{ height: "100%", width: "100%", }}
    // DEBUG
    >
      <TileLayer
	attribution='&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	url='https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}{r}.png?apikey=fb7a93ebc29a49cf9a8d94e56c00af61'
      />

      {stations && stations.map((station) => {
        const isSelected = selectedStation?.station_id === station.station_id;
        return (
          <Marker
            key={station.station_id}
            position={[station.latitude, station.longitude]}
            //use the status directly from the databse result
            icon={getMarkerIcon(station.station_status,isSelected)} // Apply the custom icon here
            eventHandlers={{
              click: () => {
                onStationClick(station); //this triggers the sidebar to open
              },
            }}
          >
          </Marker>
        );
      })}
      <SetViewOnStation selectedStation={selectedStation} />
    </MapContainer>
  );
}

