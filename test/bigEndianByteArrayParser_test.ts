import { expect } from 'chai';
import bigEndianByteArrayParser from '../src/bigEndianByteArrayParser';

describe('bigEndianByteArrayParser', () => {

  describe('#readUint16', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      byteArray[0] = 0xff;
      byteArray[1] = 0x80;

      // Act
      const uint16 = bigEndianByteArrayParser.readUint16(byteArray, 0);

      // Assert
      expect(uint16).to.equal(0xff80);
    });

    it('should throw an exception on buffer overread', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        const invoker = () => bigEndianByteArrayParser.readUint16(byteArray, 31);

        // Act / Assert
        expect(invoker).to.throw();
    });

    it('should throw an exception on position < 0', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        const invoker = () => bigEndianByteArrayParser.readUint16(byteArray, -1);

        // Act / Assert
        expect(invoker).to.throw();
    });

  });

  describe('#readInt16', () => {

    it('should return the expected value when reading a null terminated string', () => {
        // Arrange
        const byteArray = new Uint8Array(6);
        byteArray[0] = 0xC9;
        byteArray[1] = 0x3A

        // Act
        const int16 = bigEndianByteArrayParser.readInt16(byteArray, 0);

        // Assert
        expect(int16).to.equal(-14022);
    });

    it('should throw an exception on buffer overread', () => {
        // Arrange
        const byteArray = new Uint8Array(6);
        const invoker = () => bigEndianByteArrayParser.readInt16(byteArray, 5);

        // Act / Assert
        expect(invoker).to.throw();
    });

    it('should throw an exception on position < 0', () => {
        // Arrange
        const byteArray = new Uint8Array(2);
        const invoker = () => bigEndianByteArrayParser.readInt16(byteArray, -1);

        // Act / Assert
        expect(invoker).to.throw();
    });

  });

  describe('#readUint32', () => {

    it('should return the expected value', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        byteArray[0] = 0x11;
        byteArray[1] = 0x22;
        byteArray[2] = 0x33;
        byteArray[3] = 0x44;

        // Act
        const uint32 = bigEndianByteArrayParser.readUint32(byteArray, 0);

        // Assert
        expect(uint32).to.equal(0x11223344);
    });

    it('should return the expected value', () => {
        // Arrange
        const byteArray = new Uint8Array(4);
        byteArray[0] = 0xFF;
        byteArray[1] = 0xFF;
        byteArray[2] = 0xFF;
        byteArray[3] = 0xFF;

        // Act
        const uint32 = bigEndianByteArrayParser.readUint32(byteArray, 0);

        // Assert
        expect(uint32).to.equal(4294967295);
    });

    it('should throw an exception on buffer overread', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        const invoker = () => bigEndianByteArrayParser.readUint32(byteArray, 29);

        // Act / Assert
        expect(invoker).to.throw();
    });

    it('should throw an exception on position < 0', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        const invoker = () => bigEndianByteArrayParser.readUint32(byteArray, -1);

        // Act / Assert
        expect(invoker).to.throw();
    });

  });

  describe('#readInt32', () => {

    it('should return the expected value when reading a null terminated string', () => {
        // Arrange
        const byteArray = new Uint8Array(6);
        byteArray[0] = 0xFE;
        byteArray[1] = 0xDC
        byteArray[2] = 0xBA
        byteArray[3] = 0x98

        // Act
        const int32 = bigEndianByteArrayParser.readInt32(byteArray, 0);

        // Assert
        expect(int32).to.equal(-19088744);
    });

    it('readInt32 throws an exception on buffer overread', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        const invoker = () => bigEndianByteArrayParser.readInt32(byteArray, 29);

        // Act / Assert
        expect(invoker).to.throw();
    });

    it('readInt32 throws an exception on position < 0', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        const invoker = () => bigEndianByteArrayParser.readInt32(byteArray, -1);

        // Act / Assert
        expect(invoker).to.throw();
    });

  });

  describe('#readFloat', () => {


    it('should return the expected value for first value', () => {
        // Arrange
        const byteArray = new Uint8Array(4);
        byteArray[0] = 0xC7;
        byteArray[1] = 0x80;
        byteArray[2] = 0x01;
        byteArray[3] = 0x04;

        // Act
        const float = bigEndianByteArrayParser.readFloat(byteArray, 0);

        // Assert
        expect(float).to.equal(-65538.03125);
    });

    it('should return the expected value for second value', () => {
        // Arrange
        const byteArray = new Uint8Array(8);
        byteArray[0] = 0xFF;
        byteArray[1] = 0xAC;
        byteArray[2] = 0xB4;
        byteArray[3] = 0xC0;
        byteArray[4] = 0xC7;
        byteArray[5] = 0x80;
        byteArray[6] = 0x01;
        byteArray[7] = 0x04;

        // Act
        const float = bigEndianByteArrayParser.readFloat(byteArray, 4);

        // Assert
        expect(float).to.equal(-65538.03125);
    });

    it('should throw an exception on buffer overread', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        const invoker = () => bigEndianByteArrayParser.readFloat(byteArray, 29);

        // Act / Assert
        expect(invoker).to.throw();
    });

    it('should throw an exception on position < 0', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        const invoker = () => bigEndianByteArrayParser.readFloat(byteArray, -1)

        // Act / Assert
        expect(invoker).to.throw();
    });

  });

  describe('#readDouble', () => {

    it('should return the expected value for first value', () => {
        // Arrange
        const byteArray = new Uint8Array(8);
        byteArray[0] = 0xCE;
        byteArray[1] = 0x98;
        byteArray[2] = 0xAB;
        byteArray[3] = 0x12;
        byteArray[4] = 0x04;
        byteArray[5] = 0x87;
        byteArray[6] = 0x56;
        byteArray[7] = 0xFA;

        // Act
        const doubleValue = bigEndianByteArrayParser.readDouble(byteArray, 0);

        // Assert
        expect(doubleValue).to.equal(-4.256349017182337e+70);
    });

    it('should return the expected value for second value', () => {
        // Arrange
        const byteArray = new Uint8Array(16);
        byteArray[7] = 0x7f;
        byteArray[6] = 0xef;
        byteArray[5] = 0xff;
        byteArray[4] = 0xff;
        byteArray[3] = 0xff;
        byteArray[2] = 0xff;
        byteArray[1] = 0xff;
        byteArray[0] = 0xff;
        byteArray[8] = 0xCE;
        byteArray[9] = 0x98;
        byteArray[10] = 0xAB;
        byteArray[11] = 0x12;
        byteArray[12] = 0x04;
        byteArray[13] = 0x87;
        byteArray[14] = 0x56;
        byteArray[15] = 0xFA;

        // Act
        const doubleValue = bigEndianByteArrayParser.readDouble(byteArray, 8);

        // Assert
        expect(doubleValue).to.equal(-4.256349017182337e+70);
    });

    it('should throw an exception on buffer overread', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        const invoker = () => bigEndianByteArrayParser.readDouble(byteArray, 25);

        // Act / Assert
        expect(invoker).to.throw();
    });

    it('should throw an exception on position < 0', () => {
        // Arrange
        const byteArray = new Uint8Array(32);
        const invoker = () => bigEndianByteArrayParser.readDouble(byteArray, -1);

        // Act / Assert
        expect(invoker).to.throw();
    });

  });

});

