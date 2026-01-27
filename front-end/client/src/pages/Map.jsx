import { useState, useEffect, useContext } from "react";
import api from "../axiosConfig";
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
  const { user } = useContext(AuthContext);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await api.get(`/station`);
        setStations(response.data);
      } catch (error) {
        console.error("Error fetching pins", error);
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
    score: []
  });

  const handleSearch = async (updatedFilters) => {
    const newFilters = { ...filters, ...updatedFilters }; /*merges old filters with new ones so we can check multiple at once*/

    // Convert array filters to comma-separated strings for URL
    const filterForURL = { ...newFilters };
    if (Array.isArray(filterForURL.facilities) && filterForURL.facilities.length > 0) {
      filterForURL.facilities = filterForURL.facilities.join(',');
    } else {
      filterForURL.facilities = '';
    }
    if (Array.isArray(filterForURL.power) && filterForURL.power.length > 0) {
      filterForURL.power = filterForURL.power.join(',');
    } else {
      filterForURL.power = '';
    }
    if (Array.isArray(filterForURL.connector) && filterForURL.connector.length > 0) {
      filterForURL.connector = filterForURL.connector.join(',');
    } else {
      filterForURL.connector = '';
    }
    if (Array.isArray(filterForURL.score) && filterForURL.score.length > 0) {
      filterForURL.score = filterForURL.score.join(',');
    } else {
      filterForURL.score = '';
    }

    // Clean the filters: convert undefined or null to empty string
    const cleanedFilters = Object.fromEntries(
      Object.entries(filterForURL).map(([key, val]) => [key, val ?? ""])
    );

    setFilters(newFilters);

    try {
      const response = await api.get(`/station/search`, { params: cleanedFilters });
      setStations(response.data); /* we update the stations, which are handled by mapview.jsx*/
    } catch (error) {
      console.error("Server Error:", error.response ? error.response.status : error.message);
    }
  };

  useEffect(() => {
    // Sync filters with user's default settings.
    // This effect runs when the user's default settings change.
    const updates = {};
    if (user?.default_charger_power && !filters.power.includes(Number(user.default_charger_power))) {
      updates.power = [Number(user.default_charger_power)];
    }
    if (user?.default_connector_type && !filters.connector.includes(user.default_connector_type)) {
      updates.connector = [user.default_connector_type];
    }

    if (Object.keys(updates).length > 0) {
      handleSearch(updates);
    }
  }, [user?.default_charger_power, user?.default_connector_type]);


  const handleMarkerClick = async (station) => {
    setSelectedStation(station);
    setSidebarVisible(false);
    try {
      const res = await api.get(`/station/${station.station_id}`);
      setTimeout(() => {
        setSelectedStation(res.data);
        setSidebarVisible(true);
      }, 2000);
    } catch (err) {
      console.error("Error fetching details:", err);
      setSelectedStation(null);
    }
  };

  return (
    <>
      <div style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden" }}>
        {/*the floating UI layer*/}
        {/*these will sit on top of the map because of their z-index*/}
        <div className="map-overlay-wrapper">
          <BrandingIsland />
          <FloatingSearch onSearch={handleSearch} filters={filters} stations={stations} onStationClick={handleMarkerClick} />
          <UserIsland />
        </div>

        {/* the map */}
        <MapView stations={stations} onStationClick={handleMarkerClick} selectedStation={selectedStation} />

        {/* The Sliding Side Block & Overlay */}
        {selectedStation && sidebarVisible && (
          <StationDetails
            station={selectedStation}
            onClose={() => {
              setSelectedStation(null);
              setSidebarVisible(false);
            }}
          />
        )}
      </div>
    </>
  );
}
