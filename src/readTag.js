/**
 * Internal helper functions for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    /**
     * Reads a tag (group number and element number) from a byteStream
     * @param byteStream the byte stream to read from
     * @returns {string} the tag in format xggggeeee where gggg is the lowercase hex value of the group number
     * and eeee is the lower case hex value of the element number
     */
    dicomParser.readTag = function(byteStream)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readTag: missing required parameter 'byteStream'";
        }

        var groupNumber =  byteStream.readUint16() * 256 * 256;
        var elementNumber = byteStream.readUint16();
        var tag = "x" + ('00000000' + (groupNumber + elementNumber).toString(16)).substr(-8);
        return tag;
    };

    return dicomParser;
}(dicomParser));