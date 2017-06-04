import readDicomElementExplicit from './readDicomElementExplicit';
import readDicomElementImplicit from './readDicomElementImplicit';

/**
 * Internal helper functions for parsing implicit and explicit DICOM data sets
 */

/**
 * Reads an explicit data set
 *
 * @param {DataSet} dataSet The dataset
 * @param byteStream the byte stream to read from
 * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
 */
export function parseDicomDataSetExplicit (dataSet, byteStream, maxPosition, options = {}) {
  maxPosition = (maxPosition === undefined) ? byteStream.byteArray.length : maxPosition;

  if (byteStream === undefined) {
    throw new Error('dicomParser.parseDicomDataSetExplicit: missing required parameter \'byteStream\'');
  }

  if (maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length) {
    throw new Error('dicomParser.parseDicomDataSetExplicit: invalid value for parameter \'maxP osition\'');
  }

  const elements = dataSet.elements;
  let untilTag;

  if (options && options.untilTag) {
    untilTag = options.untilTag;
  }

  while (byteStream.position < maxPosition) {
    const element = readDicomElementExplicit(byteStream, dataSet.warnings, untilTag);

    elements[element.tag] = element;
    if (element.tag === untilTag) {
      return;
    }
  }

  if (byteStream.position > maxPosition) {
    throw new Error('dicomParser:parseDicomDataSetExplicit: buffer overrun');
  }
}

/**
 * Reads an implicit data set
 *
 * @param {DataSet} dataSet The dataset
 * @param byteStream the byte stream to read from
 * @param maxPosition the maximum position to read up to (optional - only needed when reading sequence items)
 */
export function parseDicomDataSetImplicit (dataSet, byteStream, maxPosition, options = {}) {
  maxPosition = (maxPosition === undefined) ? dataSet.byteArray.length : maxPosition;

  if (byteStream === undefined) {
    throw new Error('dicomParser.parseDicomDataSetImplicit: missing required parameter \'byteStream\'');
  }

  if (maxPosition < byteStream.position || maxPosition > byteStream.byteArray.length) {
    throw new Error('dicomParser.parseDicomDataSetImplicit: invalid value for parameter \'maxPosition\'');
  }

  const elements = dataSet.elements;
  let untilTag;

  if (options && options.untilTag) {
    untilTag = options.untilTag;
  }

  while (byteStream.position < maxPosition) {
    const element = readDicomElementImplicit(byteStream, untilTag, options.vrCallback);

    elements[element.tag] = element;
    if (element.tag === untilTag) {
      return;
    }
  }
}
