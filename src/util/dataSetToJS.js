import explicitElementToString from './elementToString';
import * as util from './util';

/**
 * converts an explicit dataSet to a javascript object
 * @param dataSet
 * @param options
 */
export default function explicitDataSetToJS (dataSet, options = {
  omitPrivateAttibutes: true, // true if private elements should be omitted
  maxElementLength: 128      // maximum element length to try and convert to string format
}) {
  if (dataSet === undefined) {
    throw new Error('dicomParser.explicitDataSetToJS: missing required parameter dataSet');
  }

  const result = {};

  Object.keys(dataSet.elements).forEach((tag) => {
    const element = dataSet.elements[tag];

    // skip this element if it a private element and our options specify that we should
    if (options.omitPrivateAttibutes === true &&
        util.isPrivateTag(tag)) {
      return;
    }

    if (element.items) {
      // handle sequences
      const sequenceItems = [];

      for (let i = 0; i < element.items.length; i++) {
        sequenceItems.push(explicitDataSetToJS(element.items[i].dataSet, options));
      }
      result[tag] = sequenceItems;
    } else {
      let asString;

      asString = undefined;
      if (element.length < options.maxElementLength) {
        asString = explicitElementToString(dataSet, element);
      }

      if (asString === undefined) {
        result[tag] = {
          dataOffset: element.dataOffset,
          length: element.length
        };
      } else {
        result[tag] = asString;
      }
    }
  });


  return result;
}
