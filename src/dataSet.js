/**
 *
 * The DataSet class encapsulates a collection of DICOM Elements and provides various functions
 * to access the data in those elements
 *
 */
var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    /**
     * Constructs a new DataSet given byteArray and collection of elements
     * @param byteArray
     * @param elements
     * @constructor
     */
    dicomParser.DataSet = function(byteArray, elements)
    {
        this.byteArray = byteArray;
        this.elements = elements;
    };

    /**
     * Finds the element for tag and returns an unsigned int 16 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} unsigned int 16 or undefined if the attribute is not present or doesn't have data of length 2
     */
    dicomParser.DataSet.prototype.uint16 = function(tag)
    {
        var element = this.elements[tag];
        if(element && element.length === 2)
        {
            return dicomParser.readUint16(this.byteArray, element.dataOffset);
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns an signed int 16 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} signed int 16 or undefined if the attribute is not present or doesn't have data of length 2
     */
    dicomParser.DataSet.prototype.int16 = function(tag)
    {
        var element = this.elements[tag];
        if(element && element.length === 2)
        {
            return dicomParser.readInt16(this.byteArray, element.dataOffset);
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns an unsigned int 32 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} unsigned int 32 or undefined if the attribute is not present or doesn't have data of length 4
     */
    dicomParser.DataSet.prototype.uint32 = function(tag)
    {
        var element = this.elements[tag];
        if(element && element.length === 4)
        {
            return dicomParser.readUint32(this.byteArray, element.dataOffset);
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns an signed int 32 if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} signed int 32 or undefined if the attribute is not present or doesn't have data of length 4
     */
    dicomParser.DataSet.prototype.int32 = function(tag)
    {
        var element = this.elements[tag];
        if(element && element.length === 4)
        {
            return dicomParser.readInt32(this.byteArray, element.dataOffset);
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns a 32 bit floating point number (VR=FL) if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} float or undefined if the attribute is not present or doesn't have data of length 4
     */
    dicomParser.DataSet.prototype.float = function(tag)
    {
        var element = this.elements[tag];
        if(element && element.length === 4)
        {
            return dicomParser.readFloat(this.byteArray, element.dataOffset);
        }
        return undefined;
    };

    /**
     * Finds the element for tag and returns a 64 bit floating point number (VR=FD) if it exists and has data
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} float or undefined if the attribute is not present or doesn't have data of length 4
     */
    dicomParser.DataSet.prototype.double = function(tag)
    {
        var element = this.elements[tag];
        if(element && element.length === 8)
        {
            return dicomParser.readDouble(this.byteArray, element.dataOffset);
        }
        return undefined;
    };

    /**
     * Returns the number of string values for the element
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @returns {*} the number of string values or undefined if the attribute is not present or has zero length data
     */
    dicomParser.DataSet.prototype.numStringValues = function(tag)
    {
        var element = this.elements[tag];
        if(element && element.length > 0)
        {
            var fixedString = dicomParser.readFixedString(this.byteArray, element.dataOffset, element.length);
            var numMatching = fixedString.match(/\\/g);
            if(numMatching === null)
            {
                return 1;
            }
            return numMatching.length + 1;
        }
        return undefined;
    };

    /**
     * Returns the full string for the element index is not specified or if specified,
     * the value at the specified index for a multi-valued string
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the desired value in a multi valued string or undefined for the entire string
     * @returns {*}
     */
    dicomParser.DataSet.prototype.string = function(tag, index)
    {
        var element = this.elements[tag];
        if(element && element.length > 0)
        {
            var fixedString = dicomParser.readFixedString(this.byteArray, element.dataOffset, element.length);
            if(index >= 0)
            {
                var values = fixedString.split('\\');
                return values[index];
            }
            else
            {
                return fixedString;
            }
        }
        return undefined;
    };

    /**
     * Parses a string to a float for the specified index in a multi-valued element.  If index is not specified,
     * the first value in a multi-valued VR will be parsed if present.
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the desired value in a multi valued string or undefined for the first value
     * @returns {*} a floating point number or undefined if not present or data not long enough
     */
    dicomParser.DataSet.prototype.floatString = function(tag, index)
    {
        var element = this.elements[tag];
        if(element && element.length > 0)
        {
            index |= 0;
            var value = this.string(tag, index);
            if(value) {
                return parseFloat(value);
            }
        }
        return undefined;
    };

    /**
     * Parses a string to an integer for the specified index in a multi-valued element.  If index is not specified,
     * the first value in a multi-valued VR will be parsed if present.
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index the index of the desired value in a multi valued string or undefined for the first value
     * @returns {*} an integer or undefined if not present or data not long enough
     */
    dicomParser.DataSet.prototype.intString = function(tag, index)
    {
        var element = this.elements[tag];
        if(element && element.length > 0) {
            index |= 0;
            var value = this.string(tag, index);
            return parseInt(value);
        }
        return undefined;
    };

    /**
     * Parses a DA formatted string into a Javascript Date object
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index
     * @returns {*} Javascript Date object or undefined if not present or not 8 bytes long
     */
    dicomParser.DataSet.prototype.date = function(tag, index)
    {
        var value = this.string(tag, index);
        if(value && value.length === 8)
        {
            var yyyy = parseInt(value.substring(0, 4), 10);
            var mm = parseInt(value.substring(4, 6), 10);
            var dd = parseInt(value.substring(6, 8), 10);

            return new Date(yyyy, mm - 1, dd);
        }
        return undefined;
    };

    /**
     * Parses a TM formatted string into a javascript object with properties for hours, minutes, seconds and fractionalSeconds
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index
     * @returns {*} javascript object with properties for hours, minutes, seconds and fractionalSeconds or undefined if no element or data
     */
    dicomParser.DataSet.prototype.time = function(tag, index)
    {
        var value = this.string(tag, index);
        if(value && value.length >=  2) // must at least have HH
        {
            // 0123456789
            // HHMMSS.FFFFFF
            var hh = parseInt(value.substring(0, 2), 10);
            var mm = value.length >= 4 ? parseInt(value.substring(2, 4), 10) : 0;
            var ss = value.length >= 6 ? parseInt(value.substring(4, 6), 10) : 0;
            var ffffff = value.length >= 8 ? parseInt(value.substring(7, 13), 10) : 0;

            return {
                hours: hh,
                minutes: mm,
                seconds: ss,
                fractionalSeconds: ffffff
            };
        }
        return undefined;
    };

    /**
     * Parses a PN formatted string into a javascript object with properties for givenName, familyName, middleName, prefix and suffix
     * @param tag The DICOM tag in the format xGGGGEEEE
     * @param index
     * @returns {*} javascript object with properties for givenName, familyName, middleName, prefix and suffix or undefined if no element or data
     */
    dicomParser.DataSet.prototype.personName = function(tag, index)
    {
        var stringValue = this.string(tag, index);
        if(stringValue)
        {
            var stringValues = stringValue.split('^');
            return {
                familyName: stringValues[0],
                givenName: stringValues[1],
                middleName: stringValues[2],
                prefix: stringValues[3],
                suffix: stringValues[4]
            };
        }
        return undefined;
    };

    //dicomParser.DataSet = DataSet;

    return dicomParser;
}(dicomParser));