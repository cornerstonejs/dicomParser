/**
 * Utility functions for dealing with DICOM
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }

    var stringVrs = {
        AE: true,
        AS: true,
        AT: false,
        CS: true,
        DA: true,
        DS: true,
        DT: true,
        FL: false,
        FD: false,
        IS: true,
        LO: true,
        LT: true,
        OB: false,
        OD: false,
        OF: false,
        OW: false,
        PN: true,
        SH: true,
        SL: false,
        SQ: false,
        SS: false,
        ST: true,
        TM: true,
        UI: true,
        UL: false,
        UN: undefined, // dunno
        UR: true,
        US: false,
        UT: true
    };

    /**
     * Tests to see if vr is a string or not.
     * @param vr
     * @returns true if string, false it not string, undefined if unknown vr or UN type
     */
    dicomParser.isStringVr = function(vr)
    {
        return stringVrs[vr];
    };

    /**
     * Tests to see if a given tag in the format xggggeeee is a private tag or not
     * @param tag
     * @returns {boolean}
     */
    dicomParser.isPrivateTag = function(tag)
    {
        var lastGroupDigit = parseInt(tag[4]);
        var groupIsOdd = (lastGroupDigit % 2) === 1;
        return groupIsOdd;
    };

    /**
     * Parses a PN formatted string into a javascript object with properties for givenName, familyName, middleName, prefix and suffix
     * @param personName a string in the PN VR format
     * @param index
     * @returns {*} javascript object with properties for givenName, familyName, middleName, prefix and suffix or undefined if no element or data
     */
    dicomParser.parsePN = function(personName) {
        if(personName === undefined) {
            return undefined;
        }
        var stringValues = personName.split('^');
        return {
            familyName: stringValues[0],
            givenName: stringValues[1],
            middleName: stringValues[2],
            prefix: stringValues[3],
            suffix: stringValues[4]
        };
    };

    /**
     * Parses a DA formatted string into a Javascript object
     * @param date a string in the DA VR format
     * @returns {*} Javascript object with properties year, month and day or undefined if not present or not 8 bytes long
     */
    dicomParser.parseDA = function(date)
    {
        if(date && date.length === 8)
        {
            var yyyy = parseInt(date.substring(0, 4), 10);
            var mm = parseInt(date.substring(4, 6), 10);
            var dd = parseInt(date.substring(6, 8), 10);

            return {
                year: yyyy,
                month: mm,
                day: dd
            };
        }
        return undefined;
    };

    /**
     * Parses a TM formatted string into a javascript object with properties for hours, minutes, seconds and fractionalSeconds
     * @param time a string in the TM VR format
     * @returns {*} javascript object with properties for hours, minutes, seconds and fractionalSeconds or undefined if no element or data.  Missing fields are set to undefined
     */
    dicomParser.parseTM = function(time) {

        if (time.length >= 2) // must at least have HH
        {
            // 0123456789
            // HHMMSS.FFFFFF
            var hh = parseInt(time.substring(0, 2), 10);
            var mm = time.length >= 4 ? parseInt(time.substring(2, 4), 10) : undefined;
            var ss = time.length >= 6 ? parseInt(time.substring(4, 6), 10) : undefined;
            var ffffff = time.length >= 8 ? parseInt(time.substring(7, 13), 10) : undefined;

            return {
                hours: hh,
                minutes: mm,
                seconds: ss,
                fractionalSeconds: ffffff
            };
        }
        return undefined;
    };

    return dicomParser;
}(dicomParser));