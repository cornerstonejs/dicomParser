import DataSet from './dataSet';
import readDicomElementExplicit from './readDicomElementExplicit';
import readSequenceItem from './readSequenceItem';
import readTag from './readTag';
import * as parseDicomDataSet from './parseDicomDataSet';
import { IByteStream, IDataSet } from './types';

/**
 * Internal helper functions for parsing DICOM elements
 */

const readDicomDataSetExplicitUndefinedLength = (byteStream: IByteStream, warnings: string[]): IDataSet => {
	const elements = {};
	while (byteStream.position < byteStream.byteArray.length) {
		const element = readDicomElementExplicit(byteStream, warnings);
		elements[element.tag] = element;
		// we hit an item delimiter tag, return the current offset to mark
		// the end of this sequence item
		if (element.tag === 'xfffee00d') {
			return new DataSet(byteStream.byteArrayParser, byteStream.byteArray, elements);
		}
	}
	// eof encountered - log a warning and return what we have for the element
	warnings.push('eof encountered before finding item delimiter tag while reading sequence item of undefined length');
	return new DataSet(byteStream.byteArrayParser, byteStream.byteArray, elements);
};

const readSequenceItemExplicit = (byteStream: IByteStream, warnings: string[]): any => {
	const item = readSequenceItem(byteStream);
	if (item.length === 4294967295) {
		item.hadUndefinedLength = true;
		item.dataSet = readDicomDataSetExplicitUndefinedLength(byteStream, warnings);
		item.length = byteStream.position - item.dataOffset;
	} else {
		item.dataSet = new DataSet(byteStream.byteArrayParser, byteStream.byteArray, {});
		parseDicomDataSet.parseDicomDataSetExplicit(item.dataSet, byteStream, byteStream.position + item.length);
	}
	return item;
};

const readSQElementUndefinedLengthExplicit = (byteStream: IByteStream, element: any, warnings: string[]): any => {
	while (byteStream.position + 4 <= byteStream.byteArray.length) {
		// end reading this sequence if the next tag is the sequence delimitation item
		const nextTag = readTag(byteStream);
		byteStream.seek(-4);
		if (nextTag === 'xfffee0dd') {
			// set the correct length
			element.length = byteStream.position - element.dataOffset;
			byteStream.seek(8);
			return element;
		}
		const item = readSequenceItemExplicit(byteStream, warnings);
		element.items.push(item);
	}
	warnings.push('eof encountered before finding sequence delimitation tag while reading sequence of undefined length');
	element.length = byteStream.position - element.dataOffset;
};

const readSQElementKnownLengthExplicit = (byteStream: IByteStream, element: any, warnings: string[]) => {
	const maxPosition = element.dataOffset + element.length;
	while (byteStream.position < maxPosition) {
		const item = readSequenceItemExplicit(byteStream, warnings);
		element.items.push(item);
	}
};

const readSequenceItemsExplicit = (byteStream: IByteStream, element: any, warnings: string[]) => {
	if (byteStream === undefined) {
		throw new Error("dicomParser.readSequenceItemsExplicit: missing required parameter 'byteStream'");
	}

	if (element === undefined) {
		throw new Error("dicomParser.readSequenceItemsExplicit: missing required parameter 'element'");
	}

	element.items = [];

	if (element.length === 4294967295) {
		readSQElementUndefinedLengthExplicit(byteStream, element, warnings);
	} else {
		readSQElementKnownLengthExplicit(byteStream, element, warnings);
	}
};
export default readSequenceItemsExplicit;