import {useState} from "react";
import Navbar from "../components/layout/navbar";
import MapView from "../components/map/mapview";
import StationDetails from "../components/map/StationDetails";

export default function Map() {
  const [selectedStation, setSelectedStation] = useState(null);
  return (
    <>
      <Navbar />
      <div style={{ position: "relative" ,height: "calc(100vh - 56px)", marginTop: "56px" ,width: "100vw", }}>
        {/* Pass the setter function to the Map */}
        <MapView onStationClick={setSelectedStation} />
        
        {/* The Sliding Side Block & Overlay */}
        {selectedStation && ( //when selected station becomes not null, the side block opens
          <StationDetails 
            station={selectedStation}  //we pass the data into the sidebar to show it
            onClose={() => setSelectedStation(null)} 
          />
        )}
      </div>
    </>
  );
}

