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

    function readDicomDataSetExplicitUndefinedLength(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var elements = {};

        while(byteStream.position < byteStream.byteArray.length)
        {
            var element = dicomParser.readDicomElementExplicit(byteStream);
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

    function readSequenceItemExplicit(byteStream)
    {
        var item = dicomParser.readSequenceItem(byteStream);

        if(item.length === -1)
        {
            item.hadUndefinedLength = true;
            item.dataSet = readDicomDataSetExplicitUndefinedLength(byteStream);
            item.length = byteStream.position - item.dataOffset;
        }
        else
        {
            item.dataSet = dicomParser.parseDicomDataSetExplicit(byteStream, byteStream.position + item.length);
        }
        return item;
    }

    function readSQElementUndefinedLengthExplicit(byteStream, element)
    {
        element.items = [];
        while(byteStream.position < byteStream.byteArray.length)
        {
            var item = readSequenceItemExplicit(byteStream);
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

    function readSQElementKnownLengthExplicit(byteStream, element)
    {
        element.items = [];
        while(byteStream.position < element.dataOffset + element.length)
        {
            var item = readSequenceItemExplicit(byteStream);
            element.items.push(item);
        }
    }

    dicomParser.readSequenceItemsExplicit = function(byteStream, element)
    {
        if(element.length === -1)
        {
            readSQElementUndefinedLengthExplicit(byteStream, element);
        }
        else
        {
            readSQElementKnownLengthExplicit(byteStream, element);
        }
    };


    return dicomParser;
}(dicomParser));