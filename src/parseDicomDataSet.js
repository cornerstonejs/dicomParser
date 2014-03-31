/**
 * Internal helper functions for parsing implicit and explicit DICOM data sets
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    function parseDicomDataSetExplicit(byteStream, maxPosition) {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var elements = {};

        maxPosition = maxPosition ||byteStream.byteArray.length - 6;

        while(byteStream.position < maxPosition)
        {
            var element = dicomParser.readDicomElementExplicit(byteStream);
            elements[element.tag] = element;
        }
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    }

    function parseDicomDataSetImplicit(byteStream, maxPosition) {
        if(!byteStream)
        {
            throw "missing required parameter 'byteStream'";
        }

        var elements = {};

        maxPosition = maxPosition ? maxPosition : byteStream.byteArray.length;

        while(byteStream.position < maxPosition)
        {
            var element = dicomParser.readDicomElementImplicit(byteStream);
            elements[element.tag] = element;
        }
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    }

    dicomParser.parseDicomDataSetExplicit = parseDicomDataSetExplicit;
    dicomParser.parseDicomDataSetImplicit = parseDicomDataSetImplicit;

    return dicomParser;
}(dicomParser));