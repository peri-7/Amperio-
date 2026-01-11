import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import "../../styles/profile/ProfileStats.css";

const ChargerStats = ({ data, selectedCharger, onChargerChange, isLoading }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('uptime');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Helper: Format seconds to readable string ---
  const formatDuration = (totalSeconds) => {
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);

    return parts.join(' ');
  };

  // --- Shared Tooltip Style for consistent "White Block" look ---
  const tooltipStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    padding: '12px'
  };

  const chargerList = data?.chargerList || [];
  const filteredChargers = useMemo(() => {
    return chargerList.filter(c => 
      c.charger_id.toString().includes(searchTerm) || 
      c.station_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chargerList, searchTerm]);

  const uptimeData = (data?.healthUptime || [])
    .map(d => ({
      status: d.status.toLowerCase(),
      total_seconds: Number(d.total_seconds)
    }))
    .filter(d => d.total_seconds > 0);

  const failureData = (data?.failureHistory || [])
    .map(d => ({
      ...d,
      failure_count: Number(d.failure_count)
    }));

  const statusColors = {
    available: '#4CAF50',
    charging: '#2196F3',
    reserved: '#FFC107',
    malfunction: '#F44336',
    offline: '#9E9E9E'
  };

  if (!isMounted) return <div className="stats-loading">Loading hardware analytics...</div>;

  return (
    <div className="full-page-content animate-fadeIn">
      
      {/* Sub-Navigation & Search Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveSubTab('uptime')}
            className={`btn-tab ${activeSubTab === 'uptime' ? 'active' : ''}`}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            Uptime Analysis
          </button>
          <button 
            onClick={() => setActiveSubTab('failures')}
            className={`btn-tab ${activeSubTab === 'failures' ? 'active' : ''}`}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            Failure History
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="text"
            placeholder="Search ID or Station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
          <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
            <select 
              value={selectedCharger} 
              onChange={(e) => onChargerChange(e.target.value)}
              className="bg-transparent text-gray-800 text-sm border-none focus:ring-0 cursor-pointer font-semibold min-w-[180px]"
            >
              <option value="">-- {filteredChargers.length} Result(s) --</option>
              {filteredChargers.map(c => (
                <option key={c.charger_id} value={c.charger_id}>
                  ID: {c.charger_id} - {c.station_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="stats-grid full-height">
        {activeSubTab === 'uptime' && (
          <div className="chart-card full-size">
            <div className="flex justify-between items-center">
              <h3>Health Distribution (Time-in-State)</h3>
              {isLoading && <span className="text-xs text-blue-500 animate-pulse">Refreshing...</span>}
            </div>
            <div style={{ width: '100%', flex: 1 }}>
              {uptimeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={uptimeData}
                      dataKey="total_seconds"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={5}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {uptimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#333'} />
                      ))}
                    </Pie>
                    {/* UPDATED TOOLTIP: Uses standard component with styling and formatter */}
                    <Tooltip 
                      contentStyle={tooltipStyle}
                      formatter={(value, name) => [formatDuration(value), name.toUpperCase()]}
                      itemStyle={{ color: '#111827', fontWeight: '600', fontSize: '0.9rem' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                  {selectedCharger ? "No health data found" : "Search and select hardware to view data"}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'failures' && (
          <div className="chart-card full-size">
            <div className="flex justify-between items-center">
              <h3>Monthly Malfunction Incidents</h3>
              {isLoading && <span className="text-xs text-red-500 animate-pulse">Refreshing...</span>}
            </div>
            <div style={{ width: '100%', flex: 1 }}>
              {failureData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={failureData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dcdcdc" />
                    <XAxis dataKey="month_label" tick={{fill: '#555', fontSize: 12}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill: '#555', fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false}/>
                    {/* Tooltip using the same shared style variable */}
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.05)'}} 
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="failure_count" name="Incidents" fill="#333333" radius={[4, 4, 0, 0]} barSize={40}/>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                  No failure incidents recorded
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChargerStats;