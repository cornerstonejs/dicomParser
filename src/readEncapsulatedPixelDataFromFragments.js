/**
 * Functionality for extracting encapsulated pixel data
 */

var dicomParser = (function (dicomParser)
{
  "use strict";

  if(dicomParser === undefined)
  {
    dicomParser = {};
  }

  function calculateBufferSize(fragments, startFragment, numFragments) {
    var bufferSize = 0;
    for(var i=startFragment; i < startFragment + numFragments; i++) {
      bufferSize += fragments[i].length;
    }
    return bufferSize;
  }

  /**
   * Returns the encapsulated pixel data from the specified fragments.  Use this function when you know
   * the fragments you want to extract data from.  See
   *
   * @param dataSet - the dataSet containing the encapsulated pixel data
   * @param pixelDataElement - the pixel data element (x7fe00010) to extract the fragment data from
   * @param startFragmentIndex - zero based index of the first fragment to extract from
   * @param [numFragments] - the number of fragments to extract from, default is 1
   * @param [fragments] - optional array of objects describing each fragment (offset, position, length)
   * @returns {object} byte array with the encapsulated pixel data
   */
  dicomParser.readEncapsulatedPixelDataFromFragments = function(dataSet, pixelDataElement, startFragmentIndex, numFragments, fragments)
  {
    // default values
    numFragments = numFragments || 1;
    fragments = fragments || pixelDataElement.fragments;

    // check parameters
    if(dataSet === undefined) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: missing required parameter 'dataSet'";
    }
    if(pixelDataElement === undefined) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: missing required parameter 'pixelDataElement'";
    }
    if(startFragmentIndex === undefined) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: missing required parameter 'startFragmentIndex'";
    }
    if(numFragments === undefined) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: missing required parameter 'numFragments'";
    }
    if(pixelDataElement.tag !== 'x7fe00010') {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to non pixel data tag (expected tag = x7fe00010'";
    }
    if(pixelDataElement.encapsulatedPixelData !== true) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data";
    }
    if(pixelDataElement.hadUndefinedLength !== true) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data";
    }
    if(pixelDataElement.basicOffsetTable === undefined) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data";
    }
    if(pixelDataElement.fragments === undefined) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data";
    }
    if(pixelDataElement.fragments.length <= 0) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data";
    }
    if(startFragmentIndex < 0) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'startFragmentIndex' must be >= 0";
    }
    if(startFragmentIndex >= pixelDataElement.fragments.length) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'startFragmentIndex' must be < number of fragments";
    }
    if(numFragments < 1) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'numFragments' must be > 0";
    }
    if(startFragmentIndex + numFragments > pixelDataElement.fragments.length) {
      throw "dicomParser.readEncapsulatedPixelDataFromFragments: parameter 'startFragment' + 'numFragments' < number of fragments";
    }

    // create byte stream on the data for this pixel data element
    var byteStream = new dicomParser.ByteStream(dataSet.byteArrayParser, dataSet.byteArray, pixelDataElement.dataOffset);

    // seek past the basic offset table (no need to parse it again since we already have)
    var basicOffsetTable = dicomParser.readSequenceItem(byteStream);
    if(basicOffsetTable.tag !== 'xfffee000')
    {
      throw "dicomParser.readEncapsulatedPixelData: missing basic offset table xfffee000";
    }
    byteStream.seek(basicOffsetTable.length);

    var fragmentZeroPosition = byteStream.position;
    var fragmentHeaderSize = 8; // tag + length

    // if there is only one fragment, return a view on this array to avoid copying
    if(numFragments === 1) {
      return dicomParser.sharedCopy(byteStream.byteArray, fragmentZeroPosition + fragments[startFragmentIndex].offset + fragmentHeaderSize, fragments[startFragmentIndex].length);
    }

    // more than one fragment, combine all of the fragments into one buffer
    var bufferSize = calculateBufferSize(fragments, startFragmentIndex, numFragments);

    var pixelData = dicomParser.alloc(byteStream.byteArray, bufferSize);

    var pixelDataIndex = 0;
    for(var i=startFragmentIndex; i < startFragmentIndex + numFragments; i++) {
      var fragmentOffset = fragmentZeroPosition + fragments[i].offset + fragmentHeaderSize;
      for(var j=0; j < fragments[i].length; j++) {
        pixelData[pixelDataIndex++] = byteStream.byteArray[fragmentOffset++];
      }
    }

    return pixelData;
  };

  return dicomParser;
}(dicomParser));
