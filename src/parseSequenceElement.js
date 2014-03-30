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

    function parseDicomDataSetExplicitUndefinedLength(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var elements = {};

        while(byteStream.position < byteStream.byteArray.length)
        {
            var element = dicomParser.parseDicomElementExplicit(byteStream);
            elements[element.tag] = element;

            // we hit an item delimeter tag, return the current offset to mark
            // the end of this sequence item
            if(element.tag === 'xfffee00d')
            {
                return new dicomParser.DataSet(byteStream.byteArray, elements);
            }

        }
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    }

    function readSequenceItem(byteStream)
    {
        var item = dicomParser.parseDicomElementImplicit(byteStream);

        if(item.length === -1)
        {
            byteStream.seek(1);
            item.dataSet = parseDicomDataSetExplicitUndefinedLength(byteStream);
            item.length = byteStream.position - item.dataOffset;
        }
        else
        {
            item.dataSet = dicomParser.parseDicomDataSetExplicit(byteStream, byteStream.position + item.length);
        }
        return item;
    }

    function parseSQElementUndefinedLengthExplicit(byteStream, element)
    {
        element.items = [];
        while(byteStream.position < byteStream.byteArray.length)
        {
            var item = readSequenceItem(byteStream);
            element.items.push(item);

            // If this is the sequence delimitiation item, return the offset of the next element
            if(item.tag === 'xfffee0dd')
            {
                // sequence delimitation item, update attr data length and return
                element.length = byteStream.position - element.dataOffset;
                return;
            }
        }

        // Buffer overread!  Set the length of the element to reflect the end of buffer so
        // the caller has access to what we were able to parse.
        // TODO: Figure out how to communicate parse errors like this to the caller
        element.length = byteStream.position - element.dataOffset;
    }

    function parseSQElementKnownLengthExplicit(data, element, explicit)
    {
        /*
        element.items = [];
        var offset = element.dataOffset;
        while(offset < element.dataOffset + element.length)
        {
            var item = readSequenceItem(data, offset, explicit);
            offset += item.length + 8;
            element.items.push(item);
        }
        */
    }

    dicomParser.parseSequenceItemsExplicit = function(byteStream, element)
    {
        if(element.length === -1)
        {
            parseSQElementUndefinedLengthExplicit(byteStream, element);
        }
        else
        {
            throw 'not implemented';
            //parseSQElementKnownLengthExplicit(byteStream, element);
        }
    };


    return dicomParser;
}(dicomParser));