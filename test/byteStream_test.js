import { expect } from 'chai';
import ByteStream from '../src/byteStream';
import littleEndianByteArrayParser from '../src/littleEndianByteArrayParser';
import bigEndianByteArrayParser from '../src/bigEndianByteArrayParser';

describe('ByteStream', () => {

  describe('#constructor', () => {

    it('should return a valid object', () => {
      // Arrange
      const byteArray = new Uint8Array(32);

      // Act
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Assert
      expect(byteStream).to.not.be.undefined;
    });

    it('should be at position 0 on creation', () => {
      // Arrange
      const byteArray = new Uint8Array(32);

      // Act
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);

      // Assert
      expect(byteStream.position).to.equal(0);
    });

    it('should be at position 10 on creation', () => {
      // Arrange
      const byteArray = new Uint8Array(32);

      // Act
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray, 10);

      // Assert
      expect(byteStream.position).to.equal(10);
    });

    it('should throw an exception when missing byte stream parser', () => {
      // Arrange
      const invoker = () => new ByteStream();

      expect(invoker).to.throw();
    });

    it('should throw an exception when missing byte array', () => {
      // Arrange
      const invoker = () => new ByteStream(bigEndianByteArrayParser);

      // Act / Assert
      expect(invoker).to.throw();
    });

    it('should throw an exception if byteArray parameter is not Uint8Array', () => {
      // Arrange
      const uint16Array = new Uint16Array(32);
      const invoker = () => new ByteStream(littleEndianByteArrayParser, uint16Array);

      // Act / Assert
      expect(invoker).to.throw();
    });


    it('should throw an exception for position < 0', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => new ByteStream(littleEndianByteArrayParser, byteArray, -1);

      // Act / Assert
      expect(invoker).to.throw();
    });

    it('should throw an exception for position greater than or equal to array length', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const invoker = () => new ByteStream(littleEndianByteArrayParser, byteArray, 32);

      // Act / Assert
      expect(invoker).to.throw();
    });

  });

  describe('#seek', () => {
    let byteArray;
    let byteStream;

    beforeEach(() => {
      // Arrange
      byteArray = new Uint8Array(32);
      byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
    });

    it('should be at the right position after seek', () => {
      // Act
      byteStream.seek(10);

      // Assert
      expect(byteStream.position).to.equal(10);
    });

    it('should throw an exception for negative positions', () => {
      const invoker = () => byteStream.seek(-1);

      // Act / Assert
      expect(invoker).to.throw();
    });

  });

  describe('#readByteStream', () => {

    it('should return an object', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const subByteStream = byteStream.readByteStream(5);

      // Assert
      expect(subByteStream).to.be.ok;
    });

    it('should returns an object with same parser', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);

      // Act
      const subByteStream = byteStream.readByteStream(5);

      // Assert
      expect(subByteStream.byteArrayParser).to.equal(bigEndianByteArrayParser);
    });

    it('should return an array with size matching numBytes parameter', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const subByteStream = byteStream.readByteStream(5);

      // Assert
      expect(subByteStream.byteArray.length).to.equal(5);
    });

    it('should returns an object at position 0', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const subByteStream = byteStream.readByteStream(5);

      // Assert
      expect(subByteStream.position).to.equal(0);
    });

    it('should read all remaining bytes', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const subByteStream = byteStream.readByteStream(32);

      // Assert
      expect(subByteStream).to.be.ok;
    });

    it('should throw and exception on buffer overread', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const invoker = () => byteStream.readByteStream(40);

      expect(invoker).to.throw();
    });

  });

  describe('#readUint16', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      byteArray[0] = 0xff;
      byteArray[1] = 0x80;
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const uint16 = byteStream.readUint16();

      // Assert
      expect(uint16).to.equal(0x80ff);
    });

    it('should work with different parser', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      byteArray[0] = 0x80;
      byteArray[1] = 0xff;
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);

      // Act
      const uint16 = byteStream.readUint16();

      // Assert
      expect(uint16).to.equal(0x80ff);
    });

    it('should read at end of buffer', () => {
      // Arrange
      const byteArray = new Uint8Array(2);
      byteArray[0] = 0xff;
      byteArray[1] = 0x80;
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const uint16 = byteStream.readUint16();

      // Assert
      expect(uint16).to.equal(0x80ff);
    });


    it('should throw an exception on buffer overread', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const invoker = () => byteStream.readUint16()

      byteStream.seek(31);

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
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const uint32 = byteStream.readUint32();

      // Assert
      expect(uint32).to.equal(0x44332211);
    });

    it('should work with different parser', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      byteArray[0] = 0x44;
      byteArray[1] = 0x33;
      byteArray[2] = 0x22;
      byteArray[3] = 0x11;
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);

      // Act
      const uint32 = byteStream.readUint32();

      // Assert
      expect(uint32).to.equal(0x44332211);
    });

    it('should read at end of buffer', () => {
      // Arrange
      const byteArray = new Uint8Array(4);
      byteArray[0] = 0x11;
      byteArray[1] = 0x22;
      byteArray[2] = 0x33;
      byteArray[3] = 0x44;
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const uint32 = byteStream.readUint32();

      // Assert
      expect(uint32).to.equal(0x44332211);
    });


    it('should throw an exception on buffer overread', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const invoker = () => byteStream.readUint32();

      byteStream.seek(31);

      // Act / Assert
      expect(invoker).to.throw();
    });

  });

  describe('#readFixedString', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const str = 'Hello';
      
      for (let i = 0; i < str.length; i++) {
          byteArray[i] = str.charCodeAt(i);
      }

      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const fixedString = byteStream.readFixedString(5);

      // Assert
      expect(fixedString).to.equal('Hello');
    });

    it('should throw an exception on buffer overread', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const invoker = () => byteStream.readFixedString(33);

      // Act / Assert
      expect(invoker).to.throw();
    });

    it('should throw an exception on negative length', () => {
      // Arrange
      const byteArray = new Uint8Array(32);
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const invoker = () => byteStream.readFixedString(-1);

      // Act / Assert
      expect(invoker).to.throw();
    });

    it('should read at end of buffer', () => {
      // Arrange
      const byteArray = new Uint8Array(5);
      const str = 'Hello';
      
      for (let i = 0; i < str.length; i++) {
          byteArray[i] = str.charCodeAt(i);
      }

      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const fixedString = byteStream.readFixedString(5);

      // Assert
      expect(fixedString).to.equal('Hello');
    });

    it('should read null terminated string', () => {
      // Arrange
      const byteArray = new Uint8Array(6);
      const str = 'Hello';

      for (let i = 0; i < str.length; i++) {
          byteArray[i] = str.charCodeAt(i);
      }

      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const fixedString = byteStream.readFixedString(6);

      // Assert
      expect(fixedString).to.equal('Hello');
    });

    it('should set position properly after reading a null terminated string', () => {
      // Arrange
      const byteArray = new Uint8Array(6);
      const str = 'Hello';

      for (let i = 0; i < str.length; i++) {
          byteArray[i] = str.charCodeAt(i);
      }

      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

      // Act
      const fixedString = byteStream.readFixedString(6);

      // Assert
      expect(byteStream.position).to.equal(6);
    });

  });

});
