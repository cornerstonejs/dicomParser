/**
 * Internal helper functions for for parsing DICOM elements
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
    dicomParser.findItemDelimitationItemAndSetElementLength = function(byteStream, element)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readDicomElementImplicit: missing required parameter 'byteStream'";
        }

        var itemDelimitationItemLength = 8; // group, element, length
        var maxPosition = byteStream.byteArray.length - itemDelimitationItemLength;
        while(byteStream.position <= maxPosition)
        {
            var groupNumber = byteStream.readUint16();
            var elementNumber = byteStream.readUint16();
            if(groupNumber === 0xfffe && elementNumber === 0xe00d)
            {
                // NOTE: It would be better to also check for the length to be 0 as part of the check above
                // but we will just log a warning for now
                var itemDelimiterLength = byteStream.readUint32(); // the length
                if(itemDelimiterLength !== 0) {
                    byteStream.warnings('encountered non zero length following item delimeter at position' + byteStream.position - 4 + " while reading element of undefined length with tag ' + element.tag");
                }
                element.length = byteStream.position - element.dataOffset;
                return;
            }
        }
        // eof encountered - log a warning and return what we have for the element
        // NOTE: This seems to show up quite a bit so may actually be expected - need to confirm with standard
        byteStream.warnings.push('eof encountered before finding item delimitation item while reading element of undefined length with tag ' + element.tag);
        element.length = byteStream.byteArray.length - element.dataOffset;
    };


    return dicomParser;
}(dicomParser));