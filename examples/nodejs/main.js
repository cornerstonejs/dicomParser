// Reference the dicomParser module
var dicomParser = require('../../dist/dicomParser');

// This code reads a DICOM P10 file from disk and creates a UInt8Array from it
var fs = require('fs');
var filePath = 'ctimage.dcm';
var dicomFileAsBuffer = fs.readFileSync(filePath);
var dicomFileAsByteArray = new Uint8Array(dicomFileAsBuffer);

 // Now that we have the Uint8array, parse it and extract the patient name
var dataSet = dicomParser.parseDicom(dicomFileAsByteArray);
var patientName = dataSet.string('x00100010');
console.log('Patient Name = '+ patientName);