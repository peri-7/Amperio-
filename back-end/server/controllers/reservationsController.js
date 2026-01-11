const Reservations = require('../models/reservationsModel');



const getUpcoming = async (req, res, next) => {
	try {
		const user_id = req.user_id;
		const rsv = await Reservations.upcoming(user_id);

		res.status(200).json(rsv);
	} catch (error) {
		next(error);
	}
};

module.exports = { getUpcoming };
