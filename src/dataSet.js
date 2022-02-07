import { readFixedString } from './byteArrayParser.js';

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

function getByteArrayParser (element, defaultParser) {
  return (element.parser !== undefined ? element.parser : defaultParser);
}

/**
 * Constructs a new DataSet given byteArray and collection of elements
 * @param byteArrayParser
 * @param byteArray
 * @param elements
 * @constructor
 */
export default class DataSet {
  constructor (byteArrayParser, byteArray, elements) {
    this.byteArrayParser = byteArrayParser;
    this.byteArray = byteArray;
    this.elements = elements;
  }

  /**
     * Finds the element for tag and returns an unsigned int 16 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} unsigned int 16 or undefined if the attribute is not present or has data of length 0
     */
  uint16 (tag, index) {
    var element = this.elements[tag];

    index = (index !== undefined) ? index : 0;
    if (element && element.length !== 0) {
      return getByteArrayParser(element, this.byteArrayParser).readUint16(this.byteArray, element.dataOffset + (index * 2));
    }

    return undefined;
  }

  /**
     * Finds the element for tag and returns an signed int 16 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} signed int 16 or undefined if the attribute is not present or has data of length 0
     */
  int16 (tag, index) {
    var element = this.elements[tag];

    index = (index !== undefined) ? index : 0;
    if (element && element.length !== 0) {
      return getByteArrayParser(element, this.byteArrayParser).readInt16(this.byteArray, element.dataOffset + (index * 2));
    }

    return undefined;
  }

  /**
     * Finds the element for tag and returns an unsigned int 32 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} unsigned int 32 or undefined if the attribute is not present or has data of length 0
     */
  uint32 (tag, index) {
    var element = this.elements[tag];

    index = (index !== undefined) ? index : 0;
    if (element && element.length !== 0) {
      return getByteArrayParser(element, this.byteArrayParser).readUint32(this.byteArray, element.dataOffset + (index * 4));
    }

    return undefined;
  }

  /**
     * Finds the element for tag and returns an signed int 32 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} signed int 32 or undefined if the attribute is not present or has data of length 0
     */
  int32 (tag, index) {
    var element = this.elements[tag];

    index = (index !== undefined) ? index : 0;
    if (element && element.length !== 0) {
      return getByteArrayParser(element, this.byteArrayParser).readInt32(this.byteArray, element.dataOffset + (index * 4));
    }

    return undefined;
  }

  /**
     * Finds the element for tag and returns a 32 bit floating point number (VR=FL) if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} float or undefined if the attribute is not present or has data of length 0
     */
  float (tag, index) {
    var element = this.elements[tag];

    index = (index !== undefined) ? index : 0;
    if (element && element.length !== 0) {
      return getByteArrayParser(element, this.byteArrayParser).readFloat(this.byteArray, element.dataOffset + (index * 4));
    }

    return undefined;
  }

  /**
     * Finds the element for tag and returns a 64 bit floating point number (VR=FD) if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the value in a multivalued element.  Default is index 0 if not supplied
     * @returns {*} float or undefined if the attribute is not present or doesn't has data of length 0
     */
  double (tag, index) {
    var element = this.elements[tag];

    index = (index !== undefined) ? index : 0;
    if (element && element.length !== 0) {
      return getByteArrayParser(element, this.byteArrayParser).readDouble(this.byteArray, element.dataOffset + (index * 8));
    }

    return undefined;
  }

  /**
     * Returns the number of string values for the element
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} the number of string values or undefined if the attribute is not present or has zero length data
     */
  numStringValues (tag) {
    var element = this.elements[tag];

    if (element && element.length > 0) {
      var fixedString = readFixedString(this.byteArray, element.dataOffset, element.length);
      var numMatching = fixedString.match(/\\/g);

      if (numMatching === null) {
        return 1;
      }

      return numMatching.length + 1;
    }

    return undefined;
  }

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
  string (tag, index) {
    var element = this.elements[tag];

    if( element && element.Value ) return element.Value;
    
    if (element && element.length > 0) {
      var fixedString = readFixedString(this.byteArray, element.dataOffset, element.length);

      if (index >= 0) {
        var values = fixedString.split('\\');
        // trim trailing spaces

        return values[index].trim();
      }
      // trim trailing spaces
      return fixedString.trim();
    }

    return undefined;
  }

  /**
     * Returns a string with the leading spaces preserved and trailing spaces removed.
     *
     * Use this function to access data for VRs of type UT, ST and LT
     *
     * @param tag
     * @param index
     * @returns {*}
     */
  text (tag, index) {
    var element = this.elements[tag];

    if (element && element.length > 0) {
      var fixedString = readFixedString(this.byteArray, element.dataOffset, element.length);

      if (index >= 0) {
        var values = fixedString.split('\\');


        return values[index].replace(/ +$/, '');
      }

      return fixedString.replace(/ +$/, '');
    }

    return undefined;
  }

  /**
     * Parses a string to a float for the specified index in a multi-valued element.  If index is not specified,
     * the first value in a multi-valued VR will be parsed if present.
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the desired value in a multi valued string or undefined for the first value
     * @returns {*} a floating point number or undefined if not present or data not long enough
     */
  floatString (tag, index) {
    var element = this.elements[tag];

    if (element && element.length > 0) {
      index = (index !== undefined) ? index : 0;
      var value = this.string(tag, index);

      if (value !== undefined) {
        return parseFloat(value);
      }
    }

    return undefined;
  }

  /**
     * Parses a string to an integer for the specified index in a multi-valued element.  If index is not specified,
     * the first value in a multi-valued VR will be parsed if present.
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the desired value in a multi valued string or undefined for the first value
     * @returns {*} an integer or undefined if not present or data not long enough
     */
  intString (tag, index) {
    var element = this.elements[tag];

    if (element && element.length > 0) {
      index = (index !== undefined) ? index : 0;
      var value = this.string(tag, index);

      if (value !== undefined) {
        return parseInt(value);
      }
    }

    return undefined;
  }

  /**
     * Parses an element tag according to the 'AT' VR definition (VR=AT).
     * @param {String} A DICOM tag with in the format xGGGGEEEE.
     * @returns {String} A string representation of a data element tag or undefined if the field is not present or data is not long enough.
     */
  attributeTag (tag) {
    const element = this.elements[tag];

    if (element && element.length === 4) {
      const parser = getByteArrayParser(element, this.byteArrayParser).readUint16;
      const bytes = this.byteArray;
      const offset = element.dataOffset;

      return `x${(`00000000${(parser(bytes, offset) * 256 * 256 + parser(bytes, offset + 2)).toString(16)}`).substr(-8)}`;
    }

    return undefined;
  }
}
