import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="nav-left">
        <span className="logo">Amperio</span>
      </div>

      {/* Desktop links */}
      <nav className="nav-right desktop">
        <Link to="/profile">Profile</Link>
        <Link to="/about">About</Link>
      </nav>

      {/* Hamburger (mobile) */}
      <button className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="mobile-menu">
          <Link to="/profile" onClick={() => setOpen(false)}>Profile</Link>
          <Link to="/about" onClick={() => setOpen(false)}>About</Link>
        </div>
      )}
    </header>
  );
}
