const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); 
const authRoutes = require('./routes/authRoutes'); 

const app = express();

app.use(cors()); // React-server comm
app.use(express.json()); // JSON format data

// mount Routes
app.use('/api/users', userRoutes); 
app.use('/api/auth', authRoutes); 

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
