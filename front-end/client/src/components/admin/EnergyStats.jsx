import React, { useState, useEffect } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const EmptyState = ({ message }) => (
  <div className="flex items-center justify-center h-80">
    <p className="text-gray-400 italic">{message}</p>
  </div>
);

const EnergyTab = ({ data }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Data extraction based on the MVC model structure
  const heatmapData = data?.energyHeatmap || [];
  const scatterData = data?.powerEfficiency || [];

  const formatDecimal = (val) => (typeof val === 'number' ? val.toFixed(1) : val);

  if (!isMounted) {
    return <div className="h-80" />; 
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      
      {/* Chart 1: Hourly Energy Demand Heatmap */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-w-0">
        <h3 className="text-[#7f8c8d] text-xs font-bold uppercase mb-6 tracking-widest">
          Hourly Energy Demand (Grid Pressure)
        </h3>
        <div className="w-full">
          {heatmapData.length > 0 ? (
            <ResponsiveContainer width="100%" aspect={1.6}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  dataKey="hour" 
                  name="Hour" 
                  domain={[0, 23]} 
                  unit=":00"
                  tick={{fill: '#7f8c8d', fontSize: 12}}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="day" 
                  name="Day" 
                  allowDuplicatedCategory={false}
                  tick={{fill: '#2c3e50', fontSize: 11, fontWeight: '600'}}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <ZAxis type="number" dataKey="total_energy" range={[50, 450]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value, name) => [formatDecimal(value), name === 'total_energy' ? 'Total Energy' : name]}
                />
                <Scatter data={heatmapData}>
                  {heatmapData.map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.day}-${entry.hour}-${index}`}
                      fill={entry.total_energy > 100 ? '#3498db' : '#85c1e9'} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No demand heatmap data available" />
          )}
        </div>
      </div>

      {/* Chart 2: Power Rating vs Average Energy */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-w-0">
        <h3 className="text-[#7f8c8d] text-xs font-bold uppercase mb-6 tracking-widest">
          Power Rating vs. Avg Energy Delivery
        </h3>
        <div className="w-full">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" aspect={1.6}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  dataKey="charger_power" 
                  name="Charger Power" 
                  unit="kW"
                  tick={{fill: '#7f8c8d', fontSize: 12}}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  type="number" 
                  dataKey="avg_energy" 
                  name="Avg Energy" 
                  unit="kWh"
                  tick={{fill: '#7f8c8d', fontSize: 12}}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatDecimal}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value, name, props) => {
                      const key = props.dataKey;

                      if (key === 'avg_energy') {
                        return [value, 'Avg Energy (kWh)'];
                      }
                      
                      if (key === 'charger_power') {
                        return [value, 'Power (kW)'];
                      }

                      // Fallback for any other fields
                      return [formatDecimal(value), name];
                    }}

                />
              
                <Scatter 
                  name="Chargers" 
                  data={scatterData} 
                  fill="#e67e22" 
                  line={{ stroke: '#f39c12', strokeWidth: 1 }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No hardware efficiency data available" />
          )}
        </div>
      </div>

    </div>
  );
};

export default EnergyTab;