import alloc from './alloc.js';
import bigEndianByteArrayParser from './bigEndianByteArrayParser.js';
import ByteStream from './byteStream.js';
import DataSet from './dataSet.js';
import littleEndianByteArrayParser from './littleEndianByteArrayParser.js';
import readPart10Header from './readPart10Header.js';
import sharedCopy from './sharedCopy.js';
import * as byteArrayParser from './byteArrayParser.js';
import * as parseDicomDataSet from './parseDicomDataSet.js';

// LEE (Little Endian Explicit) is the transfer syntax used in dimse operations when there is a split
// between the header and data.
const LEE = '1.2.840.10008.1.2.1';

// LEI (Little Endian Implicit) is the transfer syntax in raw files
const LEI = '1.2.840.10008.1.2';

// BEI (Big Endian Implicit) is deprecated, but needs special parse handling
const BEI = '1.2.840.10008.1.2.2';

/**
 * Parses a DICOM P10 byte array and returns a DataSet object with the parsed elements.
 * If the options argument is supplied and it contains the untilTag property, parsing
 * will stop once that tag is encoutered.  This can be used to parse partial byte streams.
 *
 * @param byteArray the byte array
 * @param options object to control parsing behavior (optional)
 * @returns {DataSet}
 * @throws error if an error occurs while parsing.  The exception object will contain a
 *         property dataSet with the elements successfully parsed before the error.
 */

export default function parseDicom(byteArray, options = {}) {
  if (byteArray === undefined) {
    throw new Error('dicomParser.parseDicom: missing required parameter \'byteArray\'');
  }

  
  const readTransferSyntax = (metaHeaderDataSet) => {
    if (metaHeaderDataSet.elements.x00020010 === undefined) {
      throw new Error('dicomParser.parseDicom: missing required meta header attribute 0002,0010');
    }

    const transferSyntaxElement = metaHeaderDataSet.elements.x00020010;
    return transferSyntaxElement && transferSyntaxElement.Value ||
      byteArrayParser.readFixedString(byteArray, transferSyntaxElement.dataOffset, transferSyntaxElement.length);
  }

  function isExplicit(transferSyntax) {
    // implicit little endian
    if (transferSyntax === '1.2.840.10008.1.2') {
      return false;
    }

    // all other transfer syntaxes should be explicit
    return true;
  }

  function getDataSetByteStream(transferSyntax, position) {
    // Detect whether we are inside a browser or Node.js
    const isNode = (Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]');

    if (transferSyntax === '1.2.840.10008.1.2.1.99') {
      // if an infalter callback is registered, use it
      if (options && options.inflater) {
        const fullByteArrayCallback = options.inflater(byteArray, position);

        return new ByteStream(littleEndianByteArrayParser, fullByteArrayCallback, 0);
      }
      // if running on node, use the zlib library to inflate
      // http://stackoverflow.com/questions/4224606/how-to-check-whether-a-script-is-running-under-node-js
      else if (isNode === true) {
        // inflate it
        const zlib = require('zlib');
        const deflatedBuffer = sharedCopy(byteArray, position, byteArray.length - position);
        const inflatedBuffer = zlib.inflateRawSync(deflatedBuffer);

        // create a single byte array with the full header bytes and the inflated bytes
        const fullByteArrayBuffer = alloc(byteArray, inflatedBuffer.length + position);

        byteArray.copy(fullByteArrayBuffer, 0, 0, position);
        inflatedBuffer.copy(fullByteArrayBuffer, position);

        return new ByteStream(littleEndianByteArrayParser, fullByteArrayBuffer, 0);
      }
      // if pako is defined - use it.  This is the web browser path
      // https://github.com/nodeca/pako
      else if (typeof pako !== 'undefined') {
        // inflate it
        const deflated = byteArray.slice(position);
        const inflated = pako.inflateRaw(deflated);

        // create a single byte array with the full header bytes and the inflated bytes
        const fullByteArray = alloc(byteArray, inflated.length + position);

        fullByteArray.set(byteArray.slice(0, position), 0);
        fullByteArray.set(inflated, position);

        return new ByteStream(littleEndianByteArrayParser, fullByteArray, 0);
      }

      // throw exception since no inflater is available
      throw 'dicomParser.parseDicom: no inflater available to handle deflate transfer syntax';
    }

    // explicit big endian
    if (transferSyntax === BEI) {
      return new ByteStream(bigEndianByteArrayParser, byteArray, position);
    }

    // all other transfer syntaxes are little endian; only the pixel encoding differs
    // make a new stream so the metaheader warnings don't come along for the ride
    return new ByteStream(littleEndianByteArrayParser, byteArray, position);
  }

  function mergeDataSets(metaHeaderDataSet, instanceDataSet) {
    for (const propertyName in metaHeaderDataSet.elements) {
      if (metaHeaderDataSet.elements.hasOwnProperty(propertyName)) {
        instanceDataSet.elements[propertyName] = metaHeaderDataSet.elements[propertyName];
      }
    }

    if (metaHeaderDataSet.warnings !== undefined) {
      instanceDataSet.warnings = metaHeaderDataSet.warnings.concat(instanceDataSet.warnings);
    }

    return instanceDataSet;
  }

  function readDataSet(metaHeaderDataSet) {
    const transferSyntax = readTransferSyntax(metaHeaderDataSet);
    const explicit = isExplicit(transferSyntax);
    const dataSetByteStream = getDataSetByteStream(transferSyntax, metaHeaderDataSet.position);

    const elements = {};
    const dataSet = new DataSet(dataSetByteStream.byteArrayParser, dataSetByteStream.byteArray, elements);

    dataSet.warnings = dataSetByteStream.warnings;

    try {
      if (explicit) {
        parseDicomDataSet.parseDicomDataSetExplicit(dataSet, dataSetByteStream, dataSetByteStream.byteArray.length, options);
      } else {
        parseDicomDataSet.parseDicomDataSetImplicit(dataSet, dataSetByteStream, dataSetByteStream.byteArray.length, options);
      }
    } catch (e) {
      const ex = {
        exception: e,
        dataSet
      };

      throw ex;
    }

    return dataSet;
  }

  // main function here
  function parseTheByteStream() {
    const metaHeaderDataSet = readPart10Header(byteArray, options);

    try {
      const dataSet = readDataSet(metaHeaderDataSet);
      return mergeDataSets(metaHeaderDataSet, dataSet);
    } catch (e) {
      // If an exception is thrown when parsing main dataset (i.e. truncated
      // byte array), go ahead and include everything parsed so far in the exception.
      if (e.dataSet) {
        e.dataSet = mergeDataSets(metaHeaderDataSet, e.dataSet);
      }
      throw e;
    }
  }
  
  // This is where we actually start parsing
  return parseTheByteStream();
}

export { LEI, LEE, BEI };