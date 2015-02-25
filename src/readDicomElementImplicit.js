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

    dicomParser.readDicomElementImplicit = function(byteStream, untilTag)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readDicomElementImplicit: missing required parameter 'byteStream'";
        }

        var element = {
            tag : dicomParser.readTag(byteStream),
            length: byteStream.readUint32(),
            dataOffset :  byteStream.position
        };

        if(element.length === 4294967295)
        {
            element.hadUndefinedLength = true;
        }

        if(element.tag === untilTag) {
            return element;
        }

        // peek ahead at the next tag to see if it looks like a sequence.  This is not 100%
        // safe because a non sequence item could have data that has these bytes, but this
        // is how to do it without a data dictionary.
        if ((byteStream.position + 4) <= byteStream.byteArray.length) {
            var nextTag = dicomParser.readTag(byteStream);
            byteStream.seek(-4);

            if (nextTag === 'xfffee000') {
                // parse the sequence
                dicomParser.readSequenceItemsImplicit(byteStream, element);
                //element.length = byteStream.byteArray.length - element.dataOffset;
                return element;
            }
        }

        // if element is not a sequence and has undefined length, we have to
        // scan the data for a magic number to figure out when it ends.
        if(element.length === 4294967295)
        {
            dicomParser.findItemDelimitationItemAndSetElementLength(byteStream, element);
            return element;
        }

        // non sequence element with known length, skip over the data part
        byteStream.seek(element.length);
        return element;
    };


    return dicomParser;
}(dicomParser));