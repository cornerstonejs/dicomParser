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

    function readDicomDataSetImplicitUndefinedLength(byteStream, vrCallback)
    {
        var elements = {};

        while(byteStream.position < byteStream.byteArray.length)
        {
            var element = dicomParser.readDicomElementImplicit(byteStream, undefined, vrCallback);
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

    function readSequenceItemImplicit(byteStream, vrCallback)
    {
        var item = dicomParser.readSequenceItem(byteStream);

        if(item.length === 4294967295)
        {
            item.hadUndefinedLength = true;
            item.dataSet = readDicomDataSetImplicitUndefinedLength(byteStream, vrCallback);
            item.length = byteStream.position - item.dataOffset;
        }
        else
        {
            item.dataSet = new dicomParser.DataSet(byteStream.byteArrayParser, byteStream.byteArray, {});
            dicomParser.parseDicomDataSetImplicit(item.dataSet, byteStream, byteStream.position + item.length, {vrCallback: vrCallback});
        }
        return item;
    }

    function readSQElementUndefinedLengthImplicit(byteStream, element, vrCallback)
    {
        while((byteStream.position + 4) <= byteStream.byteArray.length)
        {
          // end reading this sequence if the next tag is the sequence delimitation item
          var nextTag = dicomParser.readTag(byteStream);
          byteStream.seek(-4);
          if (nextTag === 'xfffee0dd') {
            // set the correct length
            element.length = byteStream.position - element.dataOffset;
            byteStream.seek(8);
            return element;
          }

          var item = readSequenceItemImplicit(byteStream, vrCallback);
          element.items.push(item);
        }
        byteStream.warnings.push('eof encountered before finding sequence delimiter in sequence of undefined length');
        element.length = byteStream.byteArray.length - element.dataOffset;
    }

    function readSQElementKnownLengthImplicit(byteStream, element, vrCallback)
    {
        var maxPosition = element.dataOffset + element.length;
        while(byteStream.position < maxPosition)
        {
            var item = readSequenceItemImplicit(byteStream, vrCallback);
            element.items.push(item);
        }
    }

    /**
     * Reads sequence items for an element in an implicit little endian byte stream
     * @param byteStream the implicit little endian byte stream
     * @param element the element to read the sequence items for
     * @param vrCallback an optional method that returns a VR string given a tag
     */
    dicomParser.readSequenceItemsImplicit = function(byteStream, element, vrCallback)
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
            readSQElementUndefinedLengthImplicit(byteStream, element, vrCallback);
        }
        else
        {
            readSQElementKnownLengthImplicit(byteStream, element, vrCallback);
        }
    };

    return dicomParser;
}(dicomParser));