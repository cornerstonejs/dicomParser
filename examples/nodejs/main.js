// Print
console.log('');
console.log('-----------------------------------------');

// Reference the dicomParser module
var dicomParser = require('../../dist/dicomParser');

// Load in Rusha so we can calculate sha1 hashes
var Rusha = require('../../node_modules/rusha');

// Function to calculate the SHA1 Hash for a buffer with a given offset and length
function sha1(buffer, offset, length) {
  offset = offset || 0;
  length = length || buffer.length;
  var subArray = dicomParser.sharedCopy(buffer, offset, length);
  var rusha = new Rusha();
  return rusha.digest(subArray);
}

// Read the DICOM P10 file from disk into a Buffer
var fs = require('fs');
var filePath = process.argv[2] || 'ctimage.dcm';
console.log('File Path = ', filePath);
var dicomFileAsBuffer = fs.readFileSync(filePath);

// Print the sha1 hash for the overall file
console.log('File SHA1 hash = ' + sha1(dicomFileAsBuffer));

 // Parse the dicom file
try {
  var dataSet = dicomParser.parseDicom(dicomFileAsBuffer);

// print the patient's name
  var patientName = dataSet.string('x00100010');
  console.log('Patient Name = '+ patientName);

// Get the pixel data element and calculate the SHA1 hash for its data
  var pixelData = dataSet.elements.x7fe00010;
  var pixelDataBuffer = dicomParser.sharedCopy(dicomFileAsBuffer, pixelData.dataOffset, pixelData.length);
  console.log('Pixel Data length = ', pixelDataBuffer.length);
  console.log("Pixel Data SHA1 hash = ", sha1(pixelDataBuffer));


  if(pixelData.encapsulatedPixelData) {
    var imageFrame = dicomParser.readEncapsulatedPixelData(dataSet, pixelData, 0);
    console.log('Old Image Frame length = ', imageFrame.length);
    console.log('Old Image Frame SHA1 hash = ', sha1(imageFrame));

    if(pixelData.basicOffsetTable.length) {
      var imageFrame = dicomParser.readEncapsulatedImageFrame(dataSet, pixelData, 0);
      console.log('Image Frame length = ', imageFrame.length);
      console.log('Image Frame SHA1 hash = ', sha1(imageFrame));
    } else {
      var imageFrame = dicomParser.readEncapsulatedPixelDataFromFragments(dataSet, pixelData, 0, pixelData.fragments.length);
      console.log('Image Frame length = ', imageFrame.length);
      console.log('Image Frame SHA1 hash = ', sha1(imageFrame));
    }
  }

}
catch(ex) {
  console.log(ex);
}

console.log('-----------------------------------------');
console.log('');
