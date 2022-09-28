const stringVrs = {
  AE: true,
  AS: true,
  AT: false,
  CS: true,
  DA: true,
  DS: true,
  DT: true,
  FL: false,
  FD: false,
  IS: true,
  LO: true,
  LT: true,
  OB: false,
  OD: false,
  OF: false,
  OW: false,
  PN: true,
  SH: true,
  SL: false,
  SQ: false,
  SS: false,
  ST: true,
  TM: true,
  UI: true,
  UL: false,
  UN: undefined, // dunno
  UR: true,
  US: false,
  UT: true
};

/**
 * Tests to see if vr is a string or not.
 * @param vr
 * @returns true if string, false it not string, undefined if unknown vr or UN type
 */
const isStringVr = (vr) => stringVrs[vr];

/**
 * Tests to see if a given tag in the format xggggeeee is a private tag or not
 * @param tag
 * @returns {boolean}
 * @throws error if fourth character cannot be parsed
 */
const isPrivateTag = (tag) => {
  const lastGroupDigit = parseInt(tag[4], 16);
  if (isNaN(lastGroupDigit)) {
    throw 'dicomParser.isPrivateTag: cannot parse last character of group';
  }
  const groupIsOdd = (lastGroupDigit % 2) === 1;

  return groupIsOdd;
};

/**
 * Parses a PN formatted string into a javascript object with properties for givenName, familyName, middleName, prefix and suffix
 * @param personName a string in the PN VR format
 * @param index
 * @returns {*} javascript object with properties for givenName, familyName, middleName, prefix and suffix or undefined if no element or data
 */
const parsePN = (personName) => {
  if (personName === undefined) {
    return undefined;
  }
  const stringValues = personName.split('^');


  return {
    familyName: stringValues[0],
    givenName: stringValues[1],
    middleName: stringValues[2],
    prefix: stringValues[3],
    suffix: stringValues[4]
  };
};

export {
  isStringVr,
  isPrivateTag,
  parsePN
};
