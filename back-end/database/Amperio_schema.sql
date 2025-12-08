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
	facilities MEDIUMTEXT
	google_maps_link VARCHAR(255);
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
	charger_status enum('in_use', 'ready_to_use', 'out_of_order') not null,
	FOREIGN KEY (power) REFERENCES POWER(power)
	ON DELETE RESTRICT ON UPDATE CASCADE,
	FOREIGN KEY (connector_id) REFERENCES Connector(connector_id)
	ON DELETE RESTRICT ON UPDATE CASCADE,
	FOREIGN KEY (station_id) REFERENCES Station(station_id)
	ON DELETE NO ACTION ON UPDATE NO ACTION
);


-- -----------------------------------------------------
-- Table Pricing
-- -----------------------------------------------------

CREATE TABLE Pricing (
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
CREATE TABLE User(
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
	foreign key (default_charger_power) references Power(power)
	on update restrict on delete restrict
);


-- --------------------------------------
-- Table Reservation
-- -------------------------------------
CREATE TABLE Reservation(
	reservation_id int primary key auto_increment,
	account_id int,
	charger_id int,
	reservation_time timestamp not null,
	time_remaining time not null,
	foreign key (account_id) references Customer_account(account_id)
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
	money_preblocked float not null, 
	cost float not null,
	energy_delivered decimal(5,2) not null,
	charger_id int not null,
	account_id int not null,
	session_progress int check(0 <= session_progress & session_progress <= 100),
	foreign key (charger_id) references Charger(charger_id)
	on update cascade on delete restrict,
	foreign key (account_id) references Customer_account(account_id)
	on update cascade on delete restrict
);


