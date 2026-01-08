import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EmptyState = ({ message }) => (
  <div className="flex items-center justify-center h-full">
    <p className="text-gray-400 italic">{message}</p>
  </div>
)

const FinancialTab = ({data}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const monthlyData = data?.monthlyFinance || [];
  const stationData = data?.stationRevenue || [];

  if (!isMounted) {
    return <div className="h-80" />; // Placeholder to prevent layout shift
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      
      {/* Chart 1: Revenue vs Cost */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-w-0">
        <h3 className="text-[#7f8c8d] text-xs font-bold uppercase mb-6 tracking-widest">
         Revenue vs. Cost
        </h3>
        <div className="h-80 w-full min-h-[320px]">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                    dataKey="month_label" 
                    tick={{fill: '#7f8c8d', fontSize: 12}} 
                    axisLine={false} 
                    tickLine={false} 
                />
                <YAxis 
                    tick={{fill: '#7f8c8d', fontSize: 12}} 
                    axisLine={false} 
                    tickLine={false} 
                />
                <Tooltip 
                    cursor={{fill: '#f8f9fa'}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar dataKey="revenue" fill="#3498db" name="Revenue (€)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" fill="#bdc3c7" name="Wholesale Cost (€)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No monthly financial data found" />
          )}
        </div>
      </div>

      {/* Chart 2: Revenue by Station */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-w-0">
        <h3 className="text-[#7f8c8d] text-xs font-bold uppercase mb-6 tracking-widest">
          Revenue by Charging Station
        </h3>
        <div className="w-full">
          {stationData.length > 0 ? (
            <ResponsiveContainer width="100%"aspect={1.6}>
              <BarChart layout="vertical" data={stationData}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="station_name" 
                    type="category" 
                    width={100} 
                    tick={{fill: '#2c3e50', fontSize: 11, fontWeight: '600'}} 
                    axisLine={false} 
                    tickLine={false} 
                />
                <Tooltip cursor={{fill: '#f8f9fa'}} />
                <Bar dataKey="total_revenue" fill="#2ecc71" name="Gross Revenue (€)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No station revenue data found" />
          )}
        </div>
      </div>

    </div>
  );
};

export default FinancialTab;