/**
 * Internal helper functions for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    function readDicomDataSetExplicitUndefinedLength(byteStream, warnings)
    {
        var elements = {};

        while(byteStream.position < byteStream.byteArray.length)
        {
            var element = dicomParser.readDicomElementExplicit(byteStream, warnings);
            elements[element.tag] = element;

            // we hit an item delimiter tag, return the current offset to mark
            // the end of this sequence item
            if(element.tag === 'xfffee00d')
            {
                return new dicomParser.DataSet(byteStream.byteArrayParser, byteStream.byteArray, elements);
            }

        }

        // eof encountered - log a warning and return what we have for the element
        byteStream.warnings.push('eof encountered before finding sequence delimitation item while reading sequence item of undefined length');
        return new dicomParser.DataSet(byteStream.byteArrayParser, byteStream.byteArray, elements);
    }

    function readSequenceItemExplicit(byteStream, warnings)
    {
        var item = dicomParser.readSequenceItem(byteStream);

        if(item.length === 4294967295)
        {
            item.hadUndefinedLength = true;
            item.dataSet = readDicomDataSetExplicitUndefinedLength(byteStream, warnings);
            item.length = byteStream.position - item.dataOffset;
        }
        else
        {
            item.dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteStream.byteArray, {});
            dicomParser.parseDicomDataSetExplicit(item.dataSet, byteStream, byteStream.position + item.length);
        }
        return item;
    }

    function readSQElementUndefinedLengthExplicit(byteStream, element, warnings)
    {
        while(byteStream.position < byteStream.byteArray.length)
        {
            var item = readSequenceItemExplicit(byteStream, warnings);
            element.items.push(item);

            // If this is the sequence delimitation item, return the offset of the next element
            if(item.tag === 'xfffee0dd')
            {
                // sequence delimitation item, update attr data length and return
                element.length = byteStream.position - element.dataOffset;
                return;
            }
        }

        // eof encountered - log a warning and set the length of the element based on the buffer size
        byteStream.warnings.push('eof encountered before finding sequence delimitation item in sequence element of undefined length with tag ' + element.tag);
        element.length = byteStream.byteArray.length - element.dataOffset;
    }

    function readSQElementKnownLengthExplicit(byteStream, element, warnings)
    {
        var maxPosition = element.dataOffset + element.length;
        while(byteStream.position < maxPosition)
        {
            var item = readSequenceItemExplicit(byteStream, warnings);
            element.items.push(item);
        }
    }

    dicomParser.readSequenceItemsExplicit = function(byteStream, element, warnings)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readSequenceItemsExplicit: missing required parameter 'byteStream'";
        }
        if(element === undefined)
        {
            throw "dicomParser.readSequenceItemsExplicit: missing required parameter 'element'";
        }

        element.items = [];

        if(element.length === 4294967295)
        {
            readSQElementUndefinedLengthExplicit(byteStream, element);
        }
        else
        {
            readSQElementKnownLengthExplicit(byteStream, element, warnings);
        }
    };


    return dicomParser;
}(dicomParser));