import { IByteArrayParser, ByteArray } from './types';

/**
 * Internal helper functions for parsing different types from a little-endian byte array
 */
const littleEndianByteArrayParser: IByteArrayParser = {

	readUint16(byteArray: ByteArray, position: number): number {
		if (position < 0) {
			throw new Error('littleEndianByteArrayParser.readUint16: position cannot be less than 0');
		}

		if (position + 2 > byteArray.length) {
			throw new Error('littleEndianByteArrayParser.readUint16: attempt to read past end of buffer');
		}

		return byteArray[position] + byteArray[position + 1] * 256;
	},

	readInt16(byteArray: ByteArray, position: number): number {
		if (position < 0) {
			throw new Error('littleEndianByteArrayParser.readInt16: position cannot be less than 0');
		}
		if (position + 2 > byteArray.length) {
			throw new Error('littleEndianByteArrayParser.readInt16: attempt to read past end of buffer');
		}

		let int16 = byteArray[position] + (byteArray[position + 1] << 8);

		// fix sign
		if (int16 & 0x8000) {
			int16 = int16 - 0xffff - 1;
		}

		return int16;
	},

	readUint32(byteArray: ByteArray, position: number): number {
		if (position < 0) {
			throw new Error('littleEndianByteArrayParser.readUint32: position cannot be less than 0');
		}

		if (position + 4 > byteArray.length) {
			throw new Error('littleEndianByteArrayParser.readUint32: attempt to read past end of buffer');
		}

		return byteArray[position] + byteArray[position + 1] * 256 + byteArray[position + 2] * 256 * 256 + byteArray[position + 3] * 256 * 256 * 256;
	},

	readInt32(byteArray: ByteArray, position: number): number {
		if (position < 0) {
			throw new Error('littleEndianByteArrayParser.readInt32: position cannot be less than 0');
		}

		if (position + 4 > byteArray.length) {
			throw new Error('littleEndianByteArrayParser.readInt32: attempt to read past end of buffer');
		}

		return byteArray[position] + (byteArray[position + 1] << 8) + (byteArray[position + 2] << 16) + (byteArray[position + 3] << 24);
	},

	readFloat(byteArray: ByteArray, position: number): number {
		if (position < 0) {
			throw new Error('littleEndianByteArrayParser.readFloat: position cannot be less than 0');
		}

		if (position + 4 > byteArray.length) {
			throw new Error('littleEndianByteArrayParser.readFloat: attempt to read past end of buffer');
		}

		// I am sure there is a better way than this but this should be safe
		const byteArrayForParsingFloat = new Uint8Array(4);

		byteArrayForParsingFloat[0] = byteArray[position];
		byteArrayForParsingFloat[1] = byteArray[position + 1];
		byteArrayForParsingFloat[2] = byteArray[position + 2];
		byteArrayForParsingFloat[3] = byteArray[position + 3];

		const floatArray = new Float32Array(byteArrayForParsingFloat.buffer);

		return floatArray[0];
	},

	readDouble(byteArray: ByteArray, position: number): number {
		if (position < 0) {
			throw new Error('littleEndianByteArrayParser.readDouble: position cannot be less than 0');
		}

		if (position + 8 > byteArray.length) {
			throw new Error('littleEndianByteArrayParser.readDouble: attempt to read past end of buffer');
		}

		// I am sure there is a better way than this but this should be safe
		const byteArrayForParsingFloat = new Uint8Array(8);

		byteArrayForParsingFloat[0] = byteArray[position];
		byteArrayForParsingFloat[1] = byteArray[position + 1];
		byteArrayForParsingFloat[2] = byteArray[position + 2];
		byteArrayForParsingFloat[3] = byteArray[position + 3];
		byteArrayForParsingFloat[4] = byteArray[position + 4];
		byteArrayForParsingFloat[5] = byteArray[position + 5];
		byteArrayForParsingFloat[6] = byteArray[position + 6];
		byteArrayForParsingFloat[7] = byteArray[position + 7];

		const floatArray = new Float64Array(byteArrayForParsingFloat.buffer);

		return floatArray[0];
	},
};

export default littleEndianByteArrayParser;
