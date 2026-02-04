# ⚙️ Amperio | Back-End
This directory contains the core logic for Amperio, including the RESTful API server 
and the database configuration scripts.

## 📂 Directory Contents
- `/server`: Node.js/Express application source code.
- `/database`: SQL scripts for schema creation, performance optimization, and business logic.
- `api_documentation.md`: Detailed breakdown of available endpoints, request bodies, and response codes.

## 🛠 Database Setup
To ensure the application functions correctly, you must run the SQL scripts in a specific order to satisfy foreign key constraints and dependencies.
 1. `Amperio_schema.sql` — Creates the tables and core structure.
 2. `Indexes.sql` — Optimizes search queries for chargers and locations.
 3. `Views.sql` — Sets up virtual tables for complex data retrieval.
 4. `Triggers.sql` — Handles automated logic (e.g., updating charger status after a reservation).

**Note:** Ensure your MySQL service is running before executing these scripts via your preferred DB client (MySQL Workbench, DBeaver, or CLI).

## 🔑 Environment Variables
The server relies on a .env file located in the `/server/config` directory.  
Rename the `example.env` file to `.env` and add the following variables:
| Variable | Description | Example |
|------|------|----------|
|`DB_HOST`|Database host address| `localhost`|
|`DB_USER`|MySQL username| `root` |
|`DB_PASSWORD`|MySQL password| `verystrongandsecurepassword` |
|`DB_NAME`|Database name| `Amperio` |
|`JWT_SECRET`|Secret key for JWT authentication| `can be whatever` |
|`USE_HTTPS`|Enable HTTPS (true/false)| `true` |
|`ENTSOE_TOKEN`|Token for ENTSOE API access| `your_entsoe_token_here` |

## 🚀 Running the Server
 1. Install Dependencies:
    ```bash
    cd server
    npm install
    ```
 2. Start Server:
    ```bash
    npm run start
    ```
The server will typically start on https://localhost:9876 unless specified otherwise.

## 🧪 Testing the API
You can find the full list of endpoints in the `api_documentation.md` file. To test if the backend is alive, you can ping:GET /api/healthcheck