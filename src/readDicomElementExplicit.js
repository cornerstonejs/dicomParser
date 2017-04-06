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

    function tagIsPhillipsPrivateStackSequence(tag)
    {
        var privateTags = ["x2001105f",
                           "x20019000",
                           "x20051080",
                           "x20051083",
                           "x20051084",
                           "x20051085",
                           "x2005109e",
                           "x20051371",
                           "x20051402",
                           "x2005140e",
                           "x2005140f"];
        return privateTags.indexOf(tag) !== -1;
    }

    dicomParser.readDicomElementExplicit = function(byteStream, warnings, untilTag)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readDicomElementExplicit: missing required parameter 'byteStream'";
        }

        var element = {
            tag : dicomParser.readTag(byteStream),
            vr : byteStream.readFixedString(2)
            // length set below based on VR
            // dataOffset set below based on VR and size of length
        };

        if(element.vr == 'UN')
        {
            if(tagIsPhillipsPrivateStackSequence(element.tag))
            {
                element.vr = "SQ";
            }
        }

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

        if(element.tag === untilTag) {
            return element;
        }

        if(tagIsPhillipsPrivateStackSequence(element.tag))
        {
            dicomParser.readSequenceItemsImplicit(byteStream, element);
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
            }   else if(element.vr === 'UN') {
                dicomParser.findAndSetUNElementLength(byteStream, element);
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