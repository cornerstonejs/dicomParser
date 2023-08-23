import { expect } from '@esm-bundle/chai';
import ByteStream from '../src/byteStream.js';
import readDicomElementImplicit from '../src/readDicomElementImplicit.js';
import littleEndianByteArrayParser from '../src/littleEndianByteArrayParser.js';

describe('readDicomElementImplicit', () => {

  function convertToByteArray(bytes) {
    const byteArray = new Uint8Array(bytes.length);
    let i = 0;

    bytes.forEach((byte) => { byteArray[i++] = byte; });

    return byteArray;
  }

  it('should return an element', () => {
    // Arrange
    const byteArray = new Uint8Array(8);

    byteArray[0] = 0x06;
    byteArray[1] = 0x30;
    byteArray[2] = 0xA6;
    byteArray[3] = 0x00;
    byteArray[4] = 0x00;
    byteArray[5] = 0x00;
    byteArray[6] = 0x00;
    byteArray[7] = 0x00;

    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementImplicit(byteStream);

    // Assert
    expect(element).to.be.ok;
  });

  it('should return the expected element and length (truncated element defined)', () => {
    // Arrange
    const byteArray = new Uint8Array(8);

    byteArray[0] = 0x06;
    byteArray[1] = 0x30;
    byteArray[2] = 0xA6;
    byteArray[3] = 0x00;
    byteArray[4] = 0x00;
    byteArray[5] = 0xFF;
    byteArray[6] = 0xFF;
    byteArray[7] = 0xFF;

    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementImplicit(byteStream);

    // Assert
    expect(element).to.be.ok;
    expect(byteStream.warnings.length).to.equal(1);
  });

  it('should return the expected element and length (truncated element undefined)', () => {
    // Arrange
    const byteArray = new Uint8Array(8);

    byteArray[0] = 0x06;
    byteArray[1] = 0x30;
    byteArray[2] = 0xA6;
    byteArray[3] = 0x00;
    byteArray[4] = 0xFF;
    byteArray[5] = 0xFF;
    byteArray[6] = 0xFF;
    byteArray[7] = 0xFF;

    const byteStream = new ByteStream(littleEndianByteArrayParser, byteArray);

    // Act
    const element = readDicomElementImplicit(byteStream);

    // Assert
    expect(element).to.be.ok;
    expect(byteStream.warnings.length).to.equal(1);
  });

  it('item tag successfully defines implicit SQ without callback (using peeking)', () => {
    // Arrange
    // (0008,0006)                              18
    const bytes = [0x08, 0x00, 0x06, 0x00, 0x12, 0x00, 0x00, 0x00,
      // (fffe,e000)                              10
      0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
      // (0008,0100)                               2   'A'
      0x08, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x41, 0x20,
    ];
    const byteStream = new ByteStream(littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act
    const element = readDicomElementImplicit(byteStream, undefined);

    // Assert
    const itemStart = element.items[0];
    const codeValue = itemStart.dataSet.elements['x00080100'];

    expect(element.items.length).to.equal(1);
    expect(itemStart.tag).to.equal('xfffee000');
    expect(codeValue).to.be.ok;
    expect(codeValue.length).to.equal(2);
    expect(codeValue.dataOffset).to.equal(24);
  });

  it('implicit zero-length sequence with undefined length parses successfully without callback (using peeking)', () => {
    // Arrange
    // (0008,0006)               (undefined length)
    const bytes = [0x08, 0x00, 0x06, 0x00, 0xFF, 0xFF, 0xFF, 0xFF,
      // (fffe,e0dd)                               0
      0xfe, 0xff, 0xdd, 0xe0, 0x00, 0x00, 0x00, 0x00,
      // (0008,0100)                               2   'A'
      0x08, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x41, 0x20,
    ];

    const byteStream = new ByteStream(littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act
    const element = readDicomElementImplicit(byteStream);

    // Assert
    expect(element.tag).to.equal('x00080006');
    expect(element.items).to.deep.equal([]);
  });

  it('bytes resembling an item tag look like an implicit SQ item when not using a callback', () => {
    // Arrange
    // (7fe0,0010)                               8
    const bytes = [0xe0, 0x7f, 0x10, 0x00, 0x08, 0x00, 0x00, 0x00,
      // Looks like an item tag, but isn't since it's within pixel data
      0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
    ];
    const byteStream = new ByteStream(littleEndianByteArrayParser, convertToByteArray(bytes));
    const invoker = () => readDicomElementImplicit(byteStream, undefined);

    // Act/Assert
    // invalid value for parameter 'maxPosition'
    expect(invoker).to.throw();
  });

  it('bytes resembling an item tag look like an implicit SQ item when using a callback that returns undefined', () => {
    // Arrange
    // (7fe0,0010)                               8
    const bytes = [0xe0, 0x7f, 0x10, 0x00, 0x08, 0x00, 0x00, 0x00,
      // Looks like an item tag, but isn't since it's within pixel data
      0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
    ];
    const callback = (tag) => {
      return undefined;
    };
    const byteStream = new ByteStream(littleEndianByteArrayParser, convertToByteArray(bytes));
    const invoker = () => readDicomElementImplicit(byteStream, undefined, callback);

    // Act/Assert
    // invalid value for parameter 'maxPosition'
    expect(invoker).to.throw();
  });

  it('bytes resembling an item tag are not treated like an SQ item when using a callback (callback overrides peeking)', () => {
    // Arrange
    // (7fe0,0010)                               8
    const bytes = [0xe0, 0x7f, 0x10, 0x00, 0x08, 0x00, 0x00, 0x00,
      // Looks like an item tag, but isn't since it's within pixel data
      0xfe, 0xff, 0x00, 0xe0, 0x0A, 0x00, 0x00, 0x00,
    ];
    const callback = (tag) => {
      return (tag === 'x7fe00010') ? 'OW' : undefined;
    };
    const byteStream = new ByteStream(littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act
    const element = readDicomElementImplicit(byteStream, undefined, callback);

    // Assert
    expect(element.tag).to.equal('x7fe00010');
    expect(element.items).to.equal(undefined);
    expect(element.vr).to.equal('OW');
    expect(element.length).to.equal(8);
  });

  it('bytes resembling an end-of-sequence tag look like an implicit SQ item when not using a callback', () => {
    // Arrange
    // (7fe0,0010)                                           11
    const bytes = [0xe0, 0x7f, 0x10, 0x00, 0x0B, 0x00, 0x00, 0x00,
      // Looks like a sequence delimiter tag, but isn't since it's within pixel data
      0xfe, 0xff, 0xdd, 0xe0, 0x0A, 0x00, 0x00, 0x00,
      0x12, 0x43, 0x98,
    ];
    const byteStream = new ByteStream(littleEndianByteArrayParser, convertToByteArray(bytes));
    const invoker = () => readDicomElementImplicit(byteStream, undefined);

    // Act/Assert
    // item tag (FFFE,E000) not found at offset 8
    expect(invoker).to.throw();
  });

  it('bytes resembling an end-of-sequence tag look like an implicit SQ item when using a callback that returns undefined', () => {
    // Arrange
    // (7fe0,0010)                                           11
    const bytes = [0xe0, 0x7f, 0x10, 0x00, 0x0B, 0x00, 0x00, 0x00,
      // Looks like a sequence delimiter tag, but isn't since it's within pixel data
      0xfe, 0xff, 0xdd, 0xe0, 0x0A, 0x00, 0x00, 0x00,
      0x12, 0x43, 0x98,
    ];
    const callback = (tag) => {
      return undefined;
    };
    const byteStream = new ByteStream(littleEndianByteArrayParser, convertToByteArray(bytes));
    const invoker = () => readDicomElementImplicit(byteStream, undefined, callback);

    // Act/Assert
    // item tag (FFFE,E000) not found at offset 8
    expect(invoker).to.throw();
  });

  it('bytes resembling an end-of-sequence tag are not treated like an SQ item when using a callback (callback overrides peeking)', () => {
    // Arrange
    // (7fe0,0010)                              11
    const bytes = [0xe0, 0x7f, 0x10, 0x00, 0x0B, 0x00, 0x00, 0x00,
      // Looks like a sequence delimiter tag, but isn't since it's within pixel data
      0xfe, 0xff, 0xdd, 0xe0, 0x0A, 0x00, 0x00, 0x00,
      0x12, 0x43, 0x98,
    ];
    const callback = (tag) => {
      return (tag === 'x7fe00010') ? 'OW' : undefined;
    };
    const byteStream = new ByteStream(littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act
    const element = readDicomElementImplicit(byteStream, undefined, callback);

    // Assert
    expect(element.tag).to.equal('x7fe00010');
    expect(element.items).to.equal(undefined);
    expect(element.vr).to.equal('OW');
    expect(element.length).to.equal(11);
  });

  it('private sequence with explicit length is skipped', () => {
    // Arrange
    // (0009,0006)                       length: 26
    const bytes = [0x09, 0x00, 0x06, 0x00, 0x1a, 0x00, 0x00, 0x00,
      // (fffe,e000)                     length: undefined
      0xfe, 0xff, 0x00, 0xe0, 0xff, 0xff, 0xff, 0xff,
      // (0008,0018)                      length: 2   'B'
      0x08, 0x00, 0x18, 0x00, 0x02, 0x00, 0x00, 0x00, 0x42, 0x20,
      // (fffe,e00d)                     length: 0
      0xfe, 0xff, 0x0d, 0xe0, 0x00, 0x00, 0x00, 0x00,
      // (0008,0100)                      length: 2   'A'
      0x08, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x41, 0x20,
    ];

    const byteStream = new ByteStream(littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act
    const element = readDicomElementImplicit(byteStream);

    // Assert
    expect(element.tag).to.equal('x00090006');
    expect(element.items).to.equal(undefined);
    expect(element.length).to.equal(26);

    // Read the next element
    const nextElement = readDicomElementImplicit(byteStream);
    expect(nextElement.tag).to.equal('x00080100');
    expect(nextElement.length).to.equal(2);
  });

  it('private sequence with implicit length is skipped', () => {
    // Arrange
    // (0009,0006)                       length: undefined
    const bytes = [0x09, 0x00, 0x06, 0x00, 0xff, 0xff, 0xff, 0xff,
      // (fffe,e000)                     length: undefined
      0xfe, 0xff, 0x00, 0xe0, 0xff, 0xff, 0xff, 0xff,
      // (0008,0018)                      length: 4   'ABC '
      0x08, 0x00, 0x18, 0x00, 0x04, 0x00, 0x00, 0x00, 0x41, 0x42, 0x43, 0x20,
      // (fffe,e00d)                     length: 0
      0xfe, 0xff, 0x0d, 0xe0, 0x00, 0x00, 0x00, 0x00,
      // (fffe,e0dd)                     length: 0
      0xfe, 0xff, 0xdd, 0xe0, 0x00, 0x00, 0x00, 0x00,
      // (0008,0100)                      length: 2   'A'
      0x08, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x41, 0x20,
    ];

    const byteStream = new ByteStream(littleEndianByteArrayParser, convertToByteArray(bytes));

    // Act
    const element = readDicomElementImplicit(byteStream);

    // Assert
    expect(element.tag).to.equal('x00090006');
    expect(element.items).to.equal(undefined);
    expect(element.length).to.equal(28);

    // Read the next element
    const nextElement = readDicomElementImplicit(byteStream);
    expect(nextElement.tag).to.equal('x00080100');
    expect(nextElement.length).to.equal(2);
  });


});
