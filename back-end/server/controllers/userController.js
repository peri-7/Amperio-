const User = require('../models/userModel'); 


const getUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });
  }
};

module.exports = { getUsers };
