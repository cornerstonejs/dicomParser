// algorithm based on http://stackoverflow.com/questions/1433030/validate-number-of-days-in-a-given-month
// m is 0 indexed: 0-11
const daysInMonth = (m: number, y: number): number => {
	switch (m) {
		case 2:
			return (y % 4 === 0 && y % 100) || y % 400 === 0 ? 29 : 28;
		case 9:
		case 4:
		case 6:
		case 11:
			return 30;
		default:
			return 31;
	}
};

const isValidDate = (d: number, m: number, y: number): boolean => {
	// make year is a number
	if (isNaN(y)) {
		return false;
	}
	return m > 0 && m <= 12 && d > 0 && d <= daysInMonth(m, y);
};

/**
 * Parses a DA formatted string into a Javascript object
 * @param {string} date a string in the DA VR format
 * @param {boolean} [validate] - true if an exception should be thrown if the date is invalid
 * @returns {*} Javascript object with properties year, month and day or undefined if not present or not 8 bytes long
 */
const parseDA = (date: string, validate?: boolean): { year: number; month: number; day: number } | undefined => {
	if (date && date.length === 8) {
		const yyyy = parseInt(date.substring(0, 4), 10);
		const mm = parseInt(date.substring(4, 6), 10);
		const dd = parseInt(date.substring(6, 8), 10);

		if (validate) {
			if (isValidDate(dd, mm, yyyy) !== true) {
				throw new Error(`invalid DA '${date}'`);
			}
		}

		return {
			year: yyyy,
			month: mm,
			day: dd,
		};
	}
	if (validate) {
		throw new Error(`invalid DA '${date}'`);
	}
	return undefined;
};
export default parseDA;