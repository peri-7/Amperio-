// const cron = require('node-cron');
const { XMLParser } = require('fast-xml-parser');
const Charger = require('../models/chargerModel');
const db = require('../config/db');

//Price fetching function that runs once a day
const getPrices = async (req, res, next) => {
    try {

        //get current date and time in required format YYYYMMDD0000
        const now = new Date();
        const year = now.getFullYear();
        let month = now.getMonth() + 1;
        if (month < 10) month = `0${month}`;
        let day = now.getDate();
        if (day < 10) day = `0${day}`;

        const periodStart = `${year}${month}${day}2000`;
        const periodEnd   = `${year}${month}${day}2300`;

        //set up url parameters
        const url = "https://web-api.tp.entsoe.eu/api"
        const ENTSOE_TOKEN = process.env.ENTSOE_TOKEN;
        const documentType = "A44";
        const Domain = "10YGR-HTSO-----Y";
        const urlWithParams = `${url}?documentType=${documentType}&in_Domain=${Domain}&out_Domain=${Domain}&periodStart=${periodStart}&periodEnd=${periodEnd}&securityToken=${ENTSOE_TOKEN}`;

        //fetch data from ENTSOE
        const response = await fetch(urlWithParams);
        const xmlText = await response.text();

        const parser = new XMLParser();
        const parsedResult = parser.parse(xmlText);

        //Try parsing the XML response assuming ENTSOE API is working
        try{
            const rawPoints = [].concat(parsedResult.Publication_MarketDocument.TimeSeries.Period.Point);
            rawPoints.sort((a, b) => Number(a.position) - Number(b.position));

            const prices = [];
            let lastPosition = null;
            let lastPrice = null;

            rawPoints.forEach(p => {
                const currentPos = Number(p.position);
                const currentPrice = Number(p['price.amount']);

                //If this is not the first item, check for gaps
                if (lastPosition !== null) {

                    //Calculate missing points
                    const gapSize = currentPos - lastPosition - 1;

                    if (gapSize > 0) {
                        //Fill gaps with last known price
                        for (let i = 0; i < gapSize; i++) {
                            prices.push(lastPrice);
                        }
                    }
                }
                
                prices.push(currentPrice);

                lastPosition = currentPos;
                lastPrice = currentPrice;
            });

            return prices;
        } catch (err) {
            console.log("Error parsing ENTSOE response, possibly due to API issues:", err);
            return null;
        }
        //currently the prices are returned in a list so prices[0] is 23:00-23:15 in UTC time which is 
        //actually the price for 01:00-01:15 in Greece local time (UTC+2)

    } catch (err) {
        console.error("Error fetching prices:", err);
    }
};

//Save daily prices to database
const savePriceList = async (prices) => {
    try {
        if (!prices) {
            console.error("Prices not fetched yet.");
            return;
        }
        const sql = 'INSERT INTO EnergyPricingHistory (time_ref, current_price) VALUES (?, ?)';
        const now = new Date();
        for (let i = 0; i < prices.length; i++) {

            //handle day change
            let day = now.getDate();
            let hour = Math.floor((1 + i/4) % 24);
            if (hour == 0) day++;
            
            const timeRef = new Date(now.getFullYear(), now.getMonth(), day,  hour, 15*(i%4), 0); // Greece local time (UTC+2)
            await db.query(sql, [toSqlDateTime(timeRef), prices[i]]);
            console.log(`Saved price for ${toSqlDateTime(timeRef)}: ${prices[i]} €/MWh`);
        }

    } catch (error) {
        console.error("Error saving prices to database:", error);//use the next thing for this?
    }
};

//Get price to update charger data
const fetchCurrentPrice = async () => {
    try {
        const sql = 'SELECT current_price FROM EnergyPricingHistory WHERE time_ref <= NOW() ORDER BY time_ref DESC LIMIT 1;';
        const [rows] = await db.query(sql);

        if(rows.length === 0){
            console.log("No price data found in database.");
            return null;
        }
        console.log("Fetched current price:", rows[0].current_price);
        return rows[0].current_price;
    } catch (error) {
        console.error("Error fetching current price from database:", error);
        return null;
    }  
};

//Upadte Charger point prices in the database every 15 minutes
const updateChargerPointPrices = async () => {

    //Get current price converted to KWh
    const current_price = Number((await fetchCurrentPrice() / 1000).toFixed(3));
    if (!current_price) {
        let chargers = await Charger.getAllChargers();

        chargers.forEach(async c => {
        await Charger.setKwhPrice(c.pointid, current_price);
        });
    }
};

//Lil helper function
function toSqlDateTime(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Athens',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));

  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

module.exports = { getPrices, savePriceList, fetchCurrentPrice, updateChargerPointPrices };


