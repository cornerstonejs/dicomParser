import { expect } from 'chai';
import ByteStream from '../src/byteStream'
import DataSet from '../src/dataSet';
import littleEndianByteArrayParser from '../src/littleEndianByteArrayParser';
import bigEndianByteArrayParser from '../src/bigEndianByteArrayParser';
import * as dicomDataSetParsers from '../src/parseDicomDataSet';

describe('DataSet', () => {

  function getElements() {
    return [
      // x22114433             US          4           0xadde 0x1234
      [0x11, 0x22, 0x33, 0x44, 0x55, 0x53, 0x04, 0x00, 0xde, 0xad, 0x34, 0x12],
      // x22114434             OB          4                                   'O\B'
      [0x11, 0x22, 0x34, 0x44, 0x4F, 0x42, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x4F, 0x5C, 0x42, 0x00],
      // x22114435             DS                      10                      ' 1.2\2.3  '
      [0x11, 0x22, 0x35, 0x44, 0x4F, 0x42, 0x00, 0x00, 0x0A, 0x00, 0x00, 0x00, 0x20, 0x31, 0x2E, 0x32, 0x5C, 0x32, 0x2E, 0x33, 0x20, 0x20],
      // x22114436             IS          4          '1234'
      [0x11, 0x22, 0x36, 0x44, 0x49, 0x53, 0x04, 0x00, 0x31, 0x32, 0x33, 0x34],
      // x22114437             DA          8          '20140329'
      [0x11, 0x22, 0x37, 0x44, 0x49, 0x53, 0x08, 0x00, 0x32, 0x30, 0x31, 0x34, 0x30, 0x33, 0x32, 0x39],
      // x22114438             TM          14         '081236.531000'
      [0x11, 0x22, 0x38, 0x44, 0x49, 0x53, 0x0E, 0x00, 0x30, 0x38, 0x31, 0x32, 0x33, 0x36, 0x2E, 0x35, 0x33, 0x31, 0x30, 0x30, 0x30, 0x20],
      // x22114439             PN          10         'F^G^M^P^S'
      [0x11, 0x22, 0x39, 0x44, 0x50, 0x4E, 0x0A, 0x00, 0x46, 0x5E, 0x47, 0x5E, 0x4D, 0x5E, 0x50, 0x5E, 0x53, 0x20],
      // x2211443a             ST          4          ' S  '
      [0x11, 0x22, 0x3A, 0x44, 0x50, 0x4E, 0x04, 0x00, 0x20, 0x53, 0x20, 0x20],
      // x2211443b             SL          8           -90745933, 28035055
      [0x11, 0x22, 0x3B, 0x44, 0x50, 0x4E, 0x08, 0x00, 0xB3, 0x53, 0x97, 0xFA, 0xEF, 0xC7, 0xAB, 0x01],
      // x2211443c             FL          8           -73.00198, 17.157354
      [0x11, 0x22, 0x3C, 0x44, 0x50, 0x4E, 0x08, 0x00, 0x04, 0x01, 0x92, 0xC2, 0x41, 0x89, 0x42, 0x43],
      // x2211443d             FD          16          -8.8802474352597842181962204226E41, 4.25797335756869935070373891492E81
      [0x11, 0x22, 0x3D, 0x44, 0x50, 0x4E, 0x10, 0x00, 0xED, 0x91, 0xFB, 0x20, 0x57, 0x63, 0xA4, 0xC8, 0x3D, 0xAC, 0x78, 0x6B, 0x92, 0xF4, 0xE1, 0x50],
      // x2211443e             AT          4           (0018,1065)
      [0x11, 0x22, 0x3E, 0x44, 0x41, 0x54, 0x04, 0x00, 0x18, 0x00, 0x65, 0x10]
    ];
  }

  function getBigEndianElements() {
    return [
      // x22114433             US          4           0xadde 0x1234
      [0x22, 0x11, 0x44, 0x33, 0x55, 0x53, 0x00, 0x04, 0xAD, 0xDE, 0x12, 0x34],
      // x2211443b             SL          8           -90745933, 28035055
      [0x22, 0x11, 0x44, 0x3B, 0x50, 0x4E, 0x00, 0x08, 0xFA, 0x97, 0x53, 0xB3, 0x01, 0xAB, 0xC7, 0xEF],
      // x2211443c             FL          8           -73.00198, 17.157354
      [0x22, 0x11, 0x44, 0x3C, 0x50, 0x4E, 0x00, 0x08, 0xC2, 0x92, 0x01, 0x04, 0x43, 0x42, 0x89, 0x41],
      // x2211443d             FD          16          -8.8802474352597842181962204226E41, 4.25797335756869935070373891492E81
      [0x22, 0x11, 0x44, 0x3D, 0x50, 0x4E, 0x00, 0x10, 0xC8, 0xA4, 0x63, 0x57, 0x20, 0xFB, 0x91, 0xED, 0x50, 0xE1, 0xF4, 0x92, 0x6B, 0x78, 0xAC, 0x3D],
      // x2211443e             AT          4           (0018,1063)
      [0x22, 0x11, 0x44, 0x3E, 0x41, 0x54, 0x00, 0x04, 0x00, 0x18, 0x10, 0x63]
    ];
  }

  function convertElementsToByteArray(elements) {
    let arrayLength = 0;

    elements.forEach(function(element) {
      arrayLength += element.length;
    });

    const byteArray = new Uint8Array(arrayLength);
    let index = 0;

    elements.forEach(function(element) {
      for (let i = 0; i < element.length; i++) {
        byteArray[index++] = element[i];
      }
    });

    return byteArray;
  }

  function makeTestData() {
    return convertElementsToByteArray(getElements());
  }

  function makeBigEndianTestData() {
    return convertElementsToByteArray(getBigEndianElements());
  }

  describe('#uint16', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint16 = dataSet.uint16('x22114433');

      // Assert
      expect(uint16).to.equal(0xadde);
    });

    it('should return the expected value for a given index', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint16 = dataSet.uint16('x22114433', 1);

      // Assert
      expect(uint16).to.equal(0x1234);
    });

    it('should return the expected value for a given index big endian', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint16 = dataSet.uint16('x22114433', 1);

      // Assert
      expect(uint16).to.equal(0x1234);
    });

    it('should return the expected value for a given index big endian element', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const elements = {x22114433: {dataOffset: 8, parser: bigEndianByteArrayParser}};
      const dataSet = new DataSet(littleEndianByteArrayParser, byteArray, elements);

      // Act
      const uint16 = dataSet.uint16('x22114433', 1);

      // Assert
      expect(uint16).to.equal(0x1234);
    });

    it('should not return any value for a nonexistent tag', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint16 = dataSet.uint16('x12345678');

      // Assert
      expect(uint16).to.be.undefined;
    });

  });

  describe('#int16', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const int16 = dataSet.int16('x22114433');

      // Assert
      expect(int16).to.equal(-21026);
    });

    it('should return the expected value whe passing a index', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const int16 = dataSet.int16('x22114433', 1);

      // Assert
      expect(int16).to.equal(4660);
    });

    it('should return the expected value for a given index big endian', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const int16 = dataSet.int16('x22114433', 1);

      // Assert
      expect(int16).to.equal(4660);
    });

    it('should return the expected value for a given index big endian element', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const elements = { x22114433: { dataOffset: 8, parser: bigEndianByteArrayParser } };
      const dataSet = new DataSet(littleEndianByteArrayParser, byteArray, elements);

      // Act
      const int16 = dataSet.int16('x22114433', 1);

      // Assert
      expect(int16).to.equal(4660);
    });

    it('should not return any value for a nonexistent tag', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const int16 = dataSet.int16('x12345678');

      // Assert
      expect(int16).to.be.undefined;
    });

  });

  describe('#uint32', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint32 = dataSet.uint32('x2211443b');

      // Assert
      expect(uint32).to.equal(4204221363);
    });

    it('should retuen the expected value for a given index', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint32 = dataSet.uint32('x2211443b', 1);

      // Assert
      expect(uint32).to.equal(28035055);
    });

    it('should return the expected value for a given index big endian element', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const elements = {x2211443b: {dataOffset: 20, parser: bigEndianByteArrayParser}};
      const dataSet = new DataSet(littleEndianByteArrayParser, byteArray, elements);

      // Act
      const uint32 = dataSet.uint32('x2211443b', 1);

      // Assert
      expect(uint32).to.equal(28035055);
    });

    it('should return the expected value for a given index big endian', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint32 = dataSet.uint32('x2211443b', 1);

      // Assert
      expect(uint32).to.equal(28035055);
    });

    it('should not return any value for a nonexistent tag', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint16 = dataSet.uint32('x12345678');

      // Assert
      expect(uint16).to.be.undefined;
    });

  });

  describe('#int32', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const int32 = dataSet.int32('x2211443b');

      // Assert
      expect(int32).to.equal(-90745933);
    });

    it('should return the expected value for a given index', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const int32 = dataSet.int32('x2211443b', 1);

      // Assert
      expect(int32).to.equal(28035055);
    });

    it('should return the expected value for a given index big endian', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const int32 = dataSet.int32('x2211443b', 1);

      // Assert
      expect(int32).to.equal(28035055);
    });

    it('should return the expected value for a given index big endian element', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const elements = {x2211443b: {dataOffset: 20, parser: bigEndianByteArrayParser}};
      const dataSet = new DataSet(littleEndianByteArrayParser, byteArray, elements);

      // Act
      const int32 = dataSet.int32('x2211443b', 1);

      // Assert
      expect(int32).to.equal(28035055);
    });

    it('should not return any value for a nonexistent tag', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint16 = dataSet.int32('x12345678');

      // Assert
      expect(uint16).to.be.undefined;
    });

  });

  describe('#float', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const float = dataSet.float('x2211443c');

      // Assert
      expect(float).to.equal(-73.00198364257812);
    });

    it('should return the expected value for a given index', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const float = dataSet.float('x2211443c', 1);

      // Assert
      expect(float).to.equal(194.53614807128906);
    });

    it('should return the expected value for a given index big endian', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const float = dataSet.float('x2211443c', 1);

      // Assert
      expect(float).to.equal(194.53614807128906);
    });

    it('should return the expected value for a given index big endian element', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const elements = {x2211443c: {dataOffset: 36, parser: bigEndianByteArrayParser}};
      const dataSet = new DataSet(littleEndianByteArrayParser, byteArray, elements);

      // Act
      const float = dataSet.float('x2211443c', 1);

      // Assert
      expect(float).to.equal(194.53614807128906);
    });

    it('should not return any value for a nonexistent tag', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint16 = dataSet.float('x12345678');

      // Assert
      expect(uint16).to.be.undefined;
    });

  });

  describe('#double', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const double = dataSet.double('x2211443d');

      // Assert
      expect(double).to.equal(-8.8802474352597842181962204226E41);
    });

    it('should return the expected value for a given index', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const double = dataSet.double('x2211443d', 1);

      // Assert
      expect(double).to.equal(4.25797335756869935070373891492E81);
    });

    it('should return the expected value for a given index big endian', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const double = dataSet.double('x2211443d', 1);

      // Assert
      expect(double).to.equal(4.25797335756869935070373891492E81);
    });

    it('should return the expected value for a given index big endian element', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const elements = {x2211443d: {dataOffset: 52, parser: bigEndianByteArrayParser}};
      const dataSet = new DataSet(littleEndianByteArrayParser, byteArray, elements);

      // Act
      const double = dataSet.double('x2211443d', 1);

      // Assert
      expect(double).to.equal(4.25797335756869935070373891492E81);
    });

    it('should not return any value for a nonexistent tag', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const uint16 = dataSet.double('x12345678');

      // Assert
      expect(uint16).to.be.undefined;
    });

  });

  describe('#numStringValues', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const numStringValues = dataSet.numStringValues('x22114434');

      // Assert
      expect(numStringValues).to.equal(2);
    });

  });

  describe('#string', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const str = dataSet.string('x2211443a');

      // Assert
      expect(str).to.equal('S');
    });

    it('should return the expected value for a given index', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const str = dataSet.string('x22114434', 1);

      // Assert
      expect(str).to.equal('B');
    });

  });

  describe('#text', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const text = dataSet.text('x2211443a');

      // Assert
      expect(text).to.equal(' S');
    });

  });

  describe('#floatString', () => {

    it('should return the exptected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const float = dataSet.floatString('x22114435');

      // Assert
      expect(float).to.equal(1.2);
    });

    it('should return the expected value for a given index', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const float = dataSet.floatString('x22114435', 0);

      // Assert
      expect(float).to.equal(1.2);
    });

  });

  describe('#intString', () => {

    it('should return the expected value', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const val = dataSet.intString('x22114436');

      // Assert
      expect(val).to.equal(1234);
    });

  });

  describe('#attributeTag', () => {

    it('should return the expected value (LE)', () => {
      // Arrange
      const byteArray = makeTestData();
      const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});
      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const attributeTag = dataSet.attributeTag('x2211443e');

      // Assert
      expect(attributeTag).to.equal('x00181065');
    });

    it('should return the expected value (BE)', () => {
      // Arrange
      const byteArray = makeBigEndianTestData();
      const byteStream = new ByteStream(bigEndianByteArrayParser, byteArray);
      const dataSet = new DataSet(byteStream.byteArrayParser, byteArray, {});

      dicomDataSetParsers.parseDicomDataSetExplicit(dataSet, byteStream);

      // Act
      const attributeTag = dataSet.attributeTag('x2211443e');

      // Assert
      expect(attributeTag).to.equal('x00181063');
    });

  });

});
