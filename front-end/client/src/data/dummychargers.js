export const dummyStations = [
  {
    station_id: 3,
    address: "Syntagma Square, Athens",
    lat: 37.9755,
    lng: 23.7348,
    postal_code: 10563,
    facilities: "Cafe, WiFi, Hotel",
    chargers: [
      { id: 101, power: 50, charger_status: "available", connector_id: 3 },
      { id: 102, power: 50, charger_status: "charging", connector_id: 3 },
      { id: 103, power: 22, charger_status: "available", connector_id: 1 }
    ]
  },
  {
    station_id: 4,
    address: "Glyfada Center, Lazaraki",
    lat: 37.8631,
    lng: 23.7578,
    postal_code: 16674,
    facilities: "Shopping Mall, Restaurants",
    chargers: [
      { id: 201, power: 120, charger_status: "available", connector_id: 1 },
      { id: 202, power: 120, charger_status: "reserved", connector_id: 1 },
      { id: 203, power: 50, charger_status: "malfunction", connector_id: 2 }
    ]
  },
  {
    station_id: 5,
    address: "Marousi - Neratziotissa",
    lat: 38.0435,
    lng: 23.7915,
    postal_code: 15124,
    facilities: "Public Transport, Mall",
    chargers: [
      { id: 301, power: 350, charger_status: "available", connector_id: 2 },
      { id: 302, power: 350, charger_status: "charging", connector_id: 2 },
      { id: 303, power: 22, charger_status: "offline", connector_id: 1 }
    ]
  }
];