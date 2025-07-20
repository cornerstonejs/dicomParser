// algorithm based on http://stackoverflow.com/questions/1433030/validate-number-of-days-in-a-given-month
function daysInMonth (m, y) { // m is 0 indexed: 0-11
  switch (m) {
  case 2 :
    return (y % 4 == 0 && y % 100) || y % 400 == 0 ? 29 : 28;
  case 9 : case 4 : case 6 : case 11 :
    return 30;
  default :
    return 31;
  }
}

function isValidDate (d, m, y) {
  // make year is a number
  if (isNaN(y)) {
    return false;
  }

  return m > 0 && m <= 12 && d > 0 && d <= daysInMonth(m, y);
}


/**
 * Parses a DA formatted string into a Javascript object
 * @param {string} date a string in the DA VR format
 * @param {boolean} [validate = false] - should an exception be thrown when the data is invalid
 * @returns {{year: number, month: number, day: number} | undefined} Javascript object with properties year, month and
 * day or undefined if not present or not 8 bytes long
 */
export default function parseDA (date, validate) {
  const invalidDate = `Failed to parse string as DA, format or value is not valid, got ${date}`;

  if (date && date.length === 8) {
    var yyyy = parseInt(date.substring(0, 4), 10);
    var mm = parseInt(date.substring(4, 6), 10);
    var dd = parseInt(date.substring(6, 8), 10);


    // PR question this will return an invalid date object if validate is false, should it be adressed in this PR ?
    if (validate) {
      if (isValidDate(dd, mm, yyyy) !== true) {
        throw new Error(invalidDate);
      }
    }

    return {
      year: yyyy,
      month: mm,
      day: dd
    };
  }
  if (validate) {
    throw new Error(invalidDate);
  }

  return undefined;
}
