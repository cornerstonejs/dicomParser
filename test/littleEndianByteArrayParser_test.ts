import { expect } from 'chai';
import littleEndianByteArrayParser from '../src/littleEndianByteArrayParser';

describe('littleEndianByteArrayParser', () => {

  describe('#readUint16', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      byteArray[0] = 0xff;
      byteArray[1] = 0x80;

      // Act
      const uint16 = littleEndianByteArrayParser.readUint16(byteArray, 0);

      // Assert
      expect(uint16).to.equal(0x80ff);
    });

    it('should throw an exception on buffer overread', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => littleEndianByteArrayParser.readUint16(byteArray, 31);

      // Act / Assert
      expect(invoker).to.throw();
    });

    it('should throw an exception for position < 0', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => littleEndianByteArrayParser.readUint16(byteArray, -1);

      // Act / Assert
      expect(invoker).to.throw();
    });

  });

  describe('#readInt16', () => {

    it('should read a null terminated string', () => {
      // Arrange
      const byteArray = new Uint8Array(6);
      byteArray[0] = 0x3A;
      byteArray[1] = 0xC9;

      // Act
      const int16 = littleEndianByteArrayParser.readInt16(byteArray, 0);

      // Assert
      expect(int16).to.equal(-14022);
    });

    it('should throw an exception on buffer overread', () => {
      // Arrange
      const byteArray = new Uint8Array(6);
      const invoker = () => littleEndianByteArrayParser.readInt16(byteArray, 5);

      // Act / Assert
      expect(invoker).to.throw();
    });

    it('should throw an exception on position < 0', () => {
      // Arrange
      const byteArray = new Uint8Array(2);
      const invoker = () => littleEndianByteArrayParser.readInt16(byteArray, -1)

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
      const uint32 = littleEndianByteArrayParser.readUint32(byteArray, 0);

      // Assert
      expect(uint32).to.equal(0x44332211);
    });

    it('should return the expected value', () => {
      // Arrange
      const byteArray = new Uint8Array(4);
      byteArray[0] = 0xFF;
      byteArray[1] = 0xFF;
      byteArray[2] = 0xFF;
      byteArray[3] = 0xFF;

      // Act
      const uint32 = littleEndianByteArrayParser.readUint32(byteArray, 0);

      // Assert
      expect(uint32).to.equal(4294967295);
    });


    it('should throw an exception on buffer overread', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => littleEndianByteArrayParser.readUint32(byteArray, 30);

      // Act / Assert
      expect(invoker).to.throw();
    });

    it('should throw an exception on position < 0', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => littleEndianByteArrayParser.readUint32(byteArray, -1);

      // Act / Assert
      expect(invoker).to.throw();
    });

  });

  describe('#readInt32', () => {

    it('should read a null terminated string', () => {
      // Arrange
      const byteArray = new Uint8Array(6);
      byteArray[0] = 0xFF; // -1
      byteArray[1] = 0xFF

      // Act
      const int16 = littleEndianByteArrayParser.readInt16(byteArray, 0);

      // Assert
      expect(int16).to.equal(-1);
    });

    it('should read a null terminated string', () => {
      // Arrange
      const byteArray = new Uint8Array(6);
      byteArray[0] = 0xFF; // -1
      byteArray[1] = 0xFF
      byteArray[2] = 0xFF
      byteArray[3] = 0xFF

      // Act
      const int32 = littleEndianByteArrayParser.readInt32(byteArray, 0);

      // Assert
      expect(int32).to.equal(-1);
    });

    it('should throw an exception on buffer overread', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => littleEndianByteArrayParser.readInt32(byteArray, 29);

      // Act / Assert
      expect(invoker).to.throw();
    });

    it('should throw an exception for position < 0', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => littleEndianByteArrayParser.readInt32(byteArray, -1);

      // Act / Assert
      expect(invoker).to.throw();
    });

  });

  describe('#readFloat', () => {

    it('should return the first value', () => {
      // Arrange
      const byteArray = new Uint8Array(4);
      byteArray[0] = 0x00;
      byteArray[1] = 0x00;
      byteArray[2] = 0xB4;
      byteArray[3] = 0xC0;

      // Act
      const float = littleEndianByteArrayParser.readFloat(byteArray, 0);

      // Assert
      expect(float).to.equal(-5.625000);
    });

    it('should return the second value', () => {
      // Arrange
      const byteArray = new Uint8Array(8);
      byteArray[0] = 0x00;
      byteArray[1] = 0x00;
      byteArray[2] = 0xB4;
      byteArray[3] = 0xC0;
      byteArray[4] = 0x00;
      byteArray[5] = 0x00;
      byteArray[6] = 0xB4;
      byteArray[7] = 0xC1;

      // Act
      const float = littleEndianByteArrayParser.readFloat(byteArray, 4);

      // Assert
      expect(float).to.equal(-22.5);
    });

    it('should throw an exception on buffer overread', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => littleEndianByteArrayParser.readFloat(byteArray, 29);

      // Act / Asset
      expect(invoker).to.throw();
    });

    it('should throw an exception for position < 0', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => littleEndianByteArrayParser.readFloat(byteArray, -1);

      // Act / Asset
      expect(invoker).to.throw();
    });

  });

  describe('#readDouble', () => {

    it('should return the first value', () => {
      // Arrange
      const byteArray = new Uint8Array(8);
      byteArray[7] = 0x7f;
      byteArray[6] = 0xef;
      byteArray[5] = 0xff;
      byteArray[4] = 0xff;
      byteArray[3] = 0xff;
      byteArray[2] = 0xff;
      byteArray[1] = 0xff;
      byteArray[0] = 0xff;

      // Act
      const doubleValue = littleEndianByteArrayParser.readDouble(byteArray, 0);

      // Assert
      expect(doubleValue).to.equal(1.7976931348623157e+308);
    });

    it('readDouble works on second value', () => {
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
      byteArray[15] = 0xef;
      byteArray[14] = 0x7f;
      byteArray[13] = 0xff;
      byteArray[12] = 0xff;
      byteArray[11] = 0xff;
      byteArray[10] = 0xff;
      byteArray[9] = 0xff;
      byteArray[8] = 0xff;

      // Act
      const doubleValue = littleEndianByteArrayParser.readDouble(byteArray, 8);

      // Assert
      expect(doubleValue).to.equal(-1.2129047596099287e+229);
    });

    it('should throw an exception on buffer overread', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => littleEndianByteArrayParser.readDouble(byteArray, 25);

      // Act / Asset
      expect(invoker).to.throw();
    });

    it('should throw an exception for position < 0', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => littleEndianByteArrayParser.readDouble(byteArray, -1);

      // Act / Asset
      expect(invoker).to.throw();
    });

  });

});
