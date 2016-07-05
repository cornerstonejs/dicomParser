/**
 * Tests to see if a given tag in the format xggggeeee is a private tag or not
 * @param tag
 * @returns {boolean}
 */
module.exports = function isPrivateTag (tag) {
  var lastGroupDigit = parseInt(tag[4]);
  var groupIsOdd = (lastGroupDigit % 2) === 1;
  return groupIsOdd;
};