var dicomParser = (function (dicomParser) {
    "use strict";

    if (dicomParser === undefined) {
        dicomParser = {};
    }

    /**
     * Converts an explicit VR element to a string or undefined if it is not possible to convert.
     * Throws an error if an implicit element is supplied
     * @param dataSet
     * @param element
     * @returns {*}
     */
    dicomParser.explicitElementToString = function(dataSet, element)
    {
        if(dataSet === undefined || element === undefined) {
            throw 'dicomParser.explicitElementToString: missing required parameters';
        }
        if(element.vr === undefined) {
            throw 'dicomParser.explicitElementToString: cannot convert implicit element to string';
        }

        var textResult;

        function multiElementToString(numItems, func) {
            var result = "";
            for(var i=0; i < numItems; i++) {
                if(i !== 0) {
                    result += '/';
                }
                result += func.call(dataSet, element.tag, i).toString();
            }
            return result;
        }

        if(dicomParser.isStringVr(element.vr) === true)
        {
            textResult = dataSet.string(element.tag);
        }
        else if (element.vr == 'AT') {
            var num = dataSet.uint32(element.tag);
            if(num === undefined) {
                return undefined;
            }
            if (num < 0)
            {
                num = 0xFFFFFFFF + num + 1;
            }

            return 'x' + num.toString(16).toUpperCase();
        }
        else if (element.vr == 'US')
        {
            textResult = multiElementToString(element.length / 2, dataSet.uint16);
        }
        else if(element.vr === 'SS')
        {
            textResult = multiElementToString(element.length / 2, dataSet.int16);
        }
        else if (element.vr == 'UL')
        {
            textResult = multiElementToString(element.length / 4, dataSet.uint32);
        }
        else if(element.vr === 'SL')
        {
            textResult = multiElementToString(element.length / 4, dataSet.int32);
        }
        else if(element.vr == 'FD')
        {
            textResult = multiElementToString(element.length / 8, dataSet.double);
        }
        else if(element.vr == 'FL')
        {
            textResult = multiElementToString(element.length / 4, dataSet.float);
        }

        return textResult;
    };
    return dicomParser;
}(dicomParser));