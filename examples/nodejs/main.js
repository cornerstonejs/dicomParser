// Reference the dicomParser module
var dicomParser = require('../../dist/dicomParser');
var Rusha = require('../../node_modules/rusha');
var rusha = new Rusha();

function bufferToUint8Array(buffer) {
  var view = new Uint8Array(buffer.length);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return view;
}

function sha1(buffer, offset, length) {
  offset = offset || 0;
  length = length || buffer.length;
  var result = new Buffer(length);
  for(var i=0; i < length; i++) {
    result[i] = buffer[offset + i];
  }
  return rusha.digestFromBuffer(result);
}


// This code reads a DICOM P10 file from disk and creates a UInt8Array from it
var fs = require('fs');
var filePath = 'ctimage.dcm';
var dicomFileAsBuffer = fs.readFileSync(filePath);
var dicomFileAsUint8Array = bufferToUint8Array(dicomFileAsBuffer);

console.log('sha1=' + sha1(dicomFileAsBuffer));
console.log('sha1=' + sha1(dicomFileAsUint8Array));

 // Now that we have the Uint8array, parse it and extract the patient name
var dataSet = dicomParser.parseDicom(dicomFileAsBuffer);
var patientName = dataSet.string('x00100010');
console.log('Patient Name = '+ patientName);

var dataSet2 = dicomParser.parseDicom(dicomFileAsUint8Array);
var patientName = dataSet2.string('x00100010');
console.log('Patient Name = '+ patientName);

var pixelData = dataSet.elements.x7fe00010;
var pixelDataBuffer = dicomParser.sharedCopy(dicomFileAsBuffer, pixelData.dataOffset, pixelData.length);
console.log("pixel data = " + pixelDataBuffer.length + " sha1=" + sha1(pixelDataBuffer));

var pixelData2 = dataSet2.elements.x7fe00010;
var pixelDataBuffer2 = dicomParser.sharedCopy(dicomFileAsUint8Array, pixelData2.dataOffset, pixelData2.length );
console.log(pixelDataBuffer2.length);
console.log("pixel data = " + pixelDataBuffer2.length + " sha1=" + sha1(pixelDataBuffer2));

/*
console.log(pixelDataBuffer.length);
console.log("pixel data hash =" + rusha.digest(pixelDataBuffer));
var fragment = pixelData.fragments[0];
console.log(fragment);
//var copy = dicomParser.sharedCopy(dataSet.byteArray, fragment.position, fragment.length);
//var copy = new Uint8Array(dataSet.byteArray.buffer, fragment.position, fragment.length);
var copy = dicomParser.sharedCopy(ab, fragment.position, fragment.length);

//var imageFrame = dicomParser.readEncapsulatedPixelData(dataSet, pixelData, 0);
console.log("fragment 0 size = " + copy.length + " bytes sha1=" + rusha.digest(copy));
  */