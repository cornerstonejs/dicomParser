/**
 * Internal helper functions for for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
    "use strict";

    if(dicomParser === undefined)
    {
        dicomParser = {};
    }


    function readFrame(byteStream, baseOffset, frameOffsets, frame)
    {
        if(frame >= frameOffsets.length) {
            throw 'readFrame: parameter frame refers to frame not in frameOffsets';
        }

        // position the byteStream at the beginning of this frame
        var frameOffset = frameOffsets[frame];
        byteStream.position = baseOffset + frameOffset;

        // calculate the next frame offset so we know when to stop reading this frame
        var nextFrameOffset = byteStream.byteArray.length;
        if(frame < frameOffsets.length - 1) {
            nextFrameOffset = frameOffsets[frame+1];
        }

        // read all fragments for this frame
        var fragments = [];
        var frameSize = 0;
        while(byteStream.position < nextFrameOffset) {
            var fragment = dicomParser.readSequenceItem(byteStream);
            if(fragment.tag === 'xfffee0dd')
            {
                break;
            }
            fragments.push(fragment);
            frameSize += fragment.length;
            byteStream.seek(fragment.length);
        }

        // if there is only one fragment, return a view on this array to avoid copying
        if(fragments.length === 1) {
            return new Uint8Array(byteStream.byteArray.buffer, fragments[0].dataOffset, fragments[0].length);
        }

        // copy all of the data from the fragments into the pixelData

        var pixelData = new Uint8Array(frameSize);
        var pixelDataIndex = 0;
        for(var i=0; i < fragments.length; i++) {
            var fragmentOffset = fragments[i].dataOffset;
            for(var j=0; j < fragments[i].length; j++) {
                pixelData[pixelDataIndex++] = byteStream.byteArray[fragmentOffset++];
            }
        }

        //console.log('read frame #' + frame + " with " + fragments.length + " fragments and " + pixelData.length + " bytes");

        return pixelData;
    }

    dicomParser.readEncapsulatedPixelData = function(dataSet, frame)
    {
        if(dataSet === undefined)
        {
            throw "dicomParser.readEncapsulatedPixelData: missing required parameter 'dataSet'";
        }
        if(frame === undefined)
        {
            throw "dicomParser.readEncapsulatedPixelData: missing required parameter 'frame'";
        }
        var pixelElement = dataSet.elements.x7fe00010;
        if(pixelElement === undefined)
        {
            throw "dicomParser.readEncapsulatedPixelData: pixel data element x7fe00010 not present";
        }

        // seek to the beginning of the encapsulated pixel data and read the basic offset table
        var byteStream = new dicomParser.LittleEndianByteStream(dataSet.byteArray);
        byteStream.seek(pixelElement.dataOffset);
        var basicOffsetTable = dicomParser.readSequenceItem(byteStream);
        if(basicOffsetTable.tag !== 'xfffee000') {
            throw "dicomParser.readEncapsulatedPixelData: missing basic offset table xfffee000";
        }

        // now that we know how many frames we have validate the frame parameter
        var numFrames = basicOffsetTable.length / 4;
        if(frame > numFrames - 1) {
            throw "dicomParser.readEncapsulatedPixelData: parameter frame exceeds number of frames in basic offset table";
        }

        // read all the frame offsets
        var frameOffsets =[];
        for(var frameOffsetNum = 0; frameOffsetNum < numFrames; frameOffsetNum++)
        {
            var frameOffset = byteStream.readUint32();
            frameOffsets.push(frameOffset);
        }

        // now read the frame
        var baseOffset = byteStream.position;
        var pixelData = readFrame(byteStream, baseOffset, frameOffsets, frame);
        return pixelData;
    };

    return dicomParser;
}(dicomParser));