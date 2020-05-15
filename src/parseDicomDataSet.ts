import readDicomElementExplicit from './readDicomElementExplicit';
import readDicomElementImplicit from './readDicomElementImplicit';
import { IDataSet, IByteStream, ParseDicomOptions } from './types';

/**
 * Internal helper functions for parsing implicit and explicit DICOM data sets
 */

/**
 * reads an explicit data set
 * @param byteStream the byte stream to read from
 * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
 */
export const parseDicomDataSetExplicit = (dataSet: IDataSet, byteStream: IByteStream, maxPosition?, options: ParseDicomOptions = {}): void => {
	maxPosition = maxPosition === undefined ? byteStream.byteArray.length : maxPosition;

	if (byteStream === undefined) {
		throw new Error("dicomParser.parseDicomDataSetExplicit: missing required parameter 'byteStream'");
	}
	if (maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length) {
		throw new Error("dicomParser.parseDicomDataSetExplicit: invalid value for parameter 'maxP osition'");
	}
	const elements = dataSet.elements;
	let element;
	while (byteStream.position < maxPosition) {
		element = readDicomElementExplicit(byteStream, dataSet.warnings, options.untilTag);
		elements[element.tag] = element;
		if (element.tag === options.untilTag) {
			element = null;
			return;
		}
	}
	if (byteStream.position > maxPosition) {
		throw new Error('dicomParser:parseDicomDataSetExplicit: buffer overrun');
	}
};

/**
 * reads an implicit data set
 * @param byteStream the byte stream to read from
 * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
 */
export const parseDicomDataSetImplicit = (dataSet: IDataSet, byteStream: IByteStream, maxPosition?, options: ParseDicomOptions = {}): void => {
	maxPosition = maxPosition === undefined ? dataSet.byteArray.length : maxPosition;
	if (byteStream === undefined) {
		throw new Error("dicomParser.parseDicomDataSetImplicit: missing required parameter 'byteStream'");
	}
	if (maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length) {
		throw new Error("dicomParser.parseDicomDataSetImplicit: invalid value for parameter 'maxPosition'");
	}
	const elements = dataSet.elements;
	let element;
	while (byteStream.position < maxPosition) {
		element = readDicomElementImplicit(byteStream, options.untilTag, options.vrCallback);
		elements[element.tag] = element;
		if (element.tag === options.untilTag) {
			element = null;
			return;
		}
	}
};
