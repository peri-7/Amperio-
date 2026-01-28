import { Link } from "react-router-dom";
import "../styles/About.css";

export default function About() {
  return (
    <div className="about-container">
      <div className="about-card">
        <h1 className="about-title">About Amperio</h1>
        <p className="about-intro">
          This is a comprehensive software engineering project developed for the <strong>ECE NTUA Software Engineering Course, 7th Semester</strong>.
        </p>

        <div className="about-content-section">
          <h2>Overview</h2>
          <p>
            The project showcases modern full-stack web development practices, combining frontend and backend technologies to create a functional, scalable electric vehicle charging station management system.
          </p>
        </div>

        <div className="about-content-section">
          <h2>Technology Stack</h2>
          <div className="tech-two-column">
            <div>
              <h3>Frontend</h3>
              <ul>
                <li>React with Vite</li>
                <li>React Router</li>
                <li>Axios API</li>
                <li>Recharts</li>
                <li>Leaflet Maps</li>
              </ul>
            </div>
            <div>
              <h3>Backend</h3>
              <ul>
                <li>Node.js Express</li>
                <li>MySQL Database</li>
                <li>JWT Auth</li>
                <li>RESTful API</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="about-content-section">
          <h2>Key Features</h2>
          <ul className="features-list">
            <li>User Authentication</li>
            <li>Interactive Station Map</li>
            <li>Admin Dashboard</li>
            <li>User Profile Management</li>
          </ul>
        </div>

        <div className="about-content-section">
          <h2>Developers</h2>
          <p>
            This was made by Anthropomorphic Potato, Nelly, Antoine, Horse and Fiction. 
          </p>
        </div>

        <Link to="/map" className="back-btn">
          Back to Map
        </Link>
      </div>
    </div>
  );
}
