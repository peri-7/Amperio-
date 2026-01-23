export const getMarkerIcon = (status, isSelected = false) => {
  let color;

  switch (status) {
    case 'available': color = '#28a745'; break;
    case 'charging': color = '#dc3545'; break;
    case 'reserved': color = '#ffc107'; break;
    case 'offline': color = '#6c757d'; break;
    default: color = '#007bff';
  }

  // Determine border style based on selection
  const borderStyle = isSelected ? "3px solid black" : "2px solid white";
  const scale = isSelected ? "scale(1.3)" : "scale(1)";

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: ${borderStyle};
      transform: ${scale};
      transition: transform 0.2s ease-in-out;
      box-shadow: 0 0 5px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [24, 24], // Increased container size to accommodate the scale/border
    iconAnchor: [12, 12] 
  });
};