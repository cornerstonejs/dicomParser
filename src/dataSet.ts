import  readFixedString from './byteArrayParser';
import { IByteArrayParser, IDataSet, IDataSetElement, ByteArray } from './types';

/**
 *
 * The DataSet class encapsulates a collection of DICOM Elements and provides various functions
 * to access the data in those elements
 *
 * Rules for handling padded spaces:
 * DS = Strip leading and trailing spaces
 * DT = Strip trailing spaces
 * IS = Strip leading and trailing spaces
 * PN = Strip trailing spaces
 * TM = Strip trailing spaces
 * AE = Strip leading and trailing spaces
 * CS = Strip leading and trailing spaces
 * SH = Strip leading and trailing spaces
 * LO = Strip leading and trailing spaces
 * LT = Strip trailing spaces
 * ST = Strip trailing spaces
 * UT = Strip trailing spaces
 *
 */
class DataSet implements IDataSet {
	byteArray: ByteArray;
	byteArrayParser: IByteArrayParser;
	elements: {
		[tag: string]: IDataSetElement;
	};

	position: number;
	warnings: any[] = [];

 /**
  * Constructs a new DataSet given byteArray and collection of elements
  * @param byteArrayParser
  * @param byteArray
  * @param elements
  */
	constructor(byteArrayParser, byteArray, elements) {
		this.byteArrayParser = byteArrayParser;
		this.byteArray = byteArray;
		this.elements = elements;
	}

	getByteArrayParser(element): IByteArrayParser {
		return element.parser !== undefined ? element.parser : this.byteArrayParser;
	}

	public uint16(tag: string, index?: number): number | undefined {
		const element = this.elements[tag];
		index = index !== undefined ? index : 0;
		if (element && element.length !== 0) {
			return this.getByteArrayParser(element).readUint16(this.byteArray, element.dataOffset + index * 2);
		}
		return undefined;
	}

	public int16(tag: string, index?: number): number | undefined {
		const element = this.elements[tag];
		index = index !== undefined ? index : 0;
		if (element && element.length !== 0) {
			return this.getByteArrayParser(element).readInt16(this.byteArray, element.dataOffset + index * 2);
		}
		return undefined;
	}

	public uint32(tag: string, index?: number): number | undefined {
		const element = this.elements[tag];
		index = index !== undefined ? index : 0;
		if (element && element.length !== 0) {
			return this.getByteArrayParser(element).readUint32(this.byteArray, element.dataOffset + index * 4);
		}
		return undefined;
	}

	public int32(tag: string, index?: number): number | undefined {
		const element = this.elements[tag];
		index = index !== undefined ? index : 0;
		if (element && element.length !== 0) {
			return this.getByteArrayParser(element).readInt32(this.byteArray, element.dataOffset + index * 4);
		}
		return undefined;
	}

	public float(tag: string, index?: number): number | undefined {
		const element = this.elements[tag];

		index = index !== undefined ? index : 0;
		if (element && element.length !== 0) {
			return this.getByteArrayParser(element).readFloat(this.byteArray, element.dataOffset + index * 4);
		}

		return undefined;
	}

	public double(tag: string, index?: number): number | undefined {
		const element = this.elements[tag];

		index = index !== undefined ? index : 0;
		if (element && element.length !== 0) {
			return this.getByteArrayParser(element).readDouble(this.byteArray, element.dataOffset + index * 8);
		}

		return undefined;
	}

	public numStringValues(tag: string): number {
		const element = this.elements[tag];
		if (element && element.length > 0) {
			const fixedString = readFixedString(this.byteArray, element.dataOffset, element.length);
			const numMatching = fixedString.match(/\\/g);
			if (numMatching === null) {
				return 1;
			}
			return numMatching.length + 1;
		}
		return undefined;
	}

	public string(tag: string, index?: number): string | undefined {
		const element = this.elements[tag];
		if (element && element.length > 0) {
			const fixedString = readFixedString(this.byteArray, element.dataOffset, element.length);
			if (index >= 0) {
				const values = fixedString.split('\\');
				// trim trailing spaces
				return values[index].trim();
			}
			// trim trailing spaces
			return fixedString.trim();
		}
		return undefined;
	}

	public text(tag: string, index?: number): string | undefined {
		const element = this.elements[tag];
		if (element && element.length > 0) {
			const fixedString = readFixedString(this.byteArray, element.dataOffset, element.length);
			if (index >= 0) {
				const values = fixedString.split('\\');
				return values[index].replace(/ +$/, '');
			}
			return fixedString.replace(/ +$/, '');
		}
		return undefined;
	}

	public floatString(tag: string, index?: number): number | undefined {
		const element = this.elements[tag];
		if (element && element.length > 0) {
			index = index !== undefined ? index : 0;
			const value = this.string(tag, index);
			if (value !== undefined) {
				return parseFloat(value);
			}
		}
		return undefined;
	}

	public intString(tag: string, index?: number): number | undefined {
		const element = this.elements[tag];
		if (element && element.length > 0) {
			index = index !== undefined ? index : 0;
			const value = this.string(tag, index);
			if (value !== undefined) {
				// tslint:disable-next-line: radix
				return parseInt(value);
			}
		}
		return undefined;
	}

	public attributeTag(tag: string): string | undefined {
		const element = this.elements[tag];
		if (element && element.length === 4) {
			const parser = this.getByteArrayParser(element).readUint16;
			const bytes = this.byteArray;
			const offset = element.dataOffset;
			return `x${`00000000${(parser(bytes, offset) * 256 * 256 + parser(bytes, offset + 2)).toString(16)}`.substr(-8)}`;
		}
		return undefined;
	}
}
export default DataSet;