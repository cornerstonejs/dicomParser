import pako from 'pako';

import alloc from './alloc';
import bigEndianByteArrayParser from './bigEndianByteArrayParser';
import ByteStream from './byteStream';
import DataSet from './dataSet';
import littleEndianByteArrayParser from './littleEndianByteArrayParser';
import readPart10Header from './readPart10Header';
import readFixedString from './byteArrayParser';
import * as parseDicomDataSet from './parseDicomDataSet';
import { ByteArray, ParseDicomOptions, IByteStream, IDataSet } from './types';

const readTransferSyntax = (metaHeaderDataSet: any, byteArray: ByteArray): string => {
	if (metaHeaderDataSet.elements.x00020010 === undefined) {
		throw new Error('dicomParser.parseDicom: missing required meta header attribute 0002,0010');
	}
	const transferSyntaxElement = metaHeaderDataSet.elements.x00020010;
	return readFixedString(byteArray, transferSyntaxElement.dataOffset, transferSyntaxElement.length);
};

const isExplicit = (transferSyntax: string): boolean => {
	// implicit little endian
	if (transferSyntax === '1.2.840.10008.1.2') {
		return false;
	}
	// all other transfer syntaxes should be explicit
	return true;
};

const getDataSetByteStream = (transferSyntax: string, position: number, byteArray: ByteArray, options?: ParseDicomOptions): IByteStream => {
	if (transferSyntax === '1.2.840.10008.1.2.1.99') {
		// if an infalter callback is registered, use it
		if (options && options.inflater) {
			const fullByteArrayCallback = options.inflater(byteArray, position);
			return new ByteStream(littleEndianByteArrayParser, fullByteArrayCallback, 0);
		} else {
			// inflate it
			const deflated = byteArray.slice(position);
			const inflated = pako.inflateRaw(deflated);
			// create a single byte array with the full header bytes and the inflated bytes
			const fullByteArray = alloc(byteArray, inflated.length + position);
			fullByteArray.set(byteArray.slice(0, position), 0);
			fullByteArray.set(inflated, position);
			return new ByteStream(littleEndianByteArrayParser, fullByteArray, 0);
		}
	}
	// explicit big endian
	if (transferSyntax === '1.2.840.10008.1.2.2') {
		return new ByteStream(bigEndianByteArrayParser, byteArray, position);
	}
	// all other transfer syntaxes are little endian; only the pixel encoding differs
	// make a new stream so the metaheader warnings don't come along for the ride
	return new ByteStream(littleEndianByteArrayParser, byteArray, position);
};

const mergeDataSets = (metaHeaderDataSet: IDataSet, instanceDataSet: IDataSet): IDataSet => {
	for (const propertyName in metaHeaderDataSet.elements) {
		if (metaHeaderDataSet.elements.hasOwnProperty(propertyName)) {
			instanceDataSet.elements[propertyName] = metaHeaderDataSet.elements[propertyName];
		}
	}
	if (metaHeaderDataSet.warnings !== undefined) {
		instanceDataSet.warnings = metaHeaderDataSet.warnings.concat(instanceDataSet.warnings);
	}

	return instanceDataSet;
};

const readDataSet = (metaHeaderDataSet: IDataSet, byteArray: ByteArray, options:ParseDicomOptions): IDataSet => {
	const transferSyntax = readTransferSyntax(metaHeaderDataSet, byteArray);
	const explicit = isExplicit(transferSyntax);
	const dataSetByteStream = getDataSetByteStream(transferSyntax, metaHeaderDataSet.position, byteArray, options);

	const elements = {};
	const dataSet = new DataSet(dataSetByteStream.byteArrayParser, dataSetByteStream.byteArray, elements);

	dataSet.warnings = dataSetByteStream.warnings;

	try {
		if (explicit) {
			parseDicomDataSet.parseDicomDataSetExplicit(dataSet, dataSetByteStream, dataSetByteStream.byteArray.length, options);
		} else {
			parseDicomDataSet.parseDicomDataSetImplicit(dataSet, dataSetByteStream, dataSetByteStream.byteArray.length, options);
		}
	} catch (e) {
		const ex = {
			exception: e,
			dataSet,
		};
		throw ex;
	}
	return dataSet;
};

/**
 * Parses a DICOM P10 byte array and returns a DataSet object with the parsed elements.
 * If the options argument is supplied and it contains the untilTag property, parsing
 * will stop once that tag is encoutered.  This can be used to parse partial byte streams.
 *
 * @param byteArray the byte array
 * @param options object to control parsing behavior (optional)
 * @returns {DataSet}
 * @throws error if an error occurs while parsing.  The exception object will contain a
 *         property dataSet with the elements successfully parsed before the error.
 */

const parseDicom = (byteArray, options?:ParseDicomOptions) => {
	if (byteArray === undefined) {
		throw new Error("dicomParser.parseDicom: missing required parameter 'byteArray'");
	}
	const metaHeaderDataSet = readPart10Header(byteArray, options);
	const dataSet = readDataSet(metaHeaderDataSet, byteArray, options);
	return mergeDataSets(metaHeaderDataSet, dataSet);
};
export default parseDicom;
