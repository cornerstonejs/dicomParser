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

    function getPixelDataFromFragments(byteStream, fragments, bufferSize)
    {
        // if there is only one fragment, return a view on this array to avoid copying
        if(fragments.length === 1) {
            return dicomParser.sharedCopy(byteStream.byteArray, fragments[0].dataOffset, fragments[0].length);
        }

        // more than one fragment, combine all of the fragments into one buffer
        var pixelData = dicomParser.alloc(byteStream.byteArray, bufferSize);
        var pixelDataIndex = 0;
        for(var i=0; i < fragments.length; i++) {
            var fragmentOffset = fragments[i].dataOffset;
            for(var j=0; j < fragments[i].length; j++) {
                pixelData[pixelDataIndex++] = byteStream.byteArray[fragmentOffset++];
            }
        }

        return pixelData;
    }

    function readFragmentsUntil(byteStream, endOfFrame) {
        // Read fragments until we reach endOfFrame
        var fragments = [];
        var bufferSize = 0;
        while(byteStream.position < endOfFrame && byteStream.position < byteStream.byteArray.length) {

            // read the fragment
            var item = {
                tag : dicomParser.readTag(byteStream),
                length : byteStream.readUint32(),
                dataOffset :  byteStream.position
            };

            // NOTE: we only encounter this for the sequence delimiter item when extracting the last frame
            if(item.tag === 'xfffee0dd') {
                break;
            }
            fragments.push(item);
            byteStream.seek(item.length);
            bufferSize += item.length;
        }

        // Convert the fragments into a single pixelData buffer
        var pixelData = getPixelDataFromFragments(byteStream, fragments, bufferSize);
        return pixelData;
    }
    
    function getFragmentOffset(byteStream) {
        // read the fragment
        var item = {
            tag : dicomParser.readTag(byteStream),
            length : byteStream.readUint32(),
            dataOffset :  byteStream.position
        };

        // NOTE: we only encounter this for the sequence delimiter item when extracting the last frame
        if(item.tag === 'xfffee0dd') {
            return;
        }
        byteStream.seek(item.length);
    }

    function readEncapsulatedPixelDataWithBasicOffsetTable(pixelDataElement, byteStream, frame) {
        //  validate that we have an offset for this frame
        var numFrames = pixelDataElement.basicOffsetTable.length;
        if(frame > numFrames) {
            throw "dicomParser.readEncapsulatedPixelData: parameter frame exceeds number of frames in basic offset table";
        }

        // move to the start of this frame
        var frameOffset = pixelDataElement.basicOffsetTable[frame];
        var firstFragment = byteStream.position;
        byteStream.seek(frameOffset);

        // Find the end of this frame
        var endOfFrameOffset = pixelDataElement.basicOffsetTable[frame + 1];
        if(endOfFrameOffset === undefined) { // special case for last frame
            endOfFrameOffset = byteStream.position + pixelDataElement.length;
        } else {
          endOfFrameOffset += firstFragment;
        }

        // read this frame
        var pixelData = readFragmentsUntil(byteStream, endOfFrameOffset);
        return pixelData;
    }

    function readEncapsulatedDataNoBasicOffsetTable(pixelDataElement, byteStream, frame) {
        // if the basic offset table is empty, this is a single frame so make sure the requested
        // frame is 0
        if(frame !== 0) {
            throw 'dicomParser.readEncapsulatedPixelData: non zero frame specified for single frame encapsulated pixel data';
        }

        // read this frame
        var endOfFrame = byteStream.position + pixelDataElement.length;
        var pixelData = readFragmentsUntil(byteStream, endOfFrame);
        return pixelData;
    }

    /**
     * Returns the pixel data for the specified frame in an encapsulated pixel data element
     *
     * @param dataSet - the dataSet containing the encapsulated pixel data
     * @param pixelDataElement - the pixel data element (x7fe00010) to extract the frame from
     * @param frame - the zero based frame index
     * @returns Uint8Array with the encapsulated pixel data
     */
    dicomParser.readEncapsulatedPixelData = function(dataSet, pixelDataElement, frame)
    {
        if(dataSet === undefined) {
            throw "dicomParser.readEncapsulatedPixelData: missing required parameter 'dataSet'";
        }
        if(pixelDataElement === undefined) {
            throw "dicomParser.readEncapsulatedPixelData: missing required parameter 'element'";
        }
        if(frame === undefined) {
            throw "dicomParser.readEncapsulatedPixelData: missing required parameter 'frame'";
        }
        if(pixelDataElement.tag !== 'x7fe00010') {
            throw "dicomParser.readEncapsulatedPixelData: parameter 'element' refers to non pixel data tag (expected tag = x7fe00010'";
        }
        if(pixelDataElement.encapsulatedPixelData !== true) {
            throw "dicomParser.readEncapsulatedPixelData: parameter 'element' refers to pixel data element that does not have encapsulated pixel data";
        }
        if(pixelDataElement.hadUndefinedLength !== true) {
            throw "dicomParser.readEncapsulatedPixelData: parameter 'element' refers to pixel data element that does not have encapsulated pixel data";
        }
        if(pixelDataElement.basicOffsetTable === undefined) {
            throw "dicomParser.readEncapsulatedPixelData: parameter 'element' refers to pixel data element that does not have encapsulated pixel data";
        }
        if(pixelDataElement.fragments === undefined) {
            throw "dicomParser.readEncapsulatedPixelData: parameter 'element' refers to pixel data element that does not have encapsulated pixel data";
        }
        if(frame < 0) {
            throw "dicomParser.readEncapsulatedPixelData: parameter 'frame' must be >= 0";
        }

        if(pixelDataElement.basicOffsetTable.length === 0 && dataSet.intString('x00280008') && dataSet.intString('x00280008') > 1){
            var byteStream2 = new dicomParser.ByteStream(dataSet.byteArrayParser, dataSet.byteArray, pixelDataElement.dataOffset);
            var basicOffsetTable2 = dicomParser.readSequenceItem(byteStream2);
            byteStream2.seek(basicOffsetTable2.length);
            var endOfFrame = byteStream2.position + pixelDataElement.length;
            var firstFragment = byteStream2.position;
            pixelDataElement.basicOffsetTable[0] = 0;
            for(var k=0; k< dataSet.intString('x00280008') - 1; k++){
                getFragmentOffset(byteStream2);
                pixelDataElement.basicOffsetTable[k + 1] = byteStream2.position - firstFragment;
            }
        }

        // seek past the basic offset table (no need to parse it again since we already have)
        var byteStream = new dicomParser.ByteStream(dataSet.byteArrayParser, dataSet.byteArray, pixelDataElement.dataOffset);
        var basicOffsetTable = dicomParser.readSequenceItem(byteStream);
        if(basicOffsetTable.tag !== 'xfffee000')
        {
            throw "dicomParser.readEncapsulatedPixelData: missing basic offset table xfffee000";
        }
        byteStream.seek(basicOffsetTable.length);

        // If the basic offset table is empty (no entries), it is a single frame.  If it is not empty,
        // it has at least one frame so use the basic offset table to find the bytes
        if(pixelDataElement.basicOffsetTable.length !== 0)
        {
            return readEncapsulatedPixelDataWithBasicOffsetTable(pixelDataElement, byteStream, frame);
        }
        else
        {
            return readEncapsulatedDataNoBasicOffsetTable(pixelDataElement, byteStream, frame);
        }
    };

    return dicomParser;
}(dicomParser));
