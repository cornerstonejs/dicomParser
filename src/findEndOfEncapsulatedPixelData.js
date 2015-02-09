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

        element.fragments = [];
        var basicOffsetTableItemTag = dicomParser.readTag(byteStream);
        if(basicOffsetTableItemTag !== 'xfffee000') {
            throw "dicomParser.findEndOfEncapsulatedElement: no basic offset table found";
        }
        var basicOffsetTableItemlength = byteStream.readUint32();
        var items = basicOffsetTableItemlength / 4;
        for(var i =0; i < items; i++) {
            var offset = byteStream.readUint32();
            element.fragments.push({
                offset : offset
            });
        }

        var fragment = 0;

        while(byteStream.position < byteStream.byteArray.length)
        {
            var tag = dicomParser.readTag(byteStream);
            var length = byteStream.readUint32();
            byteStream.seek(length);
            if(tag === 'xfffee0dd')
            {
                element.length = byteStream.position - element.dataOffset;
                return;
            }
            element.fragments[fragment++].length = length;
        }

        throw "dicomParser.findEndOfEncapsulatedElement: did not find sequence delimiter";
    };


    return dicomParser;
}(dicomParser));