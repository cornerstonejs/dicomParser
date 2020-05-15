export type ByteArray = Uint8Array | Buffer;

export interface IByteArrayParser {
  /**
   *
   * Parses an unsigned int 16 from a  byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed unsigned int 16
   * @throws error if buffer overread would occur
   * @access private
   */
  readUint16(byteArray: ByteArray, position: number): number;
  /**
   *
   * Parses a signed int 16 from a  byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed signed int 16
   * @throws error if buffer overread would occur
   * @access private
   */
  readInt16(byteArray: ByteArray, position: number): number;
  /**
   * Parses an unsigned int 32 from a  byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed unsigned int 32
   * @throws error if buffer overread would occur
   * @access private
   */
  readUint32(byteArray: ByteArray, position: number): number;
  /**
   * Parses a signed int 32 from a  byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed signed int 32
   * @throws error if buffer overread would occur
   * @access private
   */
  readInt32(byteArray: ByteArray, position: number): number;
  /**
   * Parses 32-bit float from a  byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed 32-bit float
   * @throws error if buffer overread would occur
   * @access private
   */
  readFloat(byteArray: ByteArray, position: number): number;
  /**
   * Parses 64-bit float from a  byte array
   *
   * @param byteArray the byte array to read from
   * @param position the position in the byte array to read from
   * @returns {*} the parsed 64-bit float
   * @throws error if buffer overread would occur
   * @access private
   */
  readDouble(byteArray: ByteArray, position: number): number;
}

export interface IByteStream {
  /**
   * a parser for parsing the byte array
   */
  byteArrayParser: IByteArrayParser;
  /**
   * a ByteArray containing the byte stream
   */
  byteArray: ByteArray;
  /**
   * the position of the reader.
   */
  position: number;
  /**
   * Array of string warnings encountered while parsing
   */
  warnings: any[];

  /**
   * Safely seeks through the byte stream.  Will throw an exception if an attempt
   * is made to seek outside of the byte array.
   * @param offset the number of bytes to add to the position
   * @throws error if seek would cause position to be outside of the byteArray
   */
  seek(offset: number): void;
  /**
   * Returns a new ByteStream object from the current position and of the requested number of bytes
   * @param numBytes the length of the byte array for the ByteStream to contain
   * @returns {dicomParser.ByteStream}
   * @throws error if buffer overread would occur
   */
  readByteStream(numBytes: number): IByteStream;
  /**
   *
   * Parses an unsigned int 16 from a byte array and advances
   * the position by 2 bytes
   *
   * @returns {*} the parsed unsigned int 16
   * @throws error if buffer overread would occur
   */
  readUint16(): number;
  /**
   * Parses an unsigned int 32 from a byte array and advances
   * the position by 2 bytes
   *
   * @returns {*} the parse unsigned int 32
   * @throws error if buffer overread would occur
   */
  readUint32(): number;
  /**
   * Reads a string of 8-bit characters from an array of bytes and advances
   * the position by length bytes.  A null terminator will end the string
   * but will not effect advancement of the position.
   * @param length the maximum number of bytes to parse
   * @returns {string} the parsed string
   * @throws error if buffer overread would occur
   */
  readFixedString(length: number): string;
}

export interface IFragment {
  offset: number;
  position: number;
  length: number;
}

export interface IDataSetElement {
  tag: string;
  vr: string;
  length: number;
  dataOffset: number;
  hadUndefinedLength: boolean;
  encapsulatedPixelData: boolean;
  basicOffsetTable: any[];
  fragments: IFragment[];
  parser?: IByteArrayParser;
  items?: any;
}

export interface ParseDicomOptions {
  untilTag?: string;
  vrCallback?: (tag: string) => void;
  inflater?: (arr: ByteArray, position: number) => ByteArray;
}
export interface DataSetToJSOptions {
  /**
   * true if private elements should be omitted defaults to true
   */
  //
  omitPrivateAttibutes: boolean;
  /**
   * maximum element length to try and convert to string format defaults to 128
   */
  maxElementLength: number;
}

export interface IDataSet {
  byteArray: ByteArray;
  byteArrayParser: IByteArrayParser;
  elements: {
    [key: string]: IDataSetElement;
  };

