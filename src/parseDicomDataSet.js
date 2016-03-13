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
     */
    dicomParser.parseDicomDataSetExplicit = function (dataSet, byteStream, maxPosition, options) {

        maxPosition = (maxPosition === undefined) ? byteStream.byteArray.length : maxPosition ;
        options = options || {};

        if(byteStream === undefined)
        {
            throw "dicomParser.parseDicomDataSetExplicit: missing required parameter 'byteStream'";
        }
        if(maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length)
        {
            throw "dicomParser.parseDicomDataSetExplicit: invalid value for parameter 'maxPosition'";
        }
        var elements = dataSet.elements;

        while(byteStream.position < maxPosition)
        {
            var element = dicomParser.readDicomElementExplicit(byteStream, dataSet.warnings, options.untilTag);
            elements[element.tag] = element;
            if(element.tag === options.untilTag) {
                return;
            }
        }
        if(byteStream.position > maxPosition) {
            throw "dicomParser:parseDicomDataSetExplicit: buffer overrun";
        }
    };

    /**
     * reads an implicit data set
     * @param byteStream the byte stream to read from
     * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
     */
    dicomParser.parseDicomDataSetImplicit = function(dataSet, byteStream, maxPosition, options)
    {
        maxPosition = (maxPosition === undefined) ? dataSet.byteArray.length : maxPosition ;
        options = options || {};

        if(byteStream === undefined)
        {
            throw "dicomParser.parseDicomDataSetImplicit: missing required parameter 'byteStream'";
        }
        if(maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length)
        {
            throw "dicomParser.parseDicomDataSetImplicit: invalid value for parameter 'maxPosition'";
        }

        var elements = dataSet.elements;

        while(byteStream.position < maxPosition)
        {
            var element = dicomParser.readDicomElementImplicit(byteStream, options.untilTag, options.vrCallback);
            elements[element.tag] = element;
            if(element.tag === options.untilTag) {
                return;
            }
        }
    };

    return dicomParser;
}(dicomParser));
