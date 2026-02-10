
//Utility to extract and generate data for Station and Charger tables
 
//facilities pool
const FACILITIES = [
    "Grocery Store", "Local Cafe", "Children's Playground", "Pharmacy", 
    "24-Hour Gym", "Full-Service Restaurant", "Boutique Hotel", "Shopping Mall", 
    "Public Library", "ATM / Banking Hub", "Self-Service Laundry", "Hair Salon", 
    "Movie Theater", "Public Park Area", "Food Court", "Post Office", 
    "Automated Car Wash", "24/7 Convenience Store", "Tourist Information Desk", 
    "Co-working Space"
];

//fixed charger configurations
const CHARGER_CONFIGS = [
    { power: 11, connectors: ["Type 2"] },
    { power: 22, connectors: ["Type 2"] },
    { power: 50, connectors: ["CCS2", "CCS1", "CHAdeMO"] },
    { power: 120, connectors: ["CCS2", "CCS1"] },
    { power: 180, connectors: ["CCS2", "CCS1"] }
];

const CHARGER_STATUS = ['available', 'charging', 'reserved', 'malfunction', 'offline'];

const RATINGS = [1, 2, 3, 4];

//extraction function
const JsonToDb = (entry) => {
    // extract postal code from address 
    const pcMatch = entry.address.match(/\d{3}\s?\d{2}/);
    let postal_code = null;
    if (pcMatch) {
        postal_code = parseInt(pcMatch[0].replace(/\s/g, ''));
    }

    // generate Google Maps Link
    const google_maps_link = `https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`;

    // 3. Station Object
    const stationData = {
        station_id: entry.id,
        station_name: entry.name,
        address: entry.address,
        longitude: entry.longitude,
        latitude: entry.latitude,
        postal_code: postal_code,
        facilities: [...FACILITIES].sort(() => 0.5 - Math.random()).slice(0, 3).join(', '), // Randomly select 3 facilities
        google_maps_link: google_maps_link,
        score: parseFloat((Math.random() * 4 + 1).toFixed(1))// random score between 1.0 and 5.0
    };

    // 4. Extract Chargers from nested 'stations' and 'outlets'
    const chargers = [];

    entry.stations.forEach(s => {
        s.outlets.forEach(outlet => {
            //select power-connector configuration\
            const randomCfg = CHARGER_CONFIGS[Math.floor(Math.random() * CHARGER_CONFIGS.length)];
            const randomConnector = randomCfg.connectors[Math.floor(Math.random() * randomCfg.connectors.length)];
            chargers.push({
                charger_id: outlet.id,
                power: randomCfg.power,
                connector_type: randomConnector,
                station_id: entry.id,
                installed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                last_checked: new Date().toISOString().slice(0, 19).replace('T', ' '),
                charger_status: CHARGER_STATUS[Math.floor(Math.random() * CHARGER_STATUS.length)],
                current_price: null
            });
        });
    });

    return { stationData, chargers };
};

module.exports = { JsonToDb, FACILITIES, RATINGS };