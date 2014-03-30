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

    // share this with parseDicomElement.js
    function readTag(byteStream)
    {
        var groupNumber =  byteStream.readUint16() * 256 * 256;
        var elementNumber = byteStream.readUint16();
        var tag = "x" + ('00000000' + (groupNumber + elementNumber).toString(16)).substr(-8);
        return tag;
    }

    function parseSequenceItem(byteStream)
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

        return element;
    }

    function readSequenceItemExplicit(byteStream)
    {
        var item = parseSequenceItem(byteStream);

        if(item.length === -1)
        {
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

    function parseSQElementKnownLengthExplicit(byteStream, element)
    {
        element.items = [];
        while(byteStream.position < element.dataOffset + element.length)
        {
            var item = readSequenceItemExplicit(byteStream);
            element.items.push(item);
        }
    }

    ///////// implicit sequence decoding

    function parseSQElementUndefinedLengthImplicit(byteStream, element)
    {
        element.items = [];
        while(byteStream.position < byteStream.byteArray.length)
        {
            var item = readSequenceItemImplicit(byteStream);
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


    function parseDicomDataSetImplicitUndefinedLength(byteStream)
    {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var elements = {};

        while(byteStream.position < byteStream.byteArray.length)
        {
            var element = dicomParser.parseDicomElementImplicit(byteStream);
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

    function readSequenceItemImplicit(byteStream)
    {
        var item = parseSequenceItem(byteStream);

        if(item.length === -1)
        {
            item.dataSet = parseDicomDataSetImplicitUndefinedLength(byteStream);
            item.length = byteStream.position - item.dataOffset;
        }
        else
        {
            item.dataSet = dicomParser.parseDicomDataSetImplicit(byteStream, byteStream.position + item.length);
        }
        return item;
    }

    function parseSQElementKnownLengthImplicit(byteStream, element)
    {
        element.items = [];
        while(byteStream.position < element.dataOffset + element.length)
        {
            var item = readSequenceItemImplicit(byteStream);
            element.items.push(item);
        }
    }

    dicomParser.parseSequenceItemsImplicit = function(byteStream, element)
    {
        if(element.length === -1)
        {
            parseSQElementUndefinedLengthImplicit(byteStream, element);
        }
        else
        {
            parseSQElementKnownLengthImplicit(byteStream, element);
        }

    };

    ///////// implicit sequence decoding

    dicomParser.parseSequenceItemsExplicit = function(byteStream, element)
    {
        if(element.length === -1)
        {
            parseSQElementUndefinedLengthExplicit(byteStream, element);
        }
        else
        {
            parseSQElementKnownLengthExplicit(byteStream, element);
        }
    };


    return dicomParser;
}(dicomParser));