const User = require('../models/userModel'); 


const getUserProfile = async (req, res) => {
	try {
		const user_id = req.user_id;
		const userInfo = await User.findByID(user_id);

		if(!userInfo) {
			return res.status(404).jason({ message: "User not found" });
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
			return res.status(404).jason({ message: "User not found" });
		}

		const { default_charger_power, ...userData } = userInfo;
		res.status(200).json(userData);
	} catch (error) {
		res.status(500).json({ message: "Error fetching data" });
	}
};



module.exports = { getUserProfile, getUserData };
