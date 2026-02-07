# Amperio

Welcome to Amperio, a university project for finding and reserving chargers for your EV.
This repository contains everything you need to run a web app that lets users find and
reserve chargers for their EVs.

### 📂Folder Structure Overview
Here is a general overview of what is contained in each folder of the repo  
```
📂 Amperio
├── 📂 ai-log            # Query logs  
├── 📂 back-end          # API server and DB migrations  
│   ├── 📂 server        # Node.js source code  
│   └── 📂 database      # SQL schema, triggers, and views
├── 📂 cli-client        # Terminal interface for API calls
├── 📂 documentation     # UML/ER diagrams and SRS  
└── 📂 front-end         # React application (JSX)   
    ├── 📂 client        # Web source code   
    └── 📂 Figmas        # Design mockups   
```

### 🚀Quick Setup Guide

#### 1. Prerequisites
To run this you will need:
 - The latest version of Node JS and MySQL
 - An ENTSOE API token
#### 2. Setup
Clone the repo to your desired file location and run

	npm install
in the back-end/server, front-end/client and cli-client folders
then thorugh your DB client or using the terminal run the scripts in the /back-end/database folder in the following order: 
 1. `Amperio_schema.sql`
 2. `Indexes.sql`
 3. `Views.sql`
 4. `Triggers.sql` 

Lastly, make sure to set the environemntal variables. Rename the `example.env` file to `.env` and change the contents to match your data.  
(for more info on what each environmental variable does see [Backend README](back-end/README.md))


#### 3. Run
To run the backend server simply open a terminal in the back-end/server folder and type

	npm run start
To run the frontend open a seperate terminal in the front-end/client folder and type

	npm run dev

#### 4. CLI
Optionally you can now link the CLI to use it globaly on your machine by running se2519 anywhere on the terminal  
(see [CLI README](cli-client/README.md) for a list of CLI commands)

### 🛠Features
 - Real-time Map: Find chargers near your current location.

 - Filters for All Needs: Find exactly the kind of charger you need filtering for power, port and even nearby amenities

 - API Access: Fully documented RESTful API for third-party integrations.

 - CLI Tools: Easy admin management through the terminal.
