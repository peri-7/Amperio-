export const getMarkerIcon = (status) => {
  let color;

  switch (status) {
    case 'available': color = '#28a745'; break; // Green
    case 'charging': color = '#dc3545'; break;  // Red
    case 'reserved': color = '#ffc107'; break;  // Yellow/Orange
    case 'offline': color = '#6c757d'; break;   // Grey
    default: color = '#007bff';                 // Blue
  }

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9] 
  });
};