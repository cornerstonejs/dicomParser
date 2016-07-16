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

    dicomParser.readDicomElementExplicit = function(byteStream, warnings, untilTag)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readDicomElementExplicit: missing required parameter 'byteStream'";
        }

        var tag = dicomParser.readTag(byteStream);
        var isUntilTag = false;
        if (typeof untilTag === 'object' && tag === untilTag.tag) {
          if (untilTag.include === false) {
            return false;
          } else {
            isUntilTag = true;
          }
        } else if (typeof untilTag === 'string' && tag === untilTag) {
          isUntilTag = true;
        }

        var element = {
            tag : tag,
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

        if(element.length === 4294967295)
        {
            element.hadUndefinedLength = true;
        }

        if(isUntilTag) {
            return element;
        }

        // if VR is SQ, parse the sequence items
        if(element.vr === 'SQ')
        {
            dicomParser.readSequenceItemsExplicit(byteStream, element, warnings);
            return element;
        }
        if(element.length === 4294967295)
        {
            if(element.tag === 'x7fe00010') {
                dicomParser.findEndOfEncapsulatedElement(byteStream, element, warnings);
                return element;
            } else {
                dicomParser.findItemDelimitationItemAndSetElementLength(byteStream, element);
                return element;
            }
        }

        byteStream.seek(element.length);
        return element;
    };

    return dicomParser;
}(dicomParser));
