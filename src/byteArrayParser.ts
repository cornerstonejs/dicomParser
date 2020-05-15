import { ByteArray } from './types';

/**
 * Internal helper functions common to parsing byte arrays of any type
 */

/**
 * Reads a string of 8-bit characters from an array of bytes and advances
 * the position by length bytes.  A null terminator will end the string
 * but will not effect advancement of the position.  Trailing and leading
 * spaces are preserved (not trimmed)
 */
const readFixedString = (byteArray: ByteArray, position: number, length: number): string => {
	if (length < 0) {
		throw new Error('dicomParser.readFixedString - length cannot be less than 0');
	}

	if (position + length > byteArray.length) {
		throw new Error('dicomParser.readFixedString: attempt to read past end of buffer');
	}

	let result = '';
	let byte;

	for (let i = 0; i < length; i++) {
		byte = byteArray[position + i];
		if (byte === 0) {
			position += length;
			return result;
		}
		result += String.fromCharCode(byte);
	}
	return result;
};
export default readFixedString;
