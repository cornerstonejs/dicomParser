import readEncapsulatedPixelDataFromFragments from './readEncapsulatedPixelDataFromFragments.js';
import { invalidParameter, missingParameter } from './util/errors.js';

/**
 * Functionality for extracting encapsulated pixel data
 */

const findFragmentIndexWithOffset = (fragments, offset) => {
  for (let i = 0; i < fragments.length; i++) {
    if (fragments[i].offset === offset) {
      return i;
    }
  }
};

const calculateNumberOfFragmentsForFrame = (frameIndex, basicOffsetTable, fragments, startFragmentIndex) => {
  // special case for last frame
  if (frameIndex === basicOffsetTable.length - 1) {
    return fragments.length - startFragmentIndex;
  }

  // iterate through each fragment looking for the one matching the offset for the next frame
  const nextFrameOffset = basicOffsetTable[frameIndex + 1];

  for (let i = startFragmentIndex + 1; i < fragments.length; i++) {
    if (fragments[i].offset === nextFrameOffset) {
      return i - startFragmentIndex;
    }
  }

  throw new Error('Failed to compute number of fragments for frame: could not find fragment with offset matching basic offset table.');
};

/**
 * Returns the pixel data for the specified frame in an encapsulated pixel data element that has a non
 * empty basic offset table.  Note that this function will fail if the basic offset table is empty - in that
 * case you need to determine which fragments map to which frames and read them using
 * readEncapsulatedPixelDataFromFragments().  Also see the function createJEPGBasicOffsetTable() to see
 * how a basic offset table can be created for JPEG images
 *
 * @param dataSet - the dataSet containing the encapsulated pixel data
 * @param pixelDataElement - the pixel data element (x7fe00010) to extract the frame from
 * @param {number} frameIndex - the zero based frame index
 * @param [basicOffsetTable] - optional array of starting offsets for frames
 * @param [fragments] - optional array of objects describing each fragment (offset, position, length)
 * @returns {object} with the encapsulated pixel data
 */
export default function readEncapsulatedImageFrame (dataSet, pixelDataElement, frameIndex, basicOffsetTable, fragments) {
  // default parameters
  basicOffsetTable = basicOffsetTable || pixelDataElement.basicOffsetTable;
  fragments = fragments || pixelDataElement.fragments;

  // Validate parameters
  if (dataSet === undefined) {
    throw new TypeError(missingParameter('dataSet'));
  }
  if (pixelDataElement === undefined) {
    throw new TypeError(missingParameter('pixelDataElement'));
  }
  if (frameIndex === undefined) {
    throw new TypeError(missingParameter('frameIndex'));
  }
  if (basicOffsetTable === undefined) {
    throw new TypeError(invalidParameter('pixelDataElement', 'missing required property \'basicOffsetTable\''));
  }
  if (pixelDataElement.tag !== 'x7fe00010') {
    // PR question : should this be a warning, and we fall back to x7fe00010 anyway ?
    throw new TypeError(invalidParameter(
      'pixelDataElement',
      `'tag' property refers to non pixel data tag, should be 'x7fe00010', got '${pixelDataElement.tag}'`
    ));
  }
  if (
    pixelDataElement.encapsulatedPixelData !== true ||
      pixelDataElement.hadUndefinedLength !== true ||
      pixelDataElement.fragments === undefined
  ) {
    // PR question : this can only originate from a defect in dicomParser, should it be signified in the error message
    // and should we take any kind of action ?
    throw new Error('Tried to read non-encapsulated pixel data as if it was encapsulated.');
  }
  if (basicOffsetTable.length === 0) {
    throw new RangeError(invalidParameter('basicOffsetTable', 'table has no entry.'));
  }
  if (frameIndex < 0 || basicOffsetTable.length <= frameIndex) {
    throw new RangeError(invalidParameter(
      'frameIndex',
      `should map into the basic offset table [0..${basicOffsetTable.length - 1}], got ${
        frameIndex.toString(10)}.`
    ));
  }

  // find starting fragment based on the offset for the frame in the basic offset table
  const offset = basicOffsetTable[frameIndex];
  const startFragmentIndex = findFragmentIndexWithOffset(fragments, offset);

  if (startFragmentIndex === undefined) {
    throw new RangeError('Failed to find fragment matching basic offset table entry.');
  }

  // calculate the number of fragments for this frame
  const numFragments = calculateNumberOfFragmentsForFrame(frameIndex, basicOffsetTable, fragments, startFragmentIndex);

  // now extract the frame from the fragments
  return readEncapsulatedPixelDataFromFragments(dataSet, pixelDataElement, startFragmentIndex, numFragments, fragments);
}
