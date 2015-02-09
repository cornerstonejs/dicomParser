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
     * reads from the byte stream until it finds the magic numbers for the item delimitation item
     * and then sets the length of the element
     * @param byteStream
     * @param element
     */
    dicomParser.findEndOfEncapsulatedElement = function(byteStream, element)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.findEndOfEncapsulatedElement: missing required parameter 'byteStream'";
        }

        element.fragmentOffsets = [];
        var basicOffsetTableItemTag = dicomParser.readTag(byteStream);
        if(basicOffsetTableItemTag !== 'xfffee000') {
            throw "dicomParser.findEndOfEncapsulatedElement: no basic offset table found";
        }
        var basicOffsetTableItemlength = byteStream.readUint32();
        var items = basicOffsetTableItemlength / 4;
        for(var i =0; i < items; i++) {
            var offset = byteStream.readUint32();
            element.fragmentOffsets.push(offset);
        }

        while(byteStream.position < byteStream.byteArray.length)
        {
            var tag = dicomParser.readTag(byteStream);
            var length = byteStream.readUint32();
            byteStream.seek(length);
            if(tag === 'xfffee0dd')
            {
                element.length = byteStream.byteArray.length - element.dataOffset;
                byteStream.seek(byteStream.byteArray.length - byteStream.position);
                return;
            }
        }

        throw "dicomParser.findEndOfEncapsulatedElement: did not find sequence delimiter";
    };


    return dicomParser;
}(dicomParser));