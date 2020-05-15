import { IDataSet, IDataSetElement } from '../types';
import { isStringVr } from './util';

const multiElementToString = (numItems: number, dataSet: IDataSet, func: string, tag: string):string => {
	let result = '';
	for (let i = 0; i < numItems; i++) {
		if (i !== 0) {
			result += '/';
		}
		result += dataSet[func](dataSet, tag, i).toString();
	}
	return result;
};

/**
 * Converts an explicit VR element to a string or undefined if it is not possible to convert.
 * Throws an error if an implicit element is supplied
 * @param dataSet
 * @param element
 * @returns {*}
 */
const explicitElementToString = (dataSet: IDataSet, element: IDataSetElement):string => {
	if (dataSet === undefined || element === undefined) {
		throw new Error('dicomParser.explicitElementToString: missing required parameters');
	}
	if (element.vr === undefined) {
		throw new Error('dicomParser.explicitElementToString: cannot convert implicit element to string');
	}
	let textResult;
	if (isStringVr(element.vr) === true) {
		textResult = dataSet.string(element.tag);
	} else if (element.vr === 'AT') {
		let num = dataSet.uint32(element.tag);
		if (num === undefined) {
			return undefined;
		}
		if (num < 0) {
			num = 0xffffffff + num + 1;
		}
		return `x${num.toString(16).toUpperCase()}`;
	} else if (element.vr === 'US') {
		textResult = multiElementToString(element.length / 2, dataSet, dataSet.uint16.name, element.tag);
	} else if (element.vr === 'SS') {
		textResult = multiElementToString(element.length / 2, dataSet, dataSet.int16.name, element.tag);
	} else if (element.vr === 'UL') {
		textResult = multiElementToString(element.length / 4, dataSet, dataSet.uint32.name, element.tag);
	} else if (element.vr === 'SL') {
		textResult = multiElementToString(element.length / 4, dataSet, dataSet.int32.name, element.tag);
	} else if (element.vr === 'FD') {
		textResult = multiElementToString(element.length / 8, dataSet, dataSet.double.name, element.tag);
	} else if (element.vr === 'FL') {
		textResult = multiElementToString(element.length / 4, dataSet, dataSet.float.name, element.tag);
	}
	return textResult;
};
export default explicitElementToString;