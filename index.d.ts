declare module 'dicom-parser' {
 
  export type ByteArray = Uint8Array | Buffer;

  export interface Fragment {
    offset: number;
    position: number;
    length: number;
  }

  export interface Element {
    tag: string;
    vr?: string;
    length: number;
    dataOffset: number;
    items?: Element[];
    dataSet?: DataSet;
    parser?: ByteArrayParser;
    hadUndefinedLength?: boolean;

    encapsulatedPixelData?: boolean;
    basicOffsetTable?: number[];
    fragments?: Fragment[];
  }

  export interface DataSet {
    byteArray: ByteArray;
    byteArrayParser : ByteArrayParser;
    /**
     * Access element with the DICOM tag in the format xGGGGEEEE.
     */
    elements: {
      [tag: string]: Element;
    };
    warnings: string[];

    /**
     * Finds the element for tag and returns an unsigned int 16 if it exists and has data. Use this function for VR type US.
     */
    uint16: (tag: string, index?: number) => number;

    /**
     * Finds the element for tag and returns a signed int 16 if it exists and has data. Use this function for VR type SS.
     */
    int16: (tag: string, index?: number) => number;

    /**
     * Finds the element for tag and returns an unsigned int 32 if it exists and has data. Use this function for VR type UL.
     */
    uint32: (tag: string, index?: number) => number;

    /**
     * Finds the element for tag and returns a signed int 32 if it exists and has data. Use this function for VR type SL.
     */
    int32: (tag: string, index?: number) => number;

    /**
     * Finds the element for tag and returns a 32 bit floating point number if it exists and has data. Use this function for VR type FL.
     */
    float: (tag: string, index?: number) => number;

    /**
     * Finds the element for tag and returns a 64 bit floating point number if it exists and has data. Use this function for VR type FD.
     */
    double: (tag: string, index?: number) => number;

    /**
     * Returns the actual Value Multiplicity of an element - the number of values in a multi-valued element.
     */
    numStringValues: (tag: string) => number;

    /**
     * Finds the element for tag and returns a string if it exists and has data. Use this function for VR types AE, CS, SH, and LO.
     */
    string: (tag: string, index?: number) => string;

    /**
     * Finds the element for tag and returns a string with the leading spaces preserved and trailing spaces removed if it exists and has data. Use this function for VR types UT, ST, and LT.
     */
    text: (tag: string, index?: number) => string;

    /**
     * Finds the element for tag and parses a string to a float if it exists and has data. Use this function for VR type DS.
     */
    floatString: (tag: string, index?: number) => number;

    /**
     * Finds the element for tag and parses a string to an integer if it exists and has data. Use this function for VR type IS.
     */
    intString: (tag: string, index?: number) => number;

    /**
     * Finds the element for tag and parses an element tag according to the 'AT' VR definition if it exists and has data. Use this function for VR type AT.
     */
    attributeTag: (tag: string) => string;
  }

  export interface ByteStream {
    byteArray: ByteArray;
    byteArrayParser: ByteArrayParser;
    position: number;
    warnings: string[];
 
    new (byteArrayParser: ByteArrayParser, byteArray: ByteArray, position: number);
    seek: (offset: number) => void;
    readByteStream: (numBytes: number) => ByteStream;
    readUint16: () => number;
    readUint32: () => number;
    readFixedString: (length: number) => string;
  }

  export interface ByteArrayParser {
    readUint16: (byteArray: ByteArray, position: number) => number;
    readInt16: (byteArray: ByteArray, position: number) => number;
    readUint32: (byteArray: ByteArray, position: number) => number;
    readInt32: (byteArray: ByteArray, position: number) => number;
    readFloat: (byteArray: ByteArray, position: number) => number;
    readDouble: (byteArray: ByteArray, position: number) => number;
  }

  export interface ParseDicomOptions {
    untilTag?: string;
    vrCallback?: (tag: string) => void;
    inflater: (arr: Uint8Array, position: number) => void;
  }

  export function parseDicom(arr: Uint8Array, option?: ParseDicomOptions): DataSet;
 
}
