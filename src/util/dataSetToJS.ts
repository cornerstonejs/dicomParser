import explicitElementToString from './elementToString';
import * as util from './util';
import { IDataSet, DataSetToJSOptions } from '../types';

/**
 * converts an explicit dataSet to a javascript object
 * @param dataSet
 * @param options
 */
const explicitDataSetToJS = (dataSet: IDataSet, options:DataSetToJSOptions): any => {
	if (dataSet === undefined) {
		throw new Error('dicomParser.explicitDataSetToJS: missing required parameter dataSet');
	}
	options = options || {
		omitPrivateAttibutes: true, // true if private elements should be omitted
		maxElementLength: 128, // maximum element length to try and convert to string format
	};

	const result = {};
	for (const tag in dataSet.elements) {
		const element = dataSet.elements[tag];
		// skip this element if it a private element and our options specify that we should
		if (options.omitPrivateAttibutes === true && util.isPrivateTag(tag)) {
			continue;
		}
		if (element.items) {
			// handle sequences
			const sequenceItems = [];
			for (let i = 0; i < element.items.length; i++) {
				sequenceItems.push(explicitDataSetToJS(element.items[i].dataSet, options));
			}
			result[tag] = sequenceItems;

		} else {
			if (element.length < options.maxElementLength) {
				result[tag] = explicitElementToString(dataSet, element);
			}

			if (result[tag] === undefined) {
				result[tag] = {
					dataOffset: element.dataOffset,
					length: element.length,
				};
			}
		}
	}
	return result;
};
export default explicitDataSetToJS;
