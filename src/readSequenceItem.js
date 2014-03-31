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

    dicomParser.readSequenceItem = function(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var element = {
            tag : dicomParser.readTag(byteStream),
            length : byteStream.readUint32(),
            dataOffset :  byteStream.position
        };

        return element;
    };


    return dicomParser;
}(dicomParser));