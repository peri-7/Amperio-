const UserStats = require('../models/userStatsModel'); 


const getKpis = async (req, res, next) => {
	try {
		const user_id = req.user_id;
		const kpis = await UserStats.getKpis(user_id);

		if(!kpis) {
			res.status(404);
			return next(new Error("kpis not found"));
		}
		
		res.status(200).json(kpis);
	} catch (error) {
		next(error);
	}
};

const getChartData = async (req, res, next) => {
	try {
		const user_id = req.user_id;
		const chartData = await UserStats.getChartData(user_id);

		if(!chartData){
			res.status(404);
			return next(new Error("chart data not found"));
		}

		res.status(200).json(chartData);
	} catch (error) {
		next(error);
	}
};


module.exports = { getKpis, getChartData };
