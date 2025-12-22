
-- View for endpoint A -----------------------------------
CREATE VIEW Points AS
SELECT 
	'AmperioInc' AS providerName, 
	c.charger_id AS pointid, 
	CAST(s.longitude AS CHAR) AS lon, 
	CAST(s.latitude AS CHAR) AS lat, 
	c.charger_status AS status, 
	c.power AS cap
FROM Charger c
	JOIN Station s ON c.station_id = s.station_id;



-- View for endpoint B ------------------------------------
CREATE VIEW PointDetail AS
SELECT 
	c.charger_id AS pointid,
	CAST(s.longitude AS CHAR) AS lon,
	CAST(s.latitude AS CHAR) AS lat,
	c.charger_status AS status,
	c.power AS cap,
	COALESCE(
		(SELECT reservation_end_time 
			FROM Reservation r 
			WHERE r.charger_id = c.charger_id 
			AND r.reservation_end_time > NOW() 
			ORDER BY r.reservation_end_time DESC LIMIT 1),
		NOW()
	) AS reservationendtime,
	CAST(c.current_price AS float) AS kwhprice
FROM Charger c
	JOIN Station s ON c.station_id = s.station_id;


-- View for endpoint F -----------------------------------
CREATE OR REPLACE VIEW Sessions AS
SELECT 
 	charger_id, -- Keep this for filtering in WHERE clause
    	DATE_FORMAT(start_time, '%Y-%m-%d %H:%i') AS starttime,
    	DATE_FORMAT(end_time, '%Y-%m-%d %H:%i') AS endtime,
    	start_soc AS startsoc,
    	end_soc AS endsoc,
    	CAST(energy_delivered AS FLOAT) AS totalkwh,
    	CAST(price_per_kwh AS FLOAT) AS kwhprice,
    	CAST(cost AS FLOAT) AS Amount
FROM Session;


-- View for endpoint G ---------------------------------
CREATE VIEW StatusHistory AS
SELECT 
    charger_id, -- Keep for filtering
    DATE_FORMAT(time_ref, '%Y-%m-%d %H:%i') AS timeref,
    old_state,
    new_state
FROM ChargerStatusHistory;
