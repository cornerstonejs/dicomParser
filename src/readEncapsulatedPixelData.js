/**
 * Functionality for extracting encapsulated pixel data
 */

/**
 * Returns the pixel data for the specified frame in an encapsulated pixel data element.  If no basic offset
 * table is present, it assumes that all fragments are for one frame.  Note that this assumption/logic is not
 * valid for multi-frame instances so this function has been deprecated and will eventually be removed.  Code
 * should be updated to use readEncapsulatedPixelDataFromFragments() or readEncapsulatedImageFrame()
 *
 * @deprecated since version 1.6 - use readEncapsulatedPixelDataFromFragments() or readEncapsulatedImageFrame()
 * @param dataSet - the dataSet containing the encapsulated pixel data
 * @param pixelDataElement - the pixel data element (x7fe00010) to extract the frame from
 * @param frame - the zero based frame index
 * @returns {object} with the encapsulated pixel data
 */


const readEncapsulatedImageFrame = require('./readEncapsulatedImageFrame');
const readEncapsulatedPixelDataFromFragments = require('./readEncapsulatedixelDataFromFragments');

var deprecatedNoticeLogged = false;

module.exports = function readEncapsulatedPixelData (dataSet, pixelDataElement, frame) {
  if (!deprecatedNoticeLogged) {
    // only log once 
    deprecatedNoticeLogged = true 
    if (console && console.warn) {
      console.warn("readEncapsulatedPixelData() has been deprecated");
    }
  }

  if (dataSet === undefined) {
    throw "missing required parameter 'dataSet'";
  }

  if (pixelDataElement === undefined) {
    throw "missing required parameter 'element'";
  }

  if (frame === undefined) {
    throw "missing required parameter 'frame'";
  }

  if (pixelDataElement.tag !== 'x7fe00010') {
    throw "parameter 'element' refers to non pixel data tag (expected tag = x7fe00010'";
  }

  if (pixelDataElement.encapsulatedPixelData !== true
      || pixelDataElement.hadUndefinedLength !== true
      || pixelDataElement.basicOffsetTable === undefined
      || pixelDataElement.fragments === undefined) {
    throw "parameter 'element' refers to pixel data element that does not have encapsulated pixel data";
  }

  if (frame < 0) {
    throw "parameter 'frame' must be >= 0";
  }

  // If the basic offset table is not empty, we can extract the frame
  if (pixelDataElement.basicOffsetTable.length !== 0) {
    return readEncapsulatedImageFrame(dataSet, pixelDataElement, frame);
  
  // No basic offset table, assume all fragments are for one frame - NOTE that this is NOT a valid
  // assumption but is the original behavior so we are keeping it for now
  } else {
    return readEncapsulatedPixelDataFromFragments(dataSet, pixelDataElement, 0, pixelDataElement.fragments.length);
  }
};
