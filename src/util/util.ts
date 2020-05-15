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
const isStringVr = (vr:string):boolean => stringVrs[vr];

/**
 * Tests to see if a given tag in the format xggggeeee is a private tag or not
 * @param tag
 * @returns {boolean}
 */
const isPrivateTag = (tag:string):boolean => {
  const lastGroupDigit = parseInt(tag[4], 10);
  return (lastGroupDigit % 2) === 1;
};

/**
 * Parses a PN formatted string into a javascript object with properties for givenName, familyName, middleName, prefix and suffix
 * @param personName a string in the PN VR format
 * @param index
 * @returns {*} javascript object with properties for givenName, familyName, middleName, prefix and suffix or undefined if no element or data
 */
const parsePN = (personName:string):any => {
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
