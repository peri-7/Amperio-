//check type of parameter
const validateType = (x, type) =>
{
	switch(type)
	{
		// catches null or undefined
		case "null": 
			return x == null;

		// check for integers. doesnt cast floats!
		// accepts strings with integers
		case "integer":
			//Number("") = 0 !
			if (x === "") return false;
			return Number.isInteger(Number(x));

		case "number":
			if (x === "") return false;
			const tempnum = Number(x);
			return (typeof tempnum === "number") && (!Number.isNaN(tempnum));

		//wrong type
		default:
			return typeof x === type;
	}
}

// Validate a timestamp
const validateTimestamp = (ts) =>
{
  	const isoString = ts.replace(" ", "T");
  	const date = new Date(isoString);
  	if (isNaN(date.getTime())) return false;

	//make sure conversion was successfull
  	const [year, month, day, hour, minute] = ts.match(/\d+/g).map(Number);
  	return 
	(
    		date.getFullYear() === year &&
    		date.getMonth() + 1 === month &&
    		date.getDate() === day &&
    		date.getHours() === hour &&
    		date.getMinutes() === minute
  	);
}

module.exports = { validateType, validateTimestamp };
