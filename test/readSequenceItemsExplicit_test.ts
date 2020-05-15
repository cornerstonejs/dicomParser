import { expect } from 'chai';
import ByteStream from '../src/byteStream';
import littleEndianByteArrayParser from '../src/littleEndianByteArrayParser';
import readSequenceItemsExplicit from '../src/readSequenceElementExplicit';

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
