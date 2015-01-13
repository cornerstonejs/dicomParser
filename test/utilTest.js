(function(dicomParser) {
    module("dicomParser.util");

    test("isPrivateTag true", function() {
        // Arrange

        // Act
        var isPrivateTag = dicomParser.isPrivateTag('x00190010');

        // Assert
        ok(isPrivateTag, "is private tag");
    });

    test("isPrivateTag false", function() {
        // Arrange

        // Act
        var isPrivateTag = dicomParser.isPrivateTag('x00100010');

        // Assert
        ok(isPrivateTag === false, "is private tag");
    });

    test("parsePN full", function() {
        // Arrange
        var pnString = 'F^G^M^P^S';

        // Act
        var val = dicomParser.parsePN(pnString);

        // Assert
        equal(val.familyName, 'F', "personName returned wrong value for familyName");
        equal(val.givenName, 'G', "personName returned wrong value for givenName");
        equal(val.middleName, 'M', "personName returned wrong value for middleName");
        equal(val.prefix, 'P', "personName returned wrong value for prefix");
        equal(val.suffix, 'S', "personName returned wrong value for suffix");
    });

    test("parsePN partial", function() {
        // Arrange
        var pnString = 'F';

        // Act
        var val = dicomParser.parsePN(pnString);

        // Assert
        equal(val.familyName, 'F', "personName returned wrong value for familyName");
        equal(val.givenName, undefined, "personName returned wrong value for givenName");
        equal(val.middleName, undefined, "personName returned wrong value for middleName");
        equal(val.prefix, undefined, "personName returned wrong value for prefix");
        equal(val.suffix, undefined, "personName returned wrong value for suffix");
    });

    test("parseTM", function() {
        // Arrange
        var tmString = '081236.531000';

        // Act
        var val = dicomParser.parseTM(tmString);

        // Assert
        equal(val.hours, 8, "time returned wrong value for hours");
        equal(val.minutes, 12, "time returned wrong value for minutes");
        equal(val.seconds, 36, "time returned wrong value for seconds");
        equal(val.fractionalSeconds, 531000, "time returned wrong value for fractionalSeconds");
    });

    test("parseTM partial", function() {
        // Arrange
        var tmString = '08';

        // Act
        var val = dicomParser.parseTM(tmString);

        // Assert
        equal(val.hours, 8, "time returned wrong value for hours");
        equal(val.minutes, undefined, "time returned wrong value for minutes");
        equal(val.seconds, undefined, "time returned wrong value for seconds");
        equal(val.fractionalSeconds, undefined, "time returned wrong value for fractionalSeconds");
    });

    test("parseTM partial fractional", function() {
        // Arrange
        var tmString = '081236.5';

        // Act
        var val = dicomParser.parseTM(tmString);

        // Assert
        equal(val.hours, 8, "time returned wrong value for hours");
        equal(val.minutes, 12, "time returned wrong value for minutes");
        equal(val.seconds, 36, "time returned wrong value for seconds");
        equal(val.fractionalSeconds, 5, "time returned wrong value for fractionalSeconds");
    });


    test("parseDA", function() {
        // Arrange
        var daString = '20140329';

        // Act
        var val = dicomParser.parseDA(daString);

        // Assert
        equal(val.year, 2014, "date returned wrong value");
        equal(val.month, 3, "date returned wrong value");
        equal(val.day, 29, "date returned wrong value");
    });

})(dicomParser);