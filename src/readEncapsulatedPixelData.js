import readEncapsulatedImageFrame from './readEncapsulatedImageFrame.js';
import readEncapsulatedPixelDataFromFragments from './readEncapsulatedPixelDataFromFragments.js';
import { invalidParameter, missingParameter } from './util/errors.js';

/**
 * Functionality for extracting encapsulated pixel data
 */

let deprecatedNoticeLogged = false;

/**
 * Returns the pixel data for the specified frame in an encapsulated pixel data element.  If no basic offset
 * table is present, it assumes that all fragments are for one frame.  Note that this assumption/logic is not
 * valid for multi-frame instances so this function has been deprecated and will eventually be removed.  Code
 * should be updated to use readEncapsulatedPixelDataFromFragments() or readEncapsulatedImageFrame()
 *
 * @deprecated since version 1.6 - use readEncapsulatedPixelDataFromFragments() or readEncapsulatedImageFrame()
 * @param dataSet - the dataSet containing the encapsulated pixel data
 * @param pixelDataElement - the pixel data element (x7fe00010) to extract the frame from
 * @param {number} frameIndex - the zero based frame index
 * @returns {object} with the encapsulated pixel data
 */
export default function readEncapsulatedPixelData (dataSet, pixelDataElement, frameIndex) {
  if (!deprecatedNoticeLogged) {
    deprecatedNoticeLogged = true;

    if (console && console.log) {
      console.log('WARNING: dicomParser.readEncapsulatedPixelData() has been deprecated');
    }
  }

  if (dataSet === undefined) {
    throw new TypeError(missingParameter('dataSet'));
  }
  if (pixelDataElement === undefined) {
    throw new TypeError(missingParameter('pixelDataElement'));
  }
  if (frameIndex === undefined) {
    throw new TypeError(missingParameter('frameIndex'));
  }
  if (pixelDataElement.tag !== 'x7fe00010') {
    throw new TypeError(invalidParameter(
      'pixelDataElement',
      `'tag' property refers to non pixel data tag, should be 'x7fe00010', got '${pixelDataElement.tag}'`
    ));
  }
  if (
    pixelDataElement.encapsulatedPixelData !== true ||
      pixelDataElement.hadUndefinedLength !== true ||
      pixelDataElement.basicOffsetTable === undefined ||
      pixelDataElement.fragments === undefined
  ) {
    throw new Error('Tried to read non-encapsulated pixel data as if it was encapsulated.');
  }
  if (frameIndex < 0) {
    throw new RangeError(invalidParameter(
      'frameIndex',
      `should be a positive integer, got ${frameIndex.toString(10)}`
    ));
  }

  // If the basic offset table is not empty, we can extract the frame
  if (pixelDataElement.basicOffsetTable.length !== 0) {
    return readEncapsulatedImageFrame(dataSet, pixelDataElement, frameIndex);
  }

  // No basic offset table, assume all fragments are for one frame - NOTE that this is NOT a valid
  // assumption but is the original behavior so we are keeping it for now
  return readEncapsulatedPixelDataFromFragments(dataSet, pixelDataElement, 0, pixelDataElement.fragments.length);
}
