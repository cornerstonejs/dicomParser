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

    /**
     * reads an explicit data set
     * @param byteStream the byte stream to read from
     * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
     * @returns {dicomParser.DataSet}
     */
    dicomParser.parseDicomDataSetExplicit = function (byteStream, maxPosition) {
        if(byteStream === undefined)
        {
            throw "dicomParser.parseDicomDataSetExplicit: missing required parameter 'byteStream'";
        }
        if(maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length)
        {
            throw "dicomParser.parseDicomDataSetExplicit: invalid value for parameter 'maxPosition'";
        }
        var elements = {};

        maxPosition = maxPosition ||byteStream.byteArray.length - 6;

        while(byteStream.position < maxPosition)
        {
            var element = dicomParser.readDicomElementExplicit(byteStream);
            elements[element.tag] = element;
        }
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    };

    /**
     * reads an implicit data set
     * @param byteStream the byte stream to read from
     * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
     * @returns {dicomParser.DataSet}
     */
    dicomParser.parseDicomDataSetImplicit = function(byteStream, maxPosition) {

        if(byteStream === undefined)
        {
            throw "dicomParser.parseDicomDataSetImplicit: missing required parameter 'byteStream'";
        }
        if(maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length)
        {
            throw "dicomParser.parseDicomDataSetImplicit: invalid value for parameter 'maxPosition'";
        }

        var elements = {};

        maxPosition = maxPosition ? maxPosition : byteStream.byteArray.length;

        while(byteStream.position < maxPosition)
        {
            var element = dicomParser.readDicomElementImplicit(byteStream);
            elements[element.tag] = element;
        }
        return new dicomParser.DataSet(byteStream.byteArray, elements);
    };

    return dicomParser;
}(dicomParser));