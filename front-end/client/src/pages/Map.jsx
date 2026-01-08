import {useState, useEffect } from "react"; 
import { AuthContext } from "../context/AuthContext"; 
import FloatingSearch from "../components/layout/FloatingSearch"; 
import BrandingIsland from "../components/layout/BrandingIsland";
import UserIsland from "../components/layout/UserIsland";
import MapView from "../components/map/mapview";
import StationDetails from "../components/map/StationDetails";
import 'leaflet/dist/leaflet.css';
import '../styles/MapOverlay.css';

export default function Map() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]); /*this stores the filtered station list*/

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

  // map.jsx
const [filters, setFilters] = useState({
  q: "",
  power: [],
  connector: [],
  available: false,
  facilities: [],
  score : []
});

const handleSearch = async (updatedFilters) => {
  const newFilters = { ...filters, ...updatedFilters }; /*merges old filters with new ones so we can check multiple at once*/
  
  // Convert facilities array to comma-separated string for URL
  const filterForURL = { ...newFilters };
  if (Array.isArray(filterForURL.facilities) && filterForURL.facilities.length > 0) {
    filterForURL.facilities = filterForURL.facilities.join(',');
  } else {
    filterForURL.facilities = '';
  }
  
  // Clean the filters: convert undefined or null to empty string
  const cleanedFilters = Object.fromEntries(
    Object.entries(filterForURL).map(([key, val]) => [key, val ?? ""])
  );
  
  setFilters(newFilters);

  const params = new URLSearchParams(cleanedFilters).toString(); /*This turns { q: "Tesla", power: 50 } into a URL string: ?q=Tesla&power=50.*/
  const response = await fetch(`http://localhost:9876/api/station/search?${params}`);

  // 1. Check if the response is actually OK (200-299)
  if (!response.ok) {
     console.error("Server Error:", response.status);
     return; 
  }

  // 2. Check if the response is actually JSON
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text(); // Read the HTML error to see what happened
      console.error("Received HTML instead of JSON:", text);
      return;
  }

  const data = await response.json();
  setStations(data); /* we update the stations, which are handled by mapview.jsx*/
};

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
      <div style={{ position: "relative" ,height: "100vh" ,width: "100vw", overflow: "hidden"}}>
        {/*the floating UI layer*/}
        {/*these will sit on top of the map because of their z-index*/}
        <div className="map-overlay-wrapper"> 
        <BrandingIsland />
        <FloatingSearch onSearch = {handleSearch} filters={filters} stations={stations} onStationClick={handleMarkerClick} />
        <UserIsland />
        </div>
        
        {/* the map */}
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

