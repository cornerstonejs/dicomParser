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

    dicomParser.readDicomElementExplicit = function(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var element = {
            tag : dicomParser.readTag(byteStream),
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

        if(element.length === -1)
        {
            element.hadUndefinedLength = true;
        }

        // if VR is SQ, parse the sequence items
        if(element.vr === 'SQ')
        {
            dicomParser.readSequenceItemsExplicit(byteStream, element);
        }
        else
        {
            if(element.length === -1){
                // not a sequence, scan until we find delimeter
                // TODO: Handle undefined length for OB,OW and UN
                // TODO: handle undefined length item.
                element.tags =[];
                var maxPosition = byteStream.byteArray.length - 4;
                // right now we hack around this by scanning until we find the sequence delimiter token
                while(byteStream.position <= maxPosition)
                {
                    var tag = dicomParser.readTag(byteStream);
                    element.tags.push(tag);
                    if(tag === 'xfffee0dd' || tag === 'xfffee00d')
                    {
                        byteStream.readUint32(); // the length (should be 0)
                        element.length = byteStream.position - element.dataOffset;
                        return element;
                    }
                }
                // eof??
                element.length = byteStream.byteArray.length - element.dataOffset;
                return element;
            }
            byteStream.seek(element.length);
        }


        return element;
    };

    return dicomParser;
}(dicomParser));