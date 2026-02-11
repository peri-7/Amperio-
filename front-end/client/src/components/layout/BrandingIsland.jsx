import amperiologo from "/amperiologo.png";

// components/layout/BrandingIsland.jsx
export default function BrandingIsland() {
  return (
    <div className="branding-island">
      <div className="mascot-container">
        {/* Replace with your actual mascot image */}
        <img src={amperiologo} alt="Amperio Mascot" className="mascot-img" />
      </div>
    </div>
  );
}