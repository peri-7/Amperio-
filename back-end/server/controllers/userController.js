const User = require('../models/userModel'); 
const bcrypt = require('bcryptjs'); 


const getUserProfile = async (req, res) => {
	try {
		const user_id = req.user_id;
		const userInfo = await User.findByID(user_id);

		if(!userInfo) {
			return res.status(404).json({ message: "User not found" });
		}


		res.status(200).json(userInfo);
	} catch (error) {
		res.status(500).json({ message: "Error fetching data" });
	}
};

const getUserData = async (req, res) => {
	try {
		const user_id = req.user_id;
		const userInfo = await User.findByID(user_id);

		if(!userInfo) {
			return res.status(404).json({ message: "User not found" });
		}

		const { default_charger_power, ...userData } = userInfo;
		res.status(200).json(userData);
	} catch (error) {
		res.status(500).json({ message: "Error fetching data" });
	}
};

const updateUserProfile = async (req, res) => {
	try {
		const user_id = req.user_id;
		const { username, email, default_charger_power, default_connector_type, password } = req.body;

		const updates = {};
		if (username) updates.username = username;
		if (email) updates.email = email;
		
		// Handle potential null/empty values for preferences
		if (default_charger_power !== undefined) {
			updates.default_charger_power = default_charger_power || null;
		}
		if (default_connector_type !== undefined) {
			updates.default_connector_type = default_connector_type || null;
		}
		
		if (password) {
			 const salt = await bcrypt.genSalt(10);
			 updates.safe_password = await bcrypt.hash(password, salt);
		}

		if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No changes provided" });
        }

		await User.update(user_id, updates);

		res.status(200).json({ message: "Profile updated successfully" });

	} catch (error) {
		console.error("Error updating profile:", error);
		res.status(500).json({ message: "Error updating profile" });
	}
};

module.exports = { getUserProfile, getUserData, updateUserProfile };
