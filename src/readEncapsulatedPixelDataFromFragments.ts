import alloc from './alloc';
import ByteStream from './byteStream';
import readSequenceItem from './readSequenceItem';
import sharedCopy from './sharedCopy';
import { IDataSet, IDataSetElement, IFragment, ByteArray } from './types';

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
 * @param startFragmentIndex - zero based index of the first fragment to extract from
 * @param [numFragments] - the number of fragments to extract from, default is 1
 * @param [fragments] - optional array of objects describing each fragment (offset, position, length)
 * @returns {object} byte array with the encapsulated pixel data
 */
const readEncapsulatedPixelDataFromFragments = (dataSet: IDataSet, pixelDataElement: IDataSetElement, startFragmentIndex: number, numFragments?: number, fragments?: IFragment[]): ByteArray => {
	// default values
	numFragments = numFragments || 1;
	fragments = fragments || pixelDataElement.fragments;

	if (numFragments === undefined) {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: missing required parameter 'numFragments'");
	}
	if (pixelDataElement.tag !== 'x7fe00010') {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to non pixel data tag (expected tag = x7fe00010");
	}
	if (pixelDataElement.encapsulatedPixelData !== true) {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data");
	}
	if (pixelDataElement.hadUndefinedLength !== true) {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data");
	}
	if (pixelDataElement.basicOffsetTable === undefined) {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data");
	}
	if (pixelDataElement.fragments === undefined) {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data");
	}
	if (pixelDataElement.fragments.length <= 0) {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data");
	}
	if (startFragmentIndex < 0) {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'startFragmentIndex' must be >= 0");
	}
	if (startFragmentIndex >= pixelDataElement.fragments.length) {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'startFragmentIndex' must be < number of fragments");
	}
	if (numFragments < 1) {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'numFragments' must be > 0");
	}
	if (startFragmentIndex + numFragments > pixelDataElement.fragments.length) {
		throw new Error("dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'startFragment' + 'numFragments' < number of fragments");
	}

	// create byte stream on the data for this pixel data element
	const byteStream = new ByteStream(dataSet.byteArrayParser, dataSet.byteArray, pixelDataElement.dataOffset);

	// seek past the basic offset table (no need to parse it again since we already have)
	const basicOffsetTable = readSequenceItem(byteStream);

	if (basicOffsetTable.tag !== 'xfffee000') {
		throw new Error('dicomParser.readEncapsulatedPixelData: missing basic offset table xfffee000');
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
};
export default readEncapsulatedPixelDataFromFragments;
