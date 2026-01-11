import { useEffect, useState, useContext } from "react"; // Added useContext
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { format, parseISO, getHours } from "date-fns"; 
import { AuthContext } from "../../context/AuthContext"; // Added AuthContext
import api from "../../axiosConfig";
import "../../styles/profile/ProfileStats.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const ProfileStats = () => {
  const { logoutAction } = useContext(AuthContext); // 2. ADDED: Get logout function

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    monthly: [],
    timeOfDay: [],
    stations: []
  });

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const res = await api.get("/userStats/charts");
        processData(res.data);
      } catch (err) {        
	console.error("Error fetching stats data", err);
        if (err.response && err.response.status === 401) {
          logoutAction();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();  
  }, []);

  const processData = (sessions) => {
    const monthlyMap = {};
    const timeOfDayMap = { Dawn: 0, Morning: 0, Noon: 0, Afternoon: 0, Evening: 0, Night: 0 };
    const stationMap = {};

    sessions.forEach((session) => {
      const date = parseISO(session.start_time);
      const monthKey = format(date, "yyyy-MM");
      const hour = getHours(date);

      // Line Charts data
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, money: 0, energy: 0 };
      }
      const cost = parseFloat(session.energy_delivered) * parseFloat(session.price_per_kwh);
      monthlyMap[monthKey].money += cost; 
      monthlyMap[monthKey].energy += parseFloat(session.energy_delivered);

      // Bar Chart data
      if (hour >= 5 && hour < 9) timeOfDayMap.Dawn++;
      else if (hour >= 9 && hour < 13) timeOfDayMap.Morning++; 
      else if (hour >= 13 && hour < 16) timeOfDayMap.Noon++;
      else if (hour >= 16 && hour < 18) timeOfDayMap.Afternoon++;
      else if (hour >= 18 && hour < 22) timeOfDayMap.Evening++;
      else timeOfDayMap.Night++;

      // Pie Chart data
      const stationName = session.station_name; {/*? session.Station.address : `Station ${session.station_id}`;*/}
      stationMap[stationName] = (stationMap[stationName] || 0) + 1;
    });

    // Objectify the lists
    const monthlyArray = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    const timeArray = Object.keys(timeOfDayMap).map((key) => ({
      name: key,
      count: timeOfDayMap[key],
    }));

    const stationArray = Object.keys(stationMap)
      .map((key) => ({ name: key, value: stationMap[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setStatsData({
      monthly: monthlyArray,
      timeOfDay: timeArray,
      stations: stationArray,
    });
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (statsData.monthly.length === 0) {
    return (
      <div className="no-stats-container">
        <p className="no-stats-message">Start charging and comeback to check your activity</p>
      </div>
    );
  }

  return (
    <div className="stats-grid">
      {/* 1. Money/month chart */}
      <div className="chart-card">
        <h3>Money Spent / Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={statsData.monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickFormatter={(str) => format(parseISO(str + "-01"), "MMM yyyy")} />
            <YAxis unit="€" />
            <Tooltip formatter={(value) => `${value.toFixed(2)}€`} />
            <Legend />
            <Line type="monotone" dataKey="money" stroke="#8884d8" name="Cost (€)" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Energy/month chart */}
      <div className="chart-card">
        <h3>Energy Consumed (Monthly)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={statsData.monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickFormatter={(str) => format(parseISO(str + "-01"), "MMM yyyy")} />
            <YAxis unit="kWh" />
            <Tooltip formatter={(value) => `${value.toFixed(1)} kWh`} />
            <Legend />
            <Line type="monotone" dataKey="energy" stroke="#82ca9d" name="Energy (kWh)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Sessions by Time of Day */}
      <div className="chart-card">
        <h3>Sessions by Time of Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statsData.timeOfDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#ffc658" name="Sessions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Favorite Stations */}
      <div className="chart-card">
        <h3>Favorite Stations</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statsData.stations}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statsData.stations.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfileStats;
