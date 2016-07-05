/**
 * Internal helper functions for parsing implicit and explicit DICOM data sets
 */

const readDicomElementExplicit = require('./readDicomElementExplicit');
const readDicomElementImplicit = require('./readDicomElementImplicit');

/**
 * reads an explicit data set
 * @param byteStream the byte stream to read from
 * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
 */
function parseDicomDataSetExplicit (dataSet, byteStream, maxPosition, options) {

  maxPosition = (maxPosition === undefined) ? byteStream.byteArray.length : maxPosition ;
  options = options || {};

  if (byteStream === undefined) {
    throw "missing required parameter 'byteStream'";
  }
  if (maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length) {
    throw "invalid value for parameter 'maxPosition'";
  }
  var elements = dataSet.elements;

  while (byteStream.position < maxPosition) {
    var element = readDicomElementExplicit(byteStream, dataSet.warnings, options.untilTag);
    elements[element.tag] = element;
    if (element.tag === options.untilTag) {
      return;
    }
  }
  
  if (byteStream.position > maxPosition) {
    throw "buffer overrun";
  }
}

/**
 * reads an implicit data set
 * @param byteStream the byte stream to read from
 * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
 */
function parseDicomDataSetImplicit (dataSet, byteStream, maxPosition, options) {
  maxPosition = (maxPosition === undefined) ? dataSet.byteArray.length : maxPosition ;
  options = options || {};

  if (byteStream === undefined) {
    throw "missing required parameter 'byteStream'";
  }
  if (maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length) {
    throw "invalid value for parameter 'maxPosition'";
  }

  var elements = dataSet.elements;

  while (byteStream.position < maxPosition) {
    var element = readDicomElementImplicit(byteStream, options.untilTag, options.vrCallback);
    elements[element.tag] = element;
    if (element.tag === options.untilTag) {
      return;
    }
  }
}


module.exports = {
  implicit: parseDicomDataSetImplicit,
  explicit: parseDicomDataSetExplicit
};
