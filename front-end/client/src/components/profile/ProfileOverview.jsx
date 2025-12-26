import { useState, useEffect, useContext } from "react";
import api from "../../axiosConfig";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/profile/ProfileOverview.css"

const ProfileOverview = ({ profile}) => {

	const { logoutAction } = useContext(AuthContext);
	const [loading, setLoading] = useState(true);

	const [kpis, setKpis] = useState({
		totalSessions: 0, 
		totalEnergy: 0
		});
	const power = profile.default_charger_power;
	const [upcoming, setUpcoming] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Trigger both requests simultaneously
				const [kpiRes, upcomingRes] = await Promise.all([
					api.get("/userStats/kpis"),
					api.get("/reservations/upcoming")
				]);

				if(kpiRes) {
					setKpis(kpiRes.data);
				}
				if (upcomingRes.data && upcomingRes.data.length > 0) {
					setUpcoming(upcomingRes.data[0]);
				}
			} catch (err) {
				console.error("Error fetching overview data", err);
				if (err.response && err.response.status === 401) {
					logoutAction();
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return <div>...</div>
	}

	return (
		<div className="overview">
			{/* KPI Cards*/}	
			<div className="kpi-card">
				<h3>Total Sessions</h3>
				<p className="kpi-value">{kpis.totalSessions}</p>
			</div>
			<div className="kpi-card">
				<h3>Energy</h3>
				<p className="kpi-value">{kpis.totalEnergy} kWh</p>
			</div>

			
			{/* Upcoming Reservations */}	
			<div className="reservation">
				<h3>Upcoming Reservation</h3>
				{upcoming ? (
					<>
					<p className="rsv-info">Station: {upcoming.address}</p>
					<p className="rsv-info">Ends at: {new Date(upcoming.reservation_end_time).toLocaleString()}</p>
				</> 
				) : (
				<p className="rsv-info">No Upcoming Reservation</p> 
				)}
			</div>

			
			{/* Default charger power */}	
			<div className="charger-power">
				<h3>Default Charger Power</h3>
				{power ? (
					<p className="default-power">{power} kW</p>
				) : (
				<p className="default-power"> - </p>
				)}
			</div>
		</div>
	);
};

export default ProfileOverview;
