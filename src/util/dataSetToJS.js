
const isPrivateTag = require('./isPrivateTag');
const explicitDataSetToJS = require('./../explicitDataSetToJS');
const explicitElementToString = require('./../explicitElementToString');


/**
 * converts an explicit dataSet to a javascript object
 * @param dataSet
 * @param options
 */
module.exports = function explicitDataSetToJS (dataSet, options) {

  if (dataSet === undefined) {
    throw 'missing required parameter dataSet';
  }

  options = options || {
    omitPrivateAttibutes: true, // true if private elements should be omitted
    maxElementLength : 128      // maximum element length to try and convert to string format
  };

  var result = {

  };

  for (var tag in dataSet.elements) {
    var element = dataSet.elements[tag];

    // skip this element if it a private element and our options specify that we should
    if (options.omitPrivateAttibutes === true && isPrivateTag(tag)) {
      continue;
    }

    if (element.items) {
      // handle sequences
      var sequenceItems = [];
      for (var i=0; i < element.items.length; i++) {
        sequenceItems.push(explicitDataSetToJS(element.items[i].dataSet, options));
      }
      result[tag] = sequenceItems;
    } else {
      var asString;
      if (element.length < options.maxElementLength) {
        asString = explicitElementToString(dataSet, element);
      }

      if (asString !== undefined) {
        result[tag] = asString;
      }  else {
        result[tag] = {
          dataOffset: element.dataOffset,
          length : element.length
        };
      }
    }
  }

  return result;
};
