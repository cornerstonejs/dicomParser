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
     * containing the offset and length of each fragment and any offsets from the basic offset
     * table
     * @param byteStream
     * @param element
     */
    dicomParser.findEndOfEncapsulatedElement = function(byteStream, element, warnings)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.findEndOfEncapsulatedElement: missing required parameter 'byteStream'";
        }
        if(element === undefined)
        {
            throw "dicomParser.findEndOfEncapsulatedElement: missing required parameter 'element'";
        }

        element.encapsulatedPixelData = true;
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
            else if(tag === 'xfffee000')
            {
                element.fragments.push({
                    offset: byteStream.position - baseOffset - 8,
                    position : byteStream.position,
                    length : length
                });
            }
            else {
                if(warnings) {
                    warnings.push('unexpected tag ' + tag + ' while searching for end of pixel data element with undefined length');
                }
                if(length > byteStream.byteArray.length - byteStream.position)
                {
                    // fix length
                    length = byteStream.byteArray.length - byteStream.position;
                }
                element.fragments.push({
                    offset: byteStream.position - baseOffset - 8,
                    position : byteStream.position,
                    length : length
                });
                byteStream.seek(length);
                element.length = byteStream.position - element.dataOffset;
                return;
            }

            byteStream.seek(length);
        }

        if(warnings) {
            warnings.push("pixel data element " + element.tag + " missing sequence delimiter tag xfffee0dd");
        }
    };


    return dicomParser;
}(dicomParser));