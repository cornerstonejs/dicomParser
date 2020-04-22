declare module 'dicom-parser' {
 
  export type ByteArray = Uint8Array | Buffer;

  export interface Element {
    tag: string;
    vr?: string;
    length: number;
    dataOffset: number;
    items?: Element[];
    dataSet?: DataSet;
    parser?: ByteArrayParser;
  }

  export interface DataSet {
    byteArray: ByteArray;
    byteArrayParser : ByteArrayParser;
    elements: {
      [key: string]: Element;
    };
    warnings: string[];

    /**
     * Finds the element for tag and returns an unsigned int 16 if it exists and has data. Use this function for VR type US.
     */
    uint16: (tag: string, index: number) => number;

    /**
     * Finds the element for tag and returns an signed int 16 if it exists and has data. Use this function for VR type SS.
     */
    int16: (tag: string, index: number) => number;

    /**
     * Finds the element for tag and returns an unsigned int 32 if it exists and has data. Use this function for VR type UL.
     */
    uint32: (tag: string, index: number) => number;

    /**
     * Finds the element for tag and returns an signed int 32 if it exists and has data. Use this function for VR type SL.
     */
    int32: (tag: string, index: number) => number;

    /**
     * Finds the element for tag and returns a 32 bit floating point number if it exists and has data. Use this function for VR type FL.
     */
    float: (tag: string, index: number) => number;

    /**
     * Finds the element for tag and returns a 64 bit floating point number if it exists and has data. Use this function for VR type FD.
     */
    double: (tag: string, index: number) => number;

    /**
     * Returns the Value Multiplicity of an elements - the number of values in a multi-valued element.
     */
    numStringValues: (tag: string) => number;

    /**
     * Finds the element for tag and returns a string if it exists and has data. Use this function for VR types AE, CS, SH, and LO.
     */
    string: (tag: string, index: number) => string;

    /**
     * Finds the element for tag and returns a string with the leading spaces preserved and trailing spaces removed if it exists and has data. Use this function for VR types UT, ST, and LT.
     */
    text: (tag: string, index: number) => string;

    /**
     * Finds the element for tag and parses a string to a float if it exists and has data. Use this function for VR type DS.
     */
    floatString: (tag: string, index: number) => number;

    /**
     * Finds the element for tag and parses a string to an integer if it exists and has data. Use this function for VR type IS.
     */
    intString: (tag: string, index: number) => number;

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
