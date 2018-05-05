import { expect } from 'chai';
import * as util from '../src/util';

describe('util', () => {

  describe('#isPrivateTag', () => {

    it('should return `true` for a private tag', () => {
      const isPrivateTag = util.isPrivateTag('x00190010');
      expect(isPrivateTag).to.equal(true);
    })

    it('should return `false` for a non-private tag', () => {
      const isPrivateTag = util.isPrivateTag('x00100010');
      expect(isPrivateTag).to.equal(false);
    })

  });

  describe('#parsePN', () => {

    describe('when parsing a full PN', () => {
      let val;

      beforeEach(() => {
        // Arrange
        const pnString = 'F^G^M^P^S';

        // Act
        val = util.parsePN(pnString);
      });

      it('should return the right family name', () => {
        // Assert
        expect(val.familyName).to.equal('F');
      });

      it('should return the right given name', () => {
        // Assert
        expect(val.givenName).to.equal('G');
      });

      it('should return the right middle name', () => {
        // Assert
        expect(val.middleName).to.equal('M');
      });

      it('should return the right prefix', () => {
        // Assert
        expect(val.prefix).to.equal('P');
      });

      it('should return the right suffix', () => {
        // Assert
        expect(val.suffix).to.equal('S');
      });

    });

    describe('when parsing a partial PN', () => {
      let val;

      beforeEach(() => {
        // Arrange
        const pnString = 'F';

        // Act
        val = util.parsePN(pnString);
      });

      it('should return the right family name', () => {
        // Assert
        expect(val.familyName).to.equal('F');
      });

      it('should return the right given name', () => {
        // Assert
        expect(val.givenName).to.be.undefined;
      });

      it('should return the right middle name', () => {
        // Assert
        expect(val.middleName).to.be.undefined;
      });

      it('should return the right prefix', () => {
        // Assert
        expect(val.prefix).to.be.undefined;
      });

      it('should return the right suffix', () => {
        // Assert
        expect(val.suffix).to.be.undefined;
      });

    });

  });

  describe('#parseTM', () => {

    describe('when parsing a full TM', () => {
      let val;

      beforeEach(() => {
        // Arrange
        const tmString = '081236.531000';

        // Act
        val = util.parseTM(tmString);
      });

      it('should return the right hours', () => {
        // Assert
        expect(val.hours).to.equal(8);
      });

      it('should return the right minutes', () => {
        // Assert
        expect(val.minutes).to.equal(12);
      });

      it('should return the right seconds', () => {
        // Assert
        expect(val.seconds).to.equal(36);
      });

      it('should return the right fractionalSeconds', () => {
        // Assert
        expect(val.fractionalSeconds).to.equal(531000);
      });

    });

    describe('when parsing a partial TM', () => {
      let val;

      beforeEach(() => {
        // Arrange
        const tmString = '08';

        // Act
        val = util.parseTM(tmString);
      });

      it('should return the right hours', () => {
        // Assert
        expect(val.hours).to.equal(8);
      });

      it('should return the right minutes', () => {
        // Assert
        expect(val.minutes).to.be.undefined;
      });

      it('should return the right seconds', () => {
        // Assert
        expect(val.seconds).to.be.undefined;
      });

      it('should return the right fractionalSeconds', () => {
        // Assert
        expect(val.fractionalSeconds).to.be.undefined;
      });

    });

    describe('when parsing a partial fractional TM', () => {

      it('should return the expected value for no zeros', () => {
        // Arrange
        const tmString = '081236.5';

        // Act
        const val = util.parseTM(tmString);

        // Assert
        expect(val.hours).to.equal(8);
        expect(val.minutes).to.equal(12);
        expect(val.seconds).to.equal(36);
        expect(val.fractionalSeconds).to.equal(500000);
      });

      it('should return the expected value for leading and following zeros', () => {
        // Arrange
        const tmString = '081236.00500';

        // Act
        const val = util.parseTM(tmString);

        // Assert
        expect(val.hours).to.equal(8);
        expect(val.minutes).to.equal(12);
        expect(val.seconds).to.equal(36);
        expect(val.fractionalSeconds).to.equal(5000);
      });

    });

    describe('when parsing a invalid TM', () => {

      it('should throw an exception', () => {
        // Arrange
        const tmString = '241236.531000';
        const invoker = () => util.parseTM(tmString, true);

        // Act / Asset
        expect(invoker).to.throw();
      });

    });

    describe('when parsing a TM with bad seconds', () => {

      it('shoud throw an exception', () => {
        // Arrange
        const tmString = '236036.531000';
        const invoker = () => util.parseTM(tmString, true);

        // Act / Asset
        expect(invoker).to.throw();
      });

    });

    describe('when parsing a TM with bad seconds', () => {

      it('should throw an exception', () => {
        // Arrange
        const tmString = '232260.531000';
        const invoker = () => util.parseTM(tmString, true);

        // Act
        expect(invoker).to.throw();
      });

    });

    describe('when parsing a TM with bad fractional', () => {

      it('should throw an exception', () => {
        // Arrange
        const tmString = '232259.AA';
        const invoker = () => util.parseTM(tmString, true);

        // Act / Asset
        expect(invoker).to.throw();
      });

    });

  });

  describe('#parseDA', () => {

    describe('when parsing a valid DA', () => {

      it('should return the expected value', () => {
        // Arrange
        const daString = '20140329';

        // Act
        const val = util.parseDA(daString);

        // Assert
        expect(val.year).to.equal(2014);
        expect(val.month).to.equal(3);
        expect(val.day).to.equal(29);
      });

    });

    describe('when parsing a DA with a bad month', () => {

      it('should throw an exception', () => {
        // Arrange
        const daString = '20150001';
        const invoker = () => util.parseDA(daString, true);

        // Act / Asset
        expect(invoker).to.throw();
      });

    });

    describe('when parsing a DA with a bad day', () => {

      it('should throw an exception', () => {
        // Arrange
        const daString = '20150100';
        const invoker = () => util.parseDA(daString, true);

        // Act
        expect(invoker).to.throw();
      });

    });

    describe('when parsing a DA that is not a leap year', () => {

      it('should throw an exception', () => {
        // Arrange
        const daString = '20150229';
        const invoker = () => util.parseDA(daString, true);

        // Act / Asset
        expect(invoker).to.throw();
      });

    });

    describe('when parsing DA that is a leap year', () => {

      it('should return the expected value', () => {
        // Arrange
        const daString = '20160229';

        // Act
        const val = util.parseDA(daString, true);

        // Assert
        expect(val.year).to.equal(2016);
        expect(val.month).to.equal(2);
        expect(val.day).to.equal(29);
      });

    });

    describe('when parsing a DA with non-number characters on "day" positions', () => {

      it('should throw an exception', () => {
        // Arrange
        const daString = '201500AA';
        const invoker = () => util.parseDA(daString, true);

        // Act / Assert
        expect(invoker).to.throw();
      });

    });

    describe('when parsing a DA with non-number characters on "year" positions', () => {

      it('should throw an exception', () => {
        // Arrange
        const daString = 'AAAA0102';
        const invoker = () => util.parseDA(daString, true);

        // Act / Assert
        expect(invoker).to.throw();
      });

    });

    describe('when parsing a DA with non-number characters on "month" positions', () => {

      it('parseDA month not number', () => {
        // Arrange
        const daString = '2015AA02';
        const invoker = () => util.parseDA(daString, true);

        // Act / Assert
        expect(invoker).to.throw();
      });

    });

    describe('when parsing a date with invalid length', () => {

      it('should throw an exception', () => {
        // Arrange
        const daString = '201501';
        const invoker = () => util.parseDA(daString, true);

        // Act / Assert
        expect(invoker).to.throw();
      });

    });

  });

});
