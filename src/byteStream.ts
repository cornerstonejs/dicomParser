import sharedCopy from './sharedCopy';
import readFixedString  from './byteArrayParser';
import { IByteStream, IByteArrayParser, ByteArray } from './types';

/**
 *
 * Internal helper class to assist with parsing. Supports reading from a byte
 * stream contained in a Uint8Array.  Example usage:
 *
 *  var byteArray = new Uint8Array(32);
 *  var byteStream = new dicomParser.ByteStream(dicomParser.littleEndianByteArrayParser, byteArray);
 *
 */

/**
 * Constructor for ByteStream objects.
 * @param byteArrayParser a parser for parsing the byte array
 * @param byteArray a Uint8Array containing the byte stream
 * @param position (optional) the position to start reading from.  0 if not specified
 * @constructor
 * @throws will throw an error if the byteArrayParser parameter is not present
 * @throws will throw an error if the byteArray parameter is not present or invalid
 * @throws will throw an error if the position parameter is not inside the byte array
 */
class ByteStream implements IByteStream {
	public byteArrayParser: IByteArrayParser;
	public byteArray: ByteArray;
	public position: number;
	public warnings: any[];

	// i am not sure about the position requirment here
	constructor(byteArrayParser?: IByteArrayParser, byteArray?: ByteArray, position?: number) {
		if (byteArrayParser === undefined) {
			throw new Error("dicomParser.ByteStream: missing required parameter 'byteArrayParser'");
		}
		if (byteArray === undefined) {
			throw new Error("dicomParser.ByteStream: missing required parameter 'byteArray'");
		}
		if (byteArray instanceof Uint8Array === false && byteArray instanceof Buffer === false) {
			throw new Error('dicomParser.ByteStream: parameter byteArray is not of type Uint8Array or Buffer');
		}
		if (position < 0) {
			throw new Error("dicomParser.ByteStream: parameter 'position' cannot be less than 0");
		}
		if (position >= byteArray.length) {
			throw new Error("dicomParser.ByteStream: parameter 'position' cannot be greater than or equal to 'byteArray' length");
		}
		this.byteArrayParser = byteArrayParser;
		this.byteArray = byteArray;
		this.position = position ? position : 0;
		this.warnings = [];
	}

	public seek(offset: number): void {
		if (this.position + offset < 0) {
			throw new Error('dicomParser.ByteStream.prototype.seek: cannot seek to position < 0');
		}
		this.position += offset;
	}

	public readByteStream(numBytes: number): IByteStream {
		if (this.position + numBytes > this.byteArray.length) {
			throw new Error('dicomParser.ByteStream.prototype.readByteStream: readByteStream - buffer overread');
		}
		const byteArrayView = sharedCopy(this.byteArray, this.position, numBytes);
		this.position += numBytes;
		return new ByteStream(this.byteArrayParser, byteArrayView);
	}

	public readUint16(): number {
		const result = this.byteArrayParser.readUint16(this.byteArray, this.position);
		this.position += 2;
		return result;
	}

	public readUint32(): number {
		const result = this.byteArrayParser.readUint32(this.byteArray, this.position);
		this.position += 4;
		return result;
	}

	public readFixedString(length: number): string {
		const result = readFixedString(this.byteArray, this.position, length);
		this.position += length;
		return result;
	}
}
export default ByteStream;
