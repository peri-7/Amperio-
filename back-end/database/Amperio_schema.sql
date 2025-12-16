DROP SCHEMA if exists `amperio`;
CREATE SCHEMA `amperio`;
use amperio;


-- -----------------------------------------------------
-- Table Power
-- -----------------------------------------------------
CREATE TABLE  Power (
	power INT primary key
);



-- -----------------------------------------------------
-- Table Connector
-- -----------------------------------------------------
CREATE TABLE Connector (
	connector_id INT AUTO_INCREMENT PRIMARY KEY,
	connector_type VARCHAR(45) NOT NULL
);



-- -----------------------------------------------------
-- Table Station
-- -----------------------------------------------------
CREATE TABLE Station (
	station_id INT AUTO_INCREMENT PRIMARY KEY,
	address VARCHAR(45),
	longitude FLOAT NOT NULL,
	latitude FLOAT NOT NULL,
	postal_code INT,
	facilities MEDIUMTEXT,
	google_maps_link VARCHAR(255)
);



-- -----------------------------------------------------
-- Table Charger
-- -----------------------------------------------------
CREATE TABLE Charger (
	charger_id INT PRIMARY KEY,
	power INT NOT NULL,
	connector_id INT NOT NULL,
	station_id INT NOT NULL,
	installed_at timestamp not null,
	last_checked timestamp not null,
	charger_status enum('available', 'charging', 'reserved', 'malfunction', 'offline') not null,
	current_price decimal(5,3),
	FOREIGN KEY (power) REFERENCES POWER(power)
	ON DELETE RESTRICT ON UPDATE CASCADE,
	FOREIGN KEY (connector_id) REFERENCES Connector(connector_id)
	ON DELETE RESTRICT ON UPDATE CASCADE,
	FOREIGN KEY (station_id) REFERENCES Station(station_id)
	ON DELETE NO ACTION ON UPDATE NO ACTION
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
	ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (power) REFERENCES Power(power)
	ON UPDATE CASCADE ON DELETE CASCADE
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
	default_charger_power int,
	created_at timestamp not null default current_timestamp,
	role enum('user', 'admin') not null,
	foreign key (default_charger_power) references Power(power)
	on update restrict on delete restrict
);


-- --------------------------------------
-- Table Reservation
-- -------------------------------------
CREATE TABLE Reservation(
	reservation_id int primary key auto_increment,
	user_id int,
	charger_id int,
	reservation_start_time timestamp not null,
	reservation_end_time timestamp not null,
	foreign key (user_id) references Users(user_id)
	on update cascade on delete cascade,
	foreign key (charger_id) references Charger(charger_id)
	on update cascade on delete cascade
);


-- -----------------------------------------------------
-- Table Session
-- -----------------------------------------------------
CREATE TABLE Session(
	session_id int primary key auto_increment,
	start_time timestamp not null,
	end_time timestamp not null,
	start_soc int not null,
	end_soc int not null,
	price_per_kwh decimal(5,3),
	money_preblocked decimal(5,2) not null, 
	cost decimal(5,3) not null,
	energy_delivered decimal(5,2) not null,
	charger_id int not null,
	user_id int not null,
	session_progress int check(0 <= session_progress & session_progress <= 100),
	foreign key (charger_id) references Charger(charger_id)
	on update cascade on delete restrict,
	foreign key (user_id) references Users(user_id)
	on update cascade on delete restrict
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
	ON DELETE CASCADE ON UPDATE CASCADE
);
