import React, { useState, useEffect, useContext } from 'react';
import FinancialTab from '../components/admin/FinancialStats';
import EnergyTab from '../components/admin/EnergyStats';
import ChargerTab from '../components/admin/ChargerStats'; // New Component
import api from "../axiosConfig"; 
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/profile/Profile.css";

const PlaceholderTab = ({ name }) => (
  <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-800 rounded-xl">
    <h2 className="text-xl font-semibold mb-2">{name} Statistics</h2>
    <p>This module is currently under development.</p>
  </div>
);

const AdminStats = () => {
  const navigate = useNavigate();
  const { logoutAction } = useContext(AuthContext);
  
  // State Management
  const [activeTab, setActiveTab] = useState('financial');
  const [selectedCharger, setSelectedCharger] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ 
    monthlyFinance: [], 
    stationRevenue: [], 
    energyHeatmap: [], 
    powerEfficiency: [],
    chargerList: [],
    healthUptime: [],
    failureHistory: []
  });

  const handleLogout = () => {
    logoutAction();
    navigate("/map");
  };

  // Main Data Fetcher
  const fetchStats = async (chargerId = '') => {
    try {
      setLoading(true);
      // Construct URL with optional chargerId query param
      const url = chargerId 
        ? `/adminStats/charts?chargerId=${chargerId}` 
        : '/adminStats/charts';
        
      const res = await api.get(url);
      
      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        setData(res.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchStats();
  }, []);

  // Re-fetch when selectedCharger changes (specifically for Graph A & B)
  const handleChargerChange = (id) => {
    setSelectedCharger(id);
    fetchStats(id);
  };

  if (loading && !data.chargerList.length) return <div className="profile-container"><div className="loading-screen">Loading statistics...</div></div>;
  if (error) return <div className="profile-container"><div className="error-screen">{error}</div></div>;

  return (
    <div className="profile-container">
      {/* Header Section */}
      <header className="profile-header">
        <div className="header-left">
          <h1>Business Analytics</h1>
          <p className="subtitle">Overview of network performance and revenue</p>
        </div>
        <div className="header-right">
          <button className="btn-map" onClick={() => navigate('/profile')}>Profile</button>
          <button className="btn-map" onClick={() => navigate('/map')}>Map</button>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-wrapper">
        {['Financial', 'Energy', 'Charger', 'User'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`btn-tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
          >
            {tab} Stats
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main className="tab-content">
        {activeTab === 'financial' && <FinancialTab data={data} />}
        {activeTab === 'energy' && <EnergyTab data={data} />}
        
        {activeTab === 'charger' && (
          <ChargerTab 
            data={data} 
            selectedCharger={selectedCharger} 
            onChargerChange={handleChargerChange} 
            isLoading={loading}
          />
        )}

        {activeTab === 'user' && <PlaceholderTab name="User" />}
      </main>
    </div>
  );
};

export default AdminStats;