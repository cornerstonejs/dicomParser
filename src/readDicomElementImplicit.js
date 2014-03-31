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

    dicomParser.readDicomElementImplicit = function(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var element = {
            tag : dicomParser.readTag(byteStream),
            length: byteStream.readUint32(),
            dataOffset :  byteStream.position
        };

        if(element.length === -1)
        {
            element.hadUndefinedLength = true;
        }

        // skip ahead to next tag to see if this is a SQ element
        var nextTag = dicomParser.readTag(byteStream);
        byteStream.seek(-4);

        if(nextTag === 'xfffee000')
        {
            // parse the sequence
            dicomParser.readSequenceItemsImplicit(byteStream, element);
            element.length = byteStream.byteArray.length - element.dataOffset;
            return element;
        }
        else
        {
            if(element.length === -1)
            {
                // read the next tag to determine if this is a sequence or not
                if(nextTag === 'xfffee000')
                {
                    // parse the sequence
                    dicomParser.readSequenceItemsImplicit(byteStream, element);
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
                        var tag = dicomParser.readTag(byteStream);
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
                byteStream.seek(element.length);
            }
        }



        return element;
    };


    return dicomParser;
}(dicomParser));