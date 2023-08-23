import { expect } from '@esm-bundle/chai';
import ByteStream from '../src/byteStream.js';
import littleEndianByteArrayParser from '../src/littleEndianByteArrayParser.js';
import readSequenceItemsExplicit from '../src/readSequenceElementExplicit.js';

describe('readSequenceItemsExplicit', () => {

  it('should not crash because a malformed tag at end of stream', () => {
    // Arrange
    const bytes = new Uint8Array(1);
    const element = { length: 0xFFFFFFFF };
    const byteStream = new ByteStream(littleEndianByteArrayParser, bytes);
    const warnings = [];

    // Act
    readSequenceItemsExplicit(byteStream, element, warnings);

    // Assert
    expect(warnings.length).to.equal(1);
  });

});
