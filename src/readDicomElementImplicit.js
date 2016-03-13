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

    function isSequence(element, byteStream, vrCallback) {
        // if a data dictionary callback was provided, use that to verify that the element is a sequence.
        if (typeof vrCallback !== 'undefined') {
            return (vrCallback(element.tag) === 'SQ');
        }
        if ((byteStream.position + 4) <= byteStream.byteArray.length) {
            var nextTag = dicomParser.readTag(byteStream);
            byteStream.seek(-4);
            // Item start tag (fffe,e000) or sequence delimiter (i.e. end of sequence) tag (0fffe,e0dd)
            // These are the tags that could potentially be found directly after a sequence start tag (the delimiter
            // is found in the case of an empty sequence). This is not 100% safe because a non-sequence item
            // could have data that has these bytes, but this is how to do it without a data dictionary.
            return (nextTag === 'xfffee000') || (nextTag === 'xfffee0dd');
        }
        byteStream.warnings.push('eof encountered before finding sequence item tag or sequence delimiter tag in peeking to determine VR');
        return false;
    }

    dicomParser.readDicomElementImplicit = function(byteStream, untilTag, vrCallback)
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

        if(element.length === 4294967295) {
            element.hadUndefinedLength = true;
        }

        if(element.tag === untilTag) {
            return element;
        }

        if (isSequence(element, byteStream, vrCallback)) {
            // parse the sequence
            dicomParser.readSequenceItemsImplicit(byteStream, element);
            return element;
        }

        // if element is not a sequence and has undefined length, we have to
        // scan the data for a magic number to figure out when it ends.
        if(element.hadUndefinedLength)
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