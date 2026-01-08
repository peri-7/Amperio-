import React, { useState, useEffect } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import "../../styles/profile/ProfileStats.css";

const EnergyTab = ({ data }) => {
  const [isMounted, setIsMounted] = useState(false);
  // State to switch between charts
  const [activeSubTab, setActiveSubTab] = useState('demand'); 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const heatmapData = data?.energyHeatmap || [];
  const scatterData = data?.powerEfficiency || [];
  const formatDecimal = (val) => (typeof val === 'number' ? val.toFixed(1) : val);

  if (!isMounted) return <div className="stats-loading">Loading charts...</div>;

  return (
    <div className="full-page-content animate-fadeIn">
      
      {/* Sub-Navigation Buttons */}
      <div className="flex gap-4 mb-4">
        <button 
          onClick={() => setActiveSubTab('demand')}
          className={`btn-tab ${activeSubTab === 'demand' ? 'active' : ''}`}
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          Demand Heatmap
        </button>
        <button 
          onClick={() => setActiveSubTab('efficiency')}
          className={`btn-tab ${activeSubTab === 'efficiency' ? 'active' : ''}`}
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          Hardware Efficiency
        </button>
      </div>

      <div className="stats-grid full-height">
        {activeSubTab === 'demand' && (
          <div className="chart-card full-size">
            <h3>Hourly Energy Demand (Grid Pressure)</h3>
            <div style={{ width: '100%', flex: 1 }}>
              {heatmapData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dcdcdc" />
                    <XAxis 
                      type="number" dataKey="hour" name="Hour" domain={[0, 23]} unit=":00"
                      tick={{fill: '#555', fontSize: 12}} axisLine={false} tickLine={false}
                    />
                    <YAxis 
                      type="category" dataKey="day" name="Day" allowDuplicatedCategory={false}
                      tick={{fill: '#2c3e50', fontSize: 11, fontWeight: '600'}}
                      axisLine={false} tickLine={false} width={80}
                    />
                    <ZAxis type="number" dataKey="total_energy" range={[50, 450]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                      formatter={(value, name) => [formatDecimal(value), name === 'total_energy' ? 'Total Energy' : name]}
                    />
                    <Scatter data={heatmapData}>
                      {heatmapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.total_energy > 100 ? '#b59f0b' : '#F3D55B'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                  No demand heatmap data available
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'efficiency' && (
          <div className="chart-card full-size">
            <h3>Power Rating vs. Avg Energy Delivery</h3>
            <div style={{ width: '100%', flex: 1 }}>
              {scatterData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dcdcdc" />
                    <XAxis 
                      type="number" dataKey="charger_power" name="Charger Power" unit="kW"
                      tick={{fill: '#555', fontSize: 12}} axisLine={false} tickLine={false}
                    />
                    <YAxis 
                      type="number" dataKey="avg_energy" name="Avg Energy" unit="kWh"
                      tick={{fill: '#555', fontSize: 12}} axisLine={false} tickLine={false}
                      tickFormatter={formatDecimal}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                      formatter={(value, name, props) => {
                        const key = props.dataKey;
                        if (key === 'avg_energy') return [value, 'Avg Energy (kWh)'];
                        if (key === 'charger_power') return [value, 'Power (kW)'];
                        return [formatDecimal(value), name];
                      }}
                    />
                    <Scatter 
                      name="Chargers" data={scatterData} fill="#c0bea0" 
                      line={{ stroke: '#9a987d', strokeWidth: 2 }} 
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                  No hardware efficiency data available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnergyTab;