DROP SCHEMA if exists `amperio`;
CREATE SCHEMA `amperio`;
use amperio;



-- -----------------------------------------------------
-- Table Station
-- -----------------------------------------------------
CREATE TABLE Station (
	station_id INT PRIMARY KEY,
	station_name VARCHAR(80),
	address VARCHAR(80),
	longitude FLOAT NOT NULL,
	latitude FLOAT NOT NULL,
	postal_code INT,
	facilities MEDIUMTEXT,
	google_maps_link VARCHAR(255),
	score DECIMAL(2,1)
);



-- -----------------------------------------------------
-- Table Charger
-- -----------------------------------------------------
CREATE TABLE Charger (
	charger_id INT PRIMARY KEY,
	power int NOT NULL,
	connector_type enum('Type 2', 'CCS2', 'CHAdeMO', 'CCS1') NOT NULL,
	station_id INT NOT NULL,
	installed_at timestamp not null,
	last_checked timestamp default current_timestamp null,
	charger_status enum('available', 'charging', 'reserved', 'malfunction', 'offline') not null,
	current_price decimal(5,3),
	FOREIGN KEY (station_id) REFERENCES Station(station_id)
	ON DELETE RESTRICT ON UPDATE CASCADE
);


-- -----------------------------------------------------
-- Table PricingHistory (for the admins)
-- -----------------------------------------------------

CREATE TABLE PricingHistory (
	pricing_id INT AUTO_INCREMENT PRIMARY KEY,
	charger_id INT,
	power INT,
	start_time DATETIME NOT NULL,
	end_time DATETIME NOT NULL, 
	base_price DECIMAL(5,3) NOT NULL,  
	wholesale_price DECIMAL(5,3) NOT NULL,
	final_price DECIMAL(5,3) NOT NULL,
	FOREIGN KEY (charger_id) REFERENCES Charger(charger_id)
	ON UPDATE CASCADE ON DELETE RESTRICT

);



-- -----------------------------------------------------
-- Table Account
-- -----------------------------------------------------
CREATE TABLE Users(
	user_id int primary key auto_increment,
	username varchar(255) not null,
	safe_password varchar(255) not null,
	email varchar(255) not null,
	-- card info -----------------
	card_number decimal(16,0),
	card_name varchar(45),
	card_exp_date date,
	card_cvv decimal(3,0),
	-- ----------------------------
	default_charger_power INT,
	created_at timestamp not null default current_timestamp,
	role enum('user', 'admin') not null

);


-- --------------------------------------
-- Table Reservation
-- -------------------------------------
CREATE TABLE Reservation(
	reservation_id int primary key auto_increment,
	user_id int,
	charger_id int,
	reservation_start_time timestamp not null,
	reservation_end_time timestamp default current_timestamp not null,
	foreign key (user_id) references Users(user_id)
	on update cascade on delete restrict,
	foreign key (charger_id) references Charger(charger_id)
	on update cascade on delete restrict
);


-- -----------------------------------------------------
-- Table Session
-- -----------------------------------------------------
CREATE TABLE Session(
	session_id INT PRIMARY KEY AUTO_INCREMENT,
	-- each session has a unique random id
	charger_id INT NOT NULL,
	-- each session corresponds to a charger
	start_time TIMESTAMP NOT NULL,
	-- start time of a session
	end_time TIMESTAMP default current_timestamp NOT NULL,
	-- end time of a session, must be greater than start_time
	start_soc INT NOT NULL CHECK (start_soc BETWEEN 0 AND 100),
	-- battery percent of car at the start
	end_soc INT NOT NULL CHECK (end_soc BETWEEN 0 AND 100),
	-- battery oercent of car at the end, must be at least start_soc or greater
	-- must also be a valid percentage, same as start_soc
	energy_delivered DECIMAL(6,3) NOT NULL CHECK (energy_delivered >= 0),
	-- energy used in the charging process
	-- assume battery capacity no more than 1000 kwh and precision of wh
	price_per_kwh DECIMAL(5,3) NOT NULL CHECK (price_per_kwh >= 0),
	-- price paid by the customer per kwh
	-- assume price no more than 100 with two decical precision
	money_preblocked DECIMAL(5,2) NOT NULL CHECK (money_preblocked >= 0),
        -- amount of customer money reserved at the start
	-- assume we dont want to reserve more than 1000 euros
	user_id INT NOT NULL,
	-- each charging session is associated with a user
	session_progress INT DEFAULT 100 CHECK (session_progress BETWEEN 0 AND 100),
	-- progress of each session

	FOREIGN KEY (charger_id) REFERENCES Charger(charger_id)
	ON UPDATE CASCADE ON DELETE RESTRICT,
	-- charger exists
	FOREIGN KEY (user_id) REFERENCES Users(user_id)
	ON UPDATE CASCADE ON DELETE RESTRICT,
	-- user exists
     	CHECK (end_time > start_time),
	CHECK (end_soc >= start_soc),
	-- no two sessions at the same time and the same charger
	UNIQUE (charger_id, start_time)
);

-- ---------------------------------------------------
-- Table ChargerStatusHistory
-- ---------------------------------------------------
CREATE TABLE ChargerStatusHistory (
	history_id INT AUTO_INCREMENT PRIMARY KEY,
	charger_id INT NOT NULL,
	time_ref TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	old_state VARCHAR(20),
	new_state VARCHAR(20),
	FOREIGN KEY (charger_id) REFERENCES Charger(charger_id) 
	ON DELETE RESTRICT ON UPDATE CASCADE
);