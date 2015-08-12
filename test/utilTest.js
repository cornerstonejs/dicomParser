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

  test("parseTM bad hours", function() {
    // Arrange
    var tmString = '241236.531000';

    // Act
    throws(function() {
      dicomParser.parseTM(tmString, true);
    });

  });

  test("parseTM bad minutes", function() {
    // Arrange
    var tmString = '236036.531000';

    // Act
    throws(function() {
      dicomParser.parseTM(tmString, true);
    });

  });

  test("parseTM bad seconds", function() {
    // Arrange
    var tmString = '232260.531000';

    // Act
    throws(function() {
      dicomParser.parseTM(tmString, true);
    });

  });

  test("parseTM bad fractional", function() {
    // Arrange
    var tmString = '232259.AA';

    // Act
    throws(function() {
      dicomParser.parseTM(tmString, true);
    });

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

  test("parseDA bad month", function() {
    // Arrange
    var daString = '20150001';

    // Act
    throws(function() {
      dicomParser.parseDA(daString, true);
    });

  });

  test("parseDA bad day", function() {
    // Arrange
    var daString = '20150100';

    // Act
    throws(function() {
      dicomParser.parseDA(daString, true);
    });

  });

  test("parseDA not leap year", function() {
    // Arrange
    var daString = '20150229';

    // Act
    throws(function() {
      dicomParser.parseDA(daString, true);
    });

  });

  test("parseDA leap year", function() {
    // Arrange
    var daString = '20160229';

    // Act
    var val = dicomParser.parseDA(daString, true);

    // Assert
    equal(val.year, 2016, "date returned wrong value");
    equal(val.month, 2, "date returned wrong value");
    equal(val.day, 29, "date returned wrong value");

  });

  test("parseDA day not number", function() {
    // Arrange
    var daString = '201500AA';

    // Act
    throws(function() {
      dicomParser.parseDA(daString, true);
    });

  });

  test("parseDA year not number", function() {
    // Arrange
    var daString = 'AAAA0102';

    // Act
    throws(function() {
      dicomParser.parseDA(daString, true);
    });

  });

  test("parseDA month not number", function() {
    // Arrange
    var daString = '2015AA02';

    // Act
    throws(function() {
      dicomParser.parseDA(daString, true);
    });

  });

  test("parseDA invalid date length", function() {
    // Arrange
    var daString = '201501';

    // Act
    throws(function() {
      dicomParser.parseDA(daString, true);
    });

  });

})(dicomParser);