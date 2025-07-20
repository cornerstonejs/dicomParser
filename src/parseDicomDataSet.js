import readDicomElementExplicit from './readDicomElementExplicit.js';
import readDicomElementImplicit from './readDicomElementImplicit.js';
import { invalidParameter, missingParameter, overflowErrorMessage } from './util/errors.js';

/**
 * Internal helper functions for parsing implicit and explicit DICOM data sets
 */

/**
 * reads an explicit data set
 * @param {DataSet} dataSet to read from
 * @param byteStream the byte stream to read from
 * @param {number} maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
 * @param {object} options
 * @param {string} options.untilTag stop the parsing when encountering this tag
 *
 */
export function parseDicomDataSetExplicit (dataSet, byteStream, maxPosition, options = {}) {
  maxPosition = (maxPosition === undefined) ? byteStream.byteArray.length : maxPosition;

  if (byteStream === undefined) {
    throw new TypeError(missingParameter('byteStream'));
  }

  if (maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length) {
    throw new RangeError(invalidParameter('maxPosition', `should be greater than current position (${byteStream.position.toString(10)
    } and smaller than buffer length (${byteStream.byteArray.length.toString(10)}), got ${maxPosition.toString(10)}`));
  }

  const elements = dataSet.elements;

  while (byteStream.position < maxPosition) {
    const element = readDicomElementExplicit(byteStream, dataSet.warnings, options.untilTag);

    elements[element.tag] = element;
    if (element.tag === options.untilTag) {
      return;
    }
  }

  if (byteStream.position > maxPosition) {
    throw new RangeError(overflowErrorMessage);
  }
}

/**
 * reads an implicit data set
 * @param {DataSet} dataSet to read from
 * @param byteStream the byte stream to read from
 * @param {number} maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
 * @param {object} options
 * @param {string} options.untilTag stop the parsing when encountering this tag
 */
export function parseDicomDataSetImplicit (
  dataSet,
  byteStream,
  maxPosition,
  options = {}
) {
  maxPosition = (maxPosition === undefined) ? dataSet.byteArray.length : maxPosition;

  if (byteStream === undefined) {
    throw new TypeError(missingParameter('byteStream'));
  }

  if (maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length) {
    throw new RangeError(invalidParameter('maxPosition', `should be greater than current position (${
      byteStream.position.toString(10)} and smaller than buffer length (${
      byteStream.byteArray.length.toString(10)}), got ${maxPosition.toString(10)}`));
  }

  const elements = dataSet.elements;

  while (byteStream.position < maxPosition) {
    const element = readDicomElementImplicit(byteStream, options.untilTag, options.vrCallback);

    elements[element.tag] = element;
    if (element.tag === options.untilTag) {
      return;
    }
  }
}
