const { Parser } = require('json2csv');

const responseFormatter = (req, res, next) => {
    //custom formatting of data
    res.sendData = (data) => {
        const format = req.query.format || 'json';
        //if i have chosen  csv and return object is array of objects
        if (format === 'csv' && Array.isArray(data)) {
            try {
                const json2csvParser = new Parser({ withBOM: true});
                const csv = json2csvParser.parse(data);
                res.header('Content-Type', 'text/csv');
                //res.attachment('data.csv'); // trigger download of csv file
                res.header('Content-Disposition', 'inline; filename="data.csv"');
		return res.send(csv);
            } catch (err) {
                // If CSV conversion fails call error handler
                return next(err);
            }
        }

        // json default answer
        res.header('Content-Type', 'application/json');
        return res.json(data);
    };
    next();
};

module.exports = responseFormatter;
