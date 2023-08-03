declare module 'dicom-parser' {
  /**
   * The tag of an element in the format `xGGGGEEEE` where :
   * - `GGGG` stands for the big endian hexadecimal representation of the element's group number
   * - `EEEE` stands for the big endian hexadecimal representation of the element's element number
   * 
   * The `x` at the start is here to allow property access without requiring the use of the index access syntax.
   */
  export type Tag = `x${string}`;

  export const enum VR {
    /** Application Entity */ 
    AE = 'AE',
    /** Age String */ 
    AS = 'AS',
    /** Attribute Tag */ 
    AT = 'AT',
    /** Code String */ 
    CS = 'CS',
    /** Date */ 
    DA = 'DA',
    /** Decimal String */ 
    DS = 'DS',
    /** Date Time */ 
    DT = 'DT',
    /** Floating Point Single */ 
    FL = 'FL',
    /** Floating Point Double */ 
    FD = 'FD',
    /** Integer String */ 
    IS = 'IS',
    /** Long String */ 
    LO = 'LO',
    /** Long Text */ 
    LT = 'LT',
    /** Other Byte String */ 
    OB = 'OB',
    /** Other Double String */ 
    OD = 'OD',
    /** Other Float String */ 
    OF = 'OF',
    /** Other Word String */ 
    OW = 'OW',
    /** Person Name */ 
    PN = 'PN',
    /** Short String */ 
    SH = 'SH',
    /** Signed Long */ 
    SL = 'SL',
    /** Sequence of Items */ 
    SQ = 'SQ',
    /** Signed Short */ 
    SS = 'SS',
    /** Short Text */ 
    ST = 'ST',
    /** Time */ 
    TM = 'TM',
    /** Unique Identifier (UID) */ 
    UI = 'UI',
    /** Unsigned Long */ 
    UL = 'UL',
    /** Unknown */ 
    UN = 'UN',
    /** Unsigned Short */ 
    US = 'US',
    /** Unlimited Text */ 
    UT = 'UT'
  }

  /**
   * Base template from which all elements in dataset inherit from.
   */
  export interface DataElement {
    /**
     * The tag of the element in the format `xGGGGEEEE`.
     * @see {@link Tag} for details on the formatting.
     */
    tag: Tag;
    /**
     * The value representation of the element.  
     * This property will be undefined for file encoded using a transfer syntax using implicit VR,
     * such as "Implicit VR Little Endian" (UID=1.2.840.10008.1.​2) which is the default transfer
     * syntax defined by the spec and is thus widely used.
     */
    vr?: VR;
    /**
     * The number of bytes in the Value field of the element.  
     * This property will be populated even if the element is defined with an undefined VL (0xFFFFFFFF).
     */
    length: number;
    /**
     * Byte offset, from the start of the byte stream, where the Value field of the element starts
     */
    dataOffset: number;
    /**
     * Is the element defined with an undefined VL (0xFFFFFFFF)?  
     * This property will be absent from elements with a defined Value Length, `true` otherwise.
     */
    hadUndefinedLength?: true;
  }

  /**
   * Used exclusively for Elements in the File Meta Information Group.
   */
  export interface FileMetaInformationElement extends DataElement {
    /**
     * A little-endian parser provided as all elements of this group are required to be
     * encoded in the "Explicit VR Little Endian Transfer Syntax" (UID=1.2.840.10008.1.2.1)
     * as defined in [DICOM PS3.5](https://dicom.nema.org/medical/dicom/current/output/html/part05.html#PS3.5)
     */
    parser: ByteArrayParser;
  }

  /**
   * Used exclusively for `(7fe0,0010) Pixel Data Attribute` elements that are encoded using
   * dataset encapsulation as defined in [DICOM PS3.5 A.4](https://dicom.nema.org/medical/dicom/2016b/output/chtml/part05/sect_A.4.html).
   */
  export interface EncapsulatedPixelDataElement extends DataElement {
    /**
     * @inheritdoc
     * The Pixel Data Attribute can only be encoded with VR of {@link VR.OB OB} or {@link VR.OW OW} 
     */
    vr?: VR.OB | VR.OW;

    /**
     * Pixel Data Attributes encoded using encapsulation are required to have a 
     * Value Length field set to undefined (0xFFFFFFFF).
     */
    hadUndefinedLength: true;

    /**
     * This field discriminates between a Pixel Data Attribute element simply encoded with 
     * an undefined length and one actually using data set encapsulation.
     */
    encapsulatedPixelData: true;
    /**
     * Holds the byte offset of each fragment, the first of which is the Basic Offset Table itself (it will always be 0).
     * This property will always be present but might be empty depending on how the file was encoded.
     */
    basicOffsetTable: number[];
    /**
     * Holds the information needed to extract the fragments from the byte stream.
     * This property will always be populated with as many fragments as there are in the file.
     */
    fragments: Fragment[];
  }

  /**
   * Used inside an {@link EncapsulatedPixelDataElement} to define the position of each encapsulated element.
   */
  export interface Fragment {
    /**
     * Byte offset, indexing from the start of the Pixel Data Attribute element, where the fragment starts.
     */
    offset: number;
    /**
     * Byte offset, indexing from the start of the byte stream, where the fragment data starts.
     */
    position: number;
    /**
     * Number of bytes contained by the fragment.
     */
    length: number;
  }

  /**
   * Basically an array of sub-datasets.
   */
  export interface Sequence extends DataElement {
    /**
     * This field will always be populated for Sequence elements as they would not have been 
     * parsed correctly otherwise, this doesn't reflect whether or not the transfer syntax
     * uses implicit or explicit VR.
     */
    vr: VR.SQ;

    /**
     * Holds the items making up the sequence, can be empty if the sequence doesn't have any item.
     */
    items: SequenceItem[];
  }

  /**
   * Used inside a {@link Sequence} to define the content of an item of the sequence
   */
  export interface SequenceItem {
    /**
     * Holds the elements contained by the sequence item.
     */
    dataSet: DataSet;

    /**
     * Number of bytes in the item's dataset
     */
    length: number;

    /**
     * Byte offset to the start of the item's dataset
     */
    dataOffset: number;
  }

  /**
   * Union of all possible kinds of elements.
   */
  export type Element = DataElement | Sequence | EncapsulatedPixelDataElement | FileMetaInformationElement;

  export interface DataSet {
    /**
     * The buffer view of the entire file
     */
    byteArray: ByteArray;
    /**
     * The parser to use for reading the dataset's elements, this parser is automatically selected 
     * to match the requirements of the transfer syntax.
     */
    byteArrayParser : ByteArrayParser;
    /**
     * The record of the elements making up the dataset, accessible via the element's tag in the format xGGGGEEEE.
     * @see {@link Tag} for details on the encoding.
     */
    elements: {
      [tag: Tag]: Element;
    };
    warnings: string[];

    /**
     * Finds the element for tag and returns an unsigned int 16 if it exists and has data. Use this function for VR type US.
     */
    uint16: (tag: Tag, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a signed int 16 if it exists and has data. Use this function for VR type SS.
     */
    int16: (tag: Tag, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns an unsigned int 32 if it exists and has data. Use this function for VR type UL.
     */
    uint32: (tag: Tag, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a signed int 32 if it exists and has data. Use this function for VR type SL.
     */
    int32: (tag: Tag, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a 32 bit floating point number if it exists and has data. Use this function for VR type FL.
     */
    float: (tag: Tag, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a 64 bit floating point number if it exists and has data. Use this function for VR type FD.
     */
    double: (tag: Tag, index?: number) => number | undefined;

    /**
     * Returns the actual Value Multiplicity of an element - the number of values in a multi-valued element.
     */
    numStringValues: (tag: Tag) => number | undefined;

    /**
     * Finds the element for tag and returns a string if it exists and has data. Use this function for VR types AE, CS, SH, and LO.
     */
    string: (tag: Tag, index?: number) => string | undefined;

    /**
     * Finds the element for tag and returns a string with the leading spaces preserved and trailing spaces removed if it exists and has data. Use this function for VR types UT, ST, and LT.
     */
    text: (tag: Tag, index?: number) => string | undefined;

    /**
     * Finds the element for tag and parses a string to a float if it exists and has data. Use this function for VR type DS.
     */
    floatString: (tag: Tag, index?: number) => number | undefined;

    /**
     * Finds the element for tag and parses a string to an integer if it exists and has data. Use this function for VR type IS.
     */
    intString: (tag: Tag, index?: number) => number | undefined;

    /**
     * Finds the element for tag and parses an element tag according to the 'AT' VR definition if it exists and has data. Use this function for VR type AT.
     */
    attributeTag: (tag: Tag) => string | undefined;
  }
  export type ByteArray = Uint8Array | Buffer;

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
    untilTag?: Tag;
    vrCallback?: (tag: Tag) => void;
    inflater?: (arr: Uint8Array, position: number) => void;
  }

  export function parseDicom(arr: Uint8Array, option?: ParseDicomOptions): DataSet

  export function isStringVr(vr: string): vr is VR
  export function isPrivateTag(tag: Tag): boolean
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
  export function parseDicomDataSetExplicit(dataSet: DataSet, byteStream: ByteStream, maxPosition?: number, options?: { untilTag: Tag }): void
  type vrCallback = (tag: Tag) => VR;
  export function parseDicomDataSetImplicit(dataSet: DataSet, byteStream: ByteStream, maxPosition?: number, options?: { untilTag: Tag, vrCallback?: vrCallback }): void
  export function readFixedString(byteArray: ByteArray, position: number, length: number): string
  export function alloc(byteArray: ByteArray, length: number): ByteArray
  export const version: string;
  export const bigEndianByteArrayParser: ByteArrayParser;
  export function sharedCopy(byteArray: ByteArray, byteOffset: number, length: number): ByteArray
  export function findAndSetUNElementLength(byteStream: ByteStream, element: Element): void
  export function findEndOfEncapsulatedElement(byteStream: ByteStream, element: Element, warnings?: string[]): void
  export function findItemDelimitationItemAndSetElementLength(byteStream: ByteStream, element: Element): void
  export const littleEndianByteArrayParser: ByteArrayParser;
  export function readDicomElementExplicit(byteStream: ByteStream, warnings?: string[], untilTag?: Tag): Element
  export function readDicomElementImplicit(byteStream: ByteStream, untilTag?: Tag, vrCallback?: vrCallback): Element
  export function readEncapsulatedImageFrame(dataSet: DataSet, pixelDataElement: Element, frameIndex: number, basicOffsetTable?: number[], fragments?: Fragment[]): ByteArray
  export function readEncapsulatedPixelData(dataSet: DataSet, pixelDataElement: Element, frame: number): ByteArray
  export function readEncapsulatedPixelDataFromFragments(dataSet: DataSet, pixelDataElement: Element, startFragmentIndex: number, numFragments?: number, fragments?: Fragment[]): ByteArray
  export function readPart10Header(byteArray: ByteArray, options?: { untilTag: Tag }): DataSet
  export function readSequenceItemsExplicit(byteStream: ByteStream, element: Element, warnings?: string[]): void
  export function readSequenceItemsImplicit(byteStream: ByteStream, element: Element, vrCallback?: vrCallback): void
  export function readSequenceItem(byteStream: ByteStream): SequenceItem
  export function readTag(byteStream: ByteStream): Tag
 
}
