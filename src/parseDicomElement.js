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
            parsedLength : byteStream.readUint32(),
            dataOffset :  byteStream.position
        };
        element.length = element.parsedLength;
        if(element.parsedLength === -1)
        {
            // read the next tag to determine if this is a sequence or not
            var nextTag = readTag(byteStream);
            byteStream.seek(-4);
            if(nextTag === 'xfffee000')
            {
                // parse the sequence
                dicomParser.parseSequenceItemsImplicit(byteStream, element);
                element.length = byteStream.byteArray.length - element.dataOffset;
                return element;
            }
            else
            {
                // not a sequence, scan until we find delimeter
                element.tags =[];
                // TODO: handle undefined length item.
                var maxPosition = byteStream.byteArray.length - 4;
                // right now we hack around this by scanning until we find the sequence delimiter token
                while(byteStream.position <= maxPosition)
                {
                    var tag = readTag(byteStream);
                    element.tags.push(tag);
                    if(tag === 'xfffee0dd' || tag === 'xfffee00d')
                    {
                        byteStream.readUint32(); // the length
                        element.length = byteStream.position - element.dataOffset;
                        return element;
                    }
                }
                // eof??
                element.length = byteStream.byteArray.length - element.dataOffset;
                return element;
            }
        }
        else
        {
            element.length = element.parsedLength;
            byteStream.seek(element.parsedLength);
        }

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
            element.parsedLength = byteStream.readUint16();
            element.dataOffset = byteStream.position;
            element.length = element.parsedLength;
        }
        else
        {
            byteStream.seek(2);
            element.parsedLength = byteStream.readUint32();
            element.dataOffset = byteStream.position;
            element.length = element.parsedLength;
        }

        // TODO: Handle undefined lengths

        // if VR is SQ, parse the sequence items
        if(element.vr === 'SQ')
        {
            dicomParser.parseSequenceItemsExplicit(byteStream, element);
        }
        else {

            if(element.length === -1){
                //throw 'element with undefined length detected';
                // not a sequence, scan until we find delimeter
                element.tags =[];
                // TODO: handle undefined length item.
                var maxPosition = byteStream.byteArray.length - 4;
                // right now we hack around this by scanning until we find the sequence delimiter token
                while(byteStream.position <= maxPosition)
                {
                    var tag = readTag(byteStream);
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
            // TODO: Handle undefined length for OB,OW and UN
            byteStream.seek(element.length);
        }


        return element;
    };

    return dicomParser;
}(dicomParser));