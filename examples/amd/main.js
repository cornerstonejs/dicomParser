/**
 * this file is loaded by Require.js and then run immediately.
 */

// Configure require.js for our dicomParser library since it isn't stored relative to this web page
require.config( {

    // Tell require.js where the dicomParser library is
    paths: {
        dicomParser: '../../dist/dicomParser',
        dicomParserUnpkg: 'https://unpkg.com/dicom-parser/dist/dicomParser.min'
    }
});

// This is our "mainline" which begins execution.  Require.js will automatically load
// the dicomParser library for us pass the dicomParser object in as to our mainline function
require(['dicomParser', 'dicomParserUnpkg'], function(dicomParser, dicomParserUnpkg) {

    const parser = dicomParser || dicomParserUnpkg;
    function dumpFile(file)
    {
        var reader = new FileReader();
        reader.onload = function(file) {
            var arrayBuffer = reader.result;
            var byteArray = new Uint8Array(arrayBuffer);
            var dataSet = parser.parseDicom(byteArray);
            document.getElementById('sopInstanceUid').innerHTML = dataSet.string('x00080018');
        };
        reader.readAsArrayBuffer(file);
    }

    // this function gets called once the user drops the file onto the div
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        // Get the FileList object that contains the list of files that were dropped
        var files = evt.dataTransfer.files;

        // this UI is only built for a single file so just dump the first one
        dumpFile(files[0]);
    }

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    // Setup the dnd listeners.
    var dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
});