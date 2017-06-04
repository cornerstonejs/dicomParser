import * as util from './util';

/**
 * Converts an explicit VR element to a string or undefined if it is not possible to convert.
 * Throws an error if an implicit element is supplied
 * @param dataSet
 * @param element
 * @returns {*}
 */
export default function explicitElementToString (dataSet, element) {
  if (dataSet === undefined || element === undefined) {
    throw new Error('dicomParser.explicitElementToString: missing required parameters');
  }
  if (element.vr === undefined) {
    throw new Error('dicomParser.explicitElementToString: cannot convert implicit element to string');
  }
  const vr = element.vr;
  const tag = element.tag;

  let textResult;

  function multiElementToString (numItems, func) {
    let result = '';

    for (let i = 0; i < numItems; i++) {
      if (i !== 0) {
        result += '/';
      }
      result += func.call(dataSet, tag, i).toString();
    }

    return result;
  }

  if (util.isStringVr(vr) === true) {
    textResult = dataSet.string(tag);
  } else if (vr === 'AT') {
    let num = dataSet.uint32(tag);

    if (num === undefined) {
      return;
    }
    if (num < 0) {
      num = 0xFFFFFFFF + num + 1;
    }

    return `x${num.toString(16).toUpperCase()}`;
  } else if (vr === 'US') {
    textResult = multiElementToString(element.length / 2, dataSet.uint16);
  } else if (vr === 'SS') {
    textResult = multiElementToString(element.length / 2, dataSet.int16);
  } else if (vr === 'UL') {
    textResult = multiElementToString(element.length / 4, dataSet.uint32);
  } else if (vr === 'SL') {
    textResult = multiElementToString(element.length / 4, dataSet.int32);
  } else if (vr === 'FD') {
    textResult = multiElementToString(element.length / 8, dataSet.double);
  } else if (vr === 'FL') {
    textResult = multiElementToString(element.length / 4, dataSet.float);
  }

  return textResult;
}
