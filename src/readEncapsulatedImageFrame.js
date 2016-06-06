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

  function findFragmentIndexWithOffset(fragments, offset) {
    for(var i=0; i < fragments.length; i++) {
      if(fragments[i].offset === offset) {
        return i;
      }
    }
  }

  function calculateNumberOfFragments(dataSet, pixelDataElement, frame, basicOffsetTable, fragments, startFragment) {
    // special case for last frame
    if(frame === basicOffsetTable.length -1) {
      return fragments.length - startFragment;
    }

    // iterate through each fragment looking for the one matching the offset for the next frame
    var nextFrameOffset = basicOffsetTable[frame + 1];
    for(var i=startFragment + 1; i < fragments.length; i++) {
      if(fragments[i].offset === nextFrameOffset) {
        return i - startFragment;
      }
    }
    throw "dicomParser.calculateNumberOfFragments: could not find fragment with offset matching basic offset table";
  }

  /**
   * Returns the pixel data for the specified frame in an encapsulated pixel data element that has a non
   * empty basic offset table.  Note that this function will fail if the basic offset table is empty - in that
   * case you need to determine which fragments map to which frames and read them using
   * readEncapsulatedPixelDataFromFragments().  Also see the function createJEPGBasicOffsetTable() to see
   * how a basic offset table can be created for JPEG images
   *
   * @param dataSet - the dataSet containing the encapsulated pixel data
   * @param pixelDataElement - the pixel data element (x7fe00010) to extract the frame from
   * @param frame - the zero based frame index
   * @param [basicOffsetTable] - optional array of starting offsets for frames
   * @param [fragments] - optional array of objects describing each fragment (offset, position, length)
   * @returns {object} with the encapsulated pixel data
   */
  dicomParser.readEncapsulatedImageFrame = function(dataSet, pixelDataElement, frame, basicOffsetTable, fragments)
  {
    // default parameters
    basicOffsetTable = basicOffsetTable || pixelDataElement.basicOffsetTable;
    fragments = pixelDataElement.fragments;

    // Validate parameters
    if(dataSet === undefined) {
      throw "dicomParser.readEncapsulatedImageFrame: missing required parameter 'dataSet'";
    }
    if(pixelDataElement === undefined) {
      throw "dicomParser.readEncapsulatedImageFrame: missing required parameter 'pixelDataElement'";
    }
    if(frame === undefined) {
      throw "dicomParser.readEncapsulatedImageFrame: missing required parameter 'frame'";
    }
    if(basicOffsetTable === undefined) {
      throw "dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' does not have basicOffsetTable";
    }
    if(pixelDataElement.tag !== 'x7fe00010') {
      throw "dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to non pixel data tag (expected tag = x7fe00010'";
    }
    if(pixelDataElement.encapsulatedPixelData !== true) {
      throw "dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to pixel data element that does not have encapsulated pixel data";
    }
    if(pixelDataElement.hadUndefinedLength !== true) {
      throw "dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to pixel data element that does not have undefined length";
    }
    if(pixelDataElement.fragments === undefined) {
      throw "dicomParser.readEncapsulatedImageFrame: parameter 'pixelDataElement' refers to pixel data element that does not have fragments";
    }
    if(basicOffsetTable.length === 0) {
      throw "dicomParser.readEncapsulatedImageFrame: basicOffsetTable has zero entries";
    }
    if(frame < 0) {
      throw "dicomParser.readEncapsulatedImageFrame: parameter 'frame' must be >= 0";
    }
    if(frame >= basicOffsetTable.length) {
      throw "dicomParser.readEncapsulatedImageFrame: parameter 'frame' must be < basicOffsetTable.length";
    }

    // find starting fragment based on basicOffsetTable
    var startingOffset = basicOffsetTable[frame];
    var startFragmentIndex = findFragmentIndexWithOffset(fragments, startingOffset);
    if(startFragmentIndex === undefined) {
      throw "dicomParser.readEncapsulatedImageFrame: unable to find fragment that matches basic offset table entry";
    }
    var numFragments = calculateNumberOfFragments(dataSet, pixelDataElement, frame, basicOffsetTable, fragments, startFragmentIndex);
    return dicomParser.readEncapsulatedPixelDataFromFragments(dataSet, pixelDataElement, startFragmentIndex, numFragments, fragments);
  };

  return dicomParser;
}(dicomParser));
