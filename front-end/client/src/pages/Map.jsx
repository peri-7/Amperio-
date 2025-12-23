import {useState, useEffect} from "react";
import Navbar from "../components/layout/navbar";
import MapView from "../components/map/mapview";
import StationDetails from "../components/map/StationDetails";
import 'leaflet/dist/leaflet.css';

export default function Map() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(`http://localhost:9876/api/station`);
        const data = await response.json();
        setStations(data);
      } catch(error) {
        console.error("Error fetching pins",error);
      }
    };
    fetchStations();
  }, []);


  const handleMarkerClick = async (station) => {
    try {
      const res = await fetch(`http://localhost:9876/api/station/${station.station_id}`);
      const detailedData = await res.json();
      setSelectedStation(detailedData);
    } catch (err) {
      console.error("Error fetching details:",err);
    } 
  };

  return (
    <>
      <Navbar />
      <div style={{ position: "relative" ,height: "calc(100vh - 56px)", marginTop: "56px" ,width: "100vw", }}>
        {/* Pass the setter function to the Map */}
        <MapView stations = {stations} onStationClick={handleMarkerClick} />
        
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

