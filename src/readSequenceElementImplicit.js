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

    function readDicomDataSetImplicitUndefinedLength(byteStream)
    {
        var elements = {};

        while(byteStream.position < byteStream.byteArray.length)
        {
            var element = dicomParser.readDicomElementImplicit(byteStream);
            elements[element.tag] = element;

            // we hit an item delimiter tag, return the current offset to mark
            // the end of this sequence item
            if(element.tag === 'xfffee00d')
            {
                return new dicomParser.DataSet(byteStream.byteArrayParser, byteStream.byteArray, elements);
            }
        }
        // eof encountered - log a warning and return what we have for the element
        byteStream.warnings.push('eof encountered before finding sequence item delimiter in sequence item of undefined length');
        return new dicomParser.DataSet(byteStream.byteArrayParser, byteStream.byteArray, elements);
    }

    function readSequenceItemImplicit(byteStream)
    {
        var item = dicomParser.readSequenceItem(byteStream);

        if(item.length === 4294967295)
        {
            item.hadUndefinedLength = true;
            item.dataSet = readDicomDataSetImplicitUndefinedLength(byteStream);
            item.length = byteStream.position - item.dataOffset;
        }
        else
        {
            item.dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteStream.byteArray, {});
            dicomParser.parseDicomDataSetImplicit(item.dataSet, byteStream, byteStream.position + item.length);
        }
        return item;
    }

    function readSQElementUndefinedLengthImplicit(byteStream, element)
    {
        while(byteStream.position < byteStream.byteArray.length)
        {
            var item = readSequenceItemImplicit(byteStream);
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
        byteStream.warnings.push('eof encountered before finding sequence delimitation item in sequence of undefined length');
        element.length = byteStream.byteArray.length - element.dataOffset;
    }

    function readSQElementKnownLengthImplicit(byteStream, element)
    {
        var maxPosition = element.dataOffset + element.length;
        while(byteStream.position < maxPosition)
        {
            var item = readSequenceItemImplicit(byteStream);
            element.items.push(item);
        }
    }

    /**
     * Reads sequence items for an element in an implicit little endian byte stream
     * @param byteStream the implicit little endian byte stream
     * @param element the element to read the sequence items for
     */
    dicomParser.readSequenceItemsImplicit = function(byteStream, element)
    {
        if(byteStream === undefined)
        {
            throw "dicomParser.readSequenceItemsImplicit: missing required parameter 'byteStream'";
        }
        if(element === undefined)
        {
            throw "dicomParser.readSequenceItemsImplicit: missing required parameter 'element'";
        }

        element.items = [];

        if(element.length === 4294967295)
        {
            readSQElementUndefinedLengthImplicit(byteStream, element);
        }
        else
        {
            readSQElementKnownLengthImplicit(byteStream, element);
        }
    };

    return dicomParser;
}(dicomParser));