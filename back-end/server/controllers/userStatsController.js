const UserStats = require('../models/userStatsModel'); 


const getKpis = async (req, res) => {
	try {
		const user_id = req.user_id;
		const kpis = await UserStats.getKpis(user_id);

		if(!kpis) {
			res.status(404).json({ message: "kpis not found" });
		}
		
		res.status(200).json(kpis);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Error fetching kpi data" });
	}
};

const getChartData = async (req, res) => {
	try {
		const user_id = req.user_id;
		const chartData = await UserStats.getChartData(user_id);

		if(!chartData){
			res.status(404).json({ message: "chart data not found" });
		}

		res.status(200).json(chartData);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Error fetching chart data" });
	}
};


module.exports = { getKpis, getChartData };
