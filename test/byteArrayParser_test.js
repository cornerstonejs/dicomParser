import { expect } from 'chai';
import * as byteArrayParser from '../src/byteArrayParser';

describe('byteArrayParser', () => {

  describe('#readFixedString', () => {

    it('should read at end of buffer', () => {
      // Arrange
      const byteArray = new Uint8Array(5);
      const str = 'Hello';

      for (let i = 0; i < str.length; i++) {
        byteArray[i] = str.charCodeAt(i);
      }

      // Act
      const fixedString = byteArrayParser.readFixedString(byteArray, 0, 5);

      // Assert
      expect(fixedString).to.equal('Hello');
    });

    it('should read a null terminated string', () => {
      // Arrange
      const byteArray = new Uint8Array(10);
      const str = 'Hello';

      for (let i = 0; i < str.length; i++) {
        byteArray[i] = str.charCodeAt(i);
      }

      // Act
      const fixedString = byteArrayParser.readFixedString(byteArray, 0, 10);

      // Assert
      expect(fixedString).to.equal('Hello');
    });

  });

});
