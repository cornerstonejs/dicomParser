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

    function getDataLengthSizeInBytesForVR(vr)
    {
        if( vr === 'OB' ||
            vr === 'OW' ||
            vr === 'SQ' ||
            vr === 'OF' ||
            vr === 'UT' ||
            vr === 'UN')
        {
            return 4;
        }
        else
        {
            return 2;
        }
    }

    function readTag(byteStream)
    {
        var groupNumber =  byteStream.readUint16() * 256 * 256;
        var elementNumber = byteStream.readUint16();
        var tag = "x" + ('00000000' + (groupNumber + elementNumber).toString(16)).substr(-8);
        return tag;
    }

    dicomParser.parseDicomElementImplicit = function(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var element = {
            tag : readTag(byteStream),
            length : byteStream.readUint32(),
            dataOffset :  byteStream.position
        };

        byteStream.seek(element.length);
        return element;
    };

    dicomParser.parseDicomElementExplicit = function(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var element = {
            tag : readTag(byteStream),
            vr : byteStream.readFixedString(2)
            // length set below based on VR
            // dataOffset set below based on VR and size of length
        };

        var dataLengthSizeBytes = getDataLengthSizeInBytesForVR(element.vr);
        if(dataLengthSizeBytes === 2)
        {
            element.length = byteStream.readUint16();
            element.dataOffset = byteStream.position;
        }
        else
        {
            byteStream.seek(2);
            element.length = byteStream.readUint32();
            element.dataOffset = byteStream.position;
        }

        // if VR is SQ, parse the sequence items
        if(element.vr === 'SQ')
        {
            dicomParser.parseSequenceItemsExplicit(byteStream, element);
        }
        else {
            // TODO: Handle undefined length for OB,OW and UN
            byteStream.seek(element.length);
        }


        return element;
    };

    return dicomParser;
}(dicomParser));