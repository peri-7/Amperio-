
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import api from "../axiosConfig"; 
import { AuthContext } from "../context/AuthContext";
import ProfileOverview from "../components/profile/ProfileOverview";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileSettings from "../components/profile/ProfileSettings";
import "../styles/profile/Profile.css";


const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const { logoutAction } = useContext(AuthContext);

  const handleLogout = () => {
    logoutAction();
    navigate("/map");   
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile", err);
        // If the token is invalid (e.g. expired), maybe log them out automatically?
        if (err.response && err.response.status === 401) {
            logoutAction();
        }
      } finally {
	  setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  if (!profile) {
    return <div className="error-screen">Could not load profile data.</div>;
  }

  return (
    <div className="profile-container">
	
	{/*header - global to the page */}
	<header className="profile-header">
	  <div className="header-left">
	    <h1>Hello, {profile.username}</h1>
	    <p className="subtitle">Profile</p>
	  </div>
	  <div className="header-right">
	    <button className="btn-map" onClick={() => navigate("/map")}>Map</button>
	    <button className="btn-logout" onClick={handleLogout}>Logout</button>
	  </div>
	</header>


	{/* Tab Buttons*/}
	<div className="tab-wrapper">
	  <button 
	  	className={`btn-tab ${activeTab === "Overview" ? "active" : "" }`}
	  	onClick={() => setActiveTab("Overview")}>Overview</button>
	  <button 
	  	className={`btn-tab ${activeTab === "Stats" ? "active" : "" }`}
	  	onClick={() => setActiveTab("Stats")}>Stats</button>
	  <button 
	  	className={`btn-tab ${activeTab === "Settings" ? "active" : "" }`}
	  	onClick={() => setActiveTab("Settings")}>Settings</button>
	</div>

	{/* Actual Content */}
	<div className="tab-content">
	  {activeTab === "Overview" && <ProfileOverview profile={profile} />}
	  {activeTab === "Stats" && <ProfileStats />}
	  {/* FIXME - not yet implemented */}
	  {activeTab === "Settings" && <ProfileSettings />}
	</div>

     </div>
  );
};

export default Profile;
