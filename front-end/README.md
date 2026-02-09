# 🎨 Amperio | Front-End

This directory contains the user interface for Amperio. Built with **React (JSX)** and **CSS**, designed to help EV owners find and reserve chargers with ease.

## 📂 Directory Contents

* **`/client`**: The React source code and application logic.
* **`/Figmas`**: Early design mockups.

## 🚀 Getting Started

 1. Installation

    Navigate to the client directory and install the necessary dependencies:

        cd client
        npm install

 2. Start the local server

        npm run dev

The app should now be running at `http://localhost:5173`

 3. Build for production(Optional)

        npm run build
        npm install -g serve
        serve -s dist (or npx serve -s dist)

 Now serve will give you a local URL to access the build of the app.



## ✨ Features Implemented

* **Interactive Map:** Browse available chargers in real-time.
* **Smart Filters:** Filter by charging speed (kW), connector type (Type 2, CCS, etc.), and nearby amenities like cafes or parks.
* **User Dashboard:** View and manage upcoming or past charging sessions.
* **Admin Dashboard:** Manage chargers, users, and view system statistics.


## 🛠 Tech Stack

* **Framework:** React.js
* **Styling:** CSS
* **Build Tool:** [Vite / Create React App]
