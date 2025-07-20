import alloc from './alloc.js';
import ByteStream from './byteStream.js';
import readSequenceItem from './readSequenceItem.js';
import sharedCopy from './sharedCopy.js';
import { invalidParameter, missingParameter } from './util/errors.js';

/**
 * Functionality for extracting encapsulated pixel data
 */

const calculateBufferSize = (fragments, startFragment, numFragments) => {
  let bufferSize = 0;

  for (let i = startFragment; i < startFragment + numFragments; i++) {
    bufferSize += fragments[i].length;
  }

  return bufferSize;
};

/**
 * Returns the encapsulated pixel data from the specified fragments.  Use this function when you know
 * the fragments you want to extract data from.  See
 *
 * @param dataSet - the dataSet containing the encapsulated pixel data
 * @param pixelDataElement - the pixel data element (x7fe00010) to extract the fragment data from
 * @param {number} startFragmentIndex - zero based index of the first fragment to extract from
 * @param [numFragments] - the number of fragments to extract from, default is 1
 * @param [fragments] - optional array of objects describing each fragment (offset, position, length)
 * @returns {object} byte array with the encapsulated pixel data
 */
export default function readEncapsulatedPixelDataFromFragments (dataSet, pixelDataElement, startFragmentIndex, numFragments, fragments) {
  // default values
  numFragments = numFragments || 1;
  fragments = fragments || pixelDataElement.fragments;

  // check parameters
  if (dataSet === undefined) {
    throw new TypeError(missingParameter('dataSet'));
  }
  if (pixelDataElement === undefined) {
    throw new TypeError(missingParameter('pixelDataElement'));
  }
  if (startFragmentIndex === undefined) {
    throw new TypeError(missingParameter('startFragmentIndex'));
  }
  if (numFragments === undefined) {
    throw new TypeError(missingParameter('numFragments'));
  }
  if (pixelDataElement.tag !== 'x7fe00010') {
    throw new TypeError(invalidParameter('pixelDataElement', `'tag' property refers to non pixel data tag, should be 'x7fe00010', got '${pixelDataElement.tag}'`));
  }
  if (
    pixelDataElement.encapsulatedPixelData !== true ||
      pixelDataElement.hadUndefinedLength !== true ||
      pixelDataElement.basicOffsetTable === undefined ||
      pixelDataElement.fragments === undefined ||
      pixelDataElement.fragments.length <= 0
  ) {
    throw new Error('Tried to read non-encapsulated pixel data as if it was encapsulated.');
  }
  if (startFragmentIndex < 0 || pixelDataElement.fragments.length <= startFragmentIndex) {
    throw new RangeError(invalidParameter(
      'startFragmentIndex',
      `should map to one of the element's fragments [0..${pixelDataElement.fragments.length - 1
      }], got ${startFragmentIndex.toString(10)}`
    ));
  }
  if (numFragments < 1) {
    throw new RangeError(invalidParameter(
      'numFragments',
      `should be a positive integer, got ${numFragments.toString(10)}`
    ));
  }
  if (startFragmentIndex + numFragments > pixelDataElement.fragments.length) {
    throw new RangeError(`Tried to read more fragments (${(startFragmentIndex + numFragments).toString(10)
    } than available (${pixelDataElement.fragments.length})`);
  }

  // create byte stream on the data for this pixel data element
  const byteStream = new ByteStream(dataSet.byteArrayParser, dataSet.byteArray, pixelDataElement.dataOffset);

  // seek past the basic offset table (no need to parse it again since we already have)
  const basicOffsetTable = readSequenceItem(byteStream);

  if (basicOffsetTable.tag !== 'xfffee000') {
    throw new TypeError('Failed to find basic offset table starting item tag (FFFE,E000).');
  }

  byteStream.seek(basicOffsetTable.length);

  const fragmentZeroPosition = byteStream.position;

  // tag + length
  const fragmentHeaderSize = 8;

  // if there is only one fragment, return a view on this array to avoid copying
  if (numFragments === 1) {
    return sharedCopy(byteStream.byteArray, fragmentZeroPosition + fragments[startFragmentIndex].offset + fragmentHeaderSize, fragments[startFragmentIndex].length);
  }

  // more than one fragment, combine all of the fragments into one buffer
  const bufferSize = calculateBufferSize(fragments, startFragmentIndex, numFragments);
  const pixelData = alloc(byteStream.byteArray, bufferSize);

  let pixelDataIndex = 0;

  for (let i = startFragmentIndex; i < startFragmentIndex + numFragments; i++) {
    let fragmentOffset = fragmentZeroPosition + fragments[i].offset + fragmentHeaderSize;

    for (let j = 0; j < fragments[i].length; j++) {
      pixelData[pixelDataIndex++] = byteStream.byteArray[fragmentOffset++];
    }
  }

  return pixelData;
}
