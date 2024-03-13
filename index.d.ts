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
    uint16: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a signed int 16 if it exists and has data. Use this function for VR type SS.
     */
    int16: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns an unsigned int 32 if it exists and has data. Use this function for VR type UL.
     */
    uint32: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a signed int 32 if it exists and has data. Use this function for VR type SL.
     */
    int32: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a 32 bit floating point number if it exists and has data. Use this function for VR type FL.
     */
    float: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a 64 bit floating point number if it exists and has data. Use this function for VR type FD.
     */
    double: (tag: string, index?: number) => number | undefined;

    /**
     * Returns the actual Value Multiplicity of an element - the number of values in a multi-valued element.
     */
    numStringValues: (tag: string) => number | undefined;

    /**
     * Finds the element for tag and returns a string if it exists and has data. Use this function for VR types AE, CS, SH, and LO.
     */
    string: (tag: string, index?: number) => string | undefined;

    /**
     * Finds the element for tag and returns a string with the leading spaces preserved and trailing spaces removed if it exists and has data. Use this function for VR types UT, ST, and LT.
     */
    text: (tag: string, index?: number) => string | undefined;

    /**
     * Finds the element for tag and parses a string to a float if it exists and has data. Use this function for VR type DS.
     */
    floatString: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and parses a string to an integer if it exists and has data. Use this function for VR type IS.
     */
    intString: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and parses an element tag according to the 'AT' VR definition if it exists and has data. Use this function for VR type AT.
     */
    attributeTag: (tag: string) => string | undefined;
  }

  export class ByteStream {
    byteArray: ByteArray;
    byteArrayParser: ByteArrayParser;
    position: number;
    warnings: string[];
 
    constructor(byteArrayParser: ByteArrayParser, byteArray: ByteArray, position: number);
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
    TransferSyntaxUID?: string;
    untilTag?: string;
    vrCallback?: (tag: string) => void;
    inflater?: (arr: Uint8Array, position: number) => void;
  }

  export function parseDicom(arr: Uint8Array, option?: ParseDicomOptions): DataSet

  export function isStringVr(vr: string): boolean
  export function isPrivateTag(tag: string): boolean
  export function parsePN(personName: string): {
    familyName?: string;
    givenName?: string;
    middleName?: string;
    prefix?: string;
    suffix?: string;
  }
  export function parseTM(time: string, validate?: boolean): {
    hours: number;
    minutes?: number;
    seconds?: number;
    fractionalSeconds?: number;
  }
  export function parseDA(date: string, validate?: boolean): {
    year: number;
    month: number;
    day: number;
  }
  export function explicitElementToString(dataSet: DataSet, element: Element): string
  type explicitDataSetToJSType = string | { dataOffset: number, length: number };
  export function explicitDataSetToJS(dataSet: DataSet, options?: { omitPrivateAttibutes: boolean, maxElementLength: number }): explicitDataSetToJSType | explicitDataSetToJSType[]
  export function createJPEGBasicOffsetTable(dataSet: DataSet, pixelDataElement: Element, fragments?: Fragment[]): number[];
  export function parseDicomDataSetExplicit(dataSet: DataSet, byteStream: ByteStream, maxPosition?: number, options?: { untilTag: string }): void
  type vrCallback = (tag: string) => string;
  export function parseDicomDataSetImplicit(dataSet: DataSet, byteStream: ByteStream, maxPosition?: number, options?: { untilTag: string, vrCallback?: vrCallback }): void
  export function readFixedString(byteArray: ByteArray, position: number, length: number): string
  export function alloc(byteArray: ByteArray, length: number): ByteArray
  export const version: string;
  export const bigEndianByteArrayParser: ByteArrayParser;
  export function sharedCopy(byteArray: ByteArray, byteOffset: number, length: number): ByteArray
  export function findAndSetUNElementLength(byteStream: ByteStream, element: Element): void
  export function findEndOfEncapsulatedElement(byteStream: ByteStream, element: Element, warnings?: string[]): void
  export function findItemDelimitationItemAndSetElementLength(byteStream: ByteStream, element: Element): void
  export const littleEndianByteArrayParser: ByteArrayParser;
  export function readDicomElementExplicit(byteStream: ByteStream, warnings?: string[], untilTag?: string): Element
  export function readDicomElementImplicit(byteStream: ByteStream, untilTag?: string, vrCallback?: vrCallback): Element
  export function readEncapsulatedImageFrame(dataSet: DataSet, pixelDataElement: Element, frameIndex: number, basicOffsetTable?: number[], fragments?: Fragment[]): ByteArray
  export function readEncapsulatedPixelData(dataSet: DataSet, pixelDataElement: Element, frame: number): ByteArray
  export function readEncapsulatedPixelDataFromFragments(dataSet: DataSet, pixelDataElement: Element, startFragmentIndex: number, numFragments?: number, fragments?: Fragment[]): ByteArray
  export function readPart10Header(byteArray: ByteArray, options?: { untilTag: string }): DataSet
  export function readSequenceItemsExplicit(byteStream: ByteStream, element: Element, warnings?: string[]): void
  export function readSequenceItemsImplicit(byteStream: ByteStream, element: Element, vrCallback?: vrCallback): void
  export function readSequenceItem(byteStream: ByteStream): Pick<Element, 'tag' | 'length' | 'dataOffset'>
  export function readTag(byteStream: ByteStream): string
 
}
