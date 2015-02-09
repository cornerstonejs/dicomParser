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
     * Reads an encapsulated pixel data element and adds an array of fragments to the element
     * contain the offset and length.
     * @param byteStream
     * @param element
     */
    dicomParser.findEndOfEncapsulatedElement = function(byteStream, element)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.findEndOfEncapsulatedElement: missing required parameter 'byteStream'";
        }
        if(element === undefined)
        {
            throw "dicomParser.findEndOfEncapsulatedElement: missing required parameter 'element'";
        }

        element.basicOffsetTable = [];
        element.fragments = [];
        var basicOffsetTableItemTag = dicomParser.readTag(byteStream);
        if(basicOffsetTableItemTag !== 'xfffee000') {
            throw "dicomParser.findEndOfEncapsulatedElement: basic offset table not found";
        }
        var basicOffsetTableItemlength = byteStream.readUint32();
        var numFragments = basicOffsetTableItemlength / 4;
        for(var i =0; i < numFragments; i++) {
            var offset = byteStream.readUint32();
            element.basicOffsetTable.push(offset);
        }
        var baseOffset = byteStream.position;

        while(byteStream.position < byteStream.byteArray.length)
        {
            var tag = dicomParser.readTag(byteStream);
            var length = byteStream.readUint32();
            if(tag === 'xfffee0dd')
            {
                byteStream.seek(length);
                element.length = byteStream.position - element.dataOffset;
                return;
            }
            element.fragments.push({
                offset: byteStream.position - baseOffset - 8,
                position : byteStream.position,
                length : length
            });
            byteStream.seek(length);
        }

        throw "dicomParser.findEndOfEncapsulatedElement: did not find sequence delimiter";
    };


    return dicomParser;
}(dicomParser));