  /**
   * the position of the reader.
   */
  position: number;
  /**
   * Array of string warnings encountered while parsing
   */
  warnings: any[];

  /**
   * Finds the element for tag and returns an unsigned int 16 if it exists and has data
   * @param tag The DICOM tag in the format xGGGGEEEE
   * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
   * @returns {*} unsigned int 16 or undefined if the attribute is not present or has data of length 0
   */
  uint16(tag: string, index?: number): number | undefined;

  /**
   * Finds the element for tag and returns an signed int 16 if it exists and has data
   * @param tag The DICOM tag in the format xGGGGEEEE
   * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
   * @returns {*} signed int 16 or undefined if the attribute is not present or has data of length 0
   */
  int16(tag: string, index?: number): number | undefined;

  /**
   * Finds the element for tag and returns an unsigned int 32 if it exists and has data
   * @param tag The DICOM tag in the format xGGGGEEEE
   * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
   * @returns {*} unsigned int 32 or undefined if the attribute is not present or has data of length 0
   */
  uint32(tag: string, index?: number): number | undefined;

  /**
   * Finds the element for tag and returns an signed int 32 if it exists and has data
   * @param tag The DICOM tag in the format xGGGGEEEE
   * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
   * @returns {*} signed int 32 or undefined if the attribute is not present or has data of length 0
   */
  int32(tag: string, index?: number): number | undefined;

  /**
   * Finds the element for tag and returns a 32 bit floating point number (VR=FL) if it exists and has data
   * @param tag The DICOM tag in the format xGGGGEEEE
   * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
   * @returns {*} float or undefined if the attribute is not present or has data of length 0
   */
  float(tag: string, index?: number): number | undefined;

  /**
   * Finds the element for tag and returns a 64 bit floating point number (VR=FD) if it exists and has data
   * @param tag The DICOM tag in the format xGGGGEEEE
   * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
   * @returns {*} float or undefined if the attribute is not present or doesn't has data of length 0
   */
  double(tag: string, index?: number): number | undefined;

  /**
   * Returns the number of string values for the element
   * @param tag The DICOM tag in the format xGGGGEEEE
   * @returns {*} the number of string values or undefined if the attribute is not present or has zero length data
   */
  numStringValues(tag: string): number;

  /**
   * Returns a string for the element.  If index is provided, the element is assumed to be
   * multi-valued and will return the component specified by index.  Undefined is returned
   * if there is no component with the specified index, the element does not exist or is zero length.
   *
   * Use this function for VR types of AE, CS, SH and LO
   *
   * @param tag The DICOM tag in the format xGGGGEEEE
   * @param index the index of the desired value in a multi valued string or undefined for the entire string
   * @returns {*}
   */
  string(tag: string, index?: number): string | undefined;

  /**
   * Returns a string with the leading spaces preserved and trailing spaces removed.
   *
   * Use this function to access data for VRs of type UT, ST and LT
   *
   * @param tag
   * @param index
   * @returns {*}
   */
  text(tag: string, index?: number): string;

  /**
   * Parses a string to a float for the specified index in a multi-valued element.  If index is not specified,
   * the first value in a multi-valued VR will be parsed if present.
   * @param tag The DICOM tag in the format xGGGGEEEE
   * @param index the index of the desired value in a multi valued string or undefined for the first value
   * @returns {*} a floating point number or undefined if not present or data not long enough
   */
  floatString(tag: string, index?: number): number | undefined;

  /**
   * Parses a string to an integer for the specified index in a multi-valued element.  If index is not specified,
   * the first value in a multi-valued VR will be parsed if present.
   * @param tag The DICOM tag in the format xGGGGEEEE
   * @param index the index of the desired value in a multi valued string or undefined for the first value
   * @returns {*} an integer or undefined if not present or data not long enough
   */
  intString(tag: string, index?: number): number | undefined;

  /**
   * Parses an element tag according to the 'AT' VR definition (VR=AT).
   * @param {String} A DICOM tag with in the format xGGGGEEEE.
   * @returns {String} A string representation of a data element tag or undefined if the field is not present or data is not long enough.
   */
  attributeTag(tag: string): string | undefined;
}
