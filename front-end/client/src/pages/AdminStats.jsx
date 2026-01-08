import React, { useState, useEffect, useContext } from 'react';
import FinancialTab from '../components/admin/FinancialStats';
import EnergyTab from '../components/admin/EnergyStats';
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
  const [activeTab, setActiveTab] = useState('financial');
  const [data, setData] = useState({ monthlyFinance: [], stationRevenue: [], energyHeatmap: [], powerEfficiency: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 

  // Fetch data from the endpoint we created in the Controller
  useEffect(() => {
    const fetchStats = async () => {
      try {
       const res = await api.get('/adminStats/charts');
        setData(res.data);
        if (res.data) {
          const result = res.data.data || res.data; 
          setData(result);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);}
    };
    
    fetchStats();
  }, []);

if (loading) return <div className="profile-container"><div className="loading-screen">Loading statistics...</div></div>;
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
          <button className="btn-map" onClick={() => navigate('/map')}>
            Back to Map
          </button>
          <button className="btn-logout" onClick={() => { /* add logout logic */ }}>
            Logout
          </button>
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
        {activeTab === 'charger' && <PlaceholderTab name="Charger" />}
        {activeTab === 'user' && <PlaceholderTab name="User" />}
      </main>
    </div>
  );
};

export default AdminStats;