/**
 * Internal helper functions for parsing DICOM elements
 */

/**
 * reads from the byte stream until it finds the magic numbers for the item delimitation item
 * and then sets the length of the element
 * @param byteStream
 * @param element
 */
module.exports = function findItemDelimitationItemAndSetElementLength (byteStream, element) {
  if (byteStream === undefined) {
    throw "missing required parameter 'byteStream'";
  }

  var itemDelimitationItemLength = 8; // group, element, length
      maxPosition = byteStream.byteArray.length - itemDelimitationItemLength;
  
  while (byteStream.position <= maxPosition) {
    var groupNumber = byteStream.readUint16();
    
    if (groupNumber === 0xfffe) {
      var elementNumber = byteStream.readUint16();
      
      if (elementNumber === 0xe00d) {
        // NOTE: It would be better to also check for the length to be 0 as part of the check above
        // but we will just log a warning for now
        var itemDelimiterLength = byteStream.readUint32();
        
        if (itemDelimiterLength !== 0) {
          byteStream.warnings(
            "encountered non zero length following item delimiter at position" + 
              (byteStream.position - 4) + 
            " while reading element of undefined length with tag ' + element.tag");
        }
        element.length = byteStream.position - element.dataOffset;
        return;
      }
    }
  }

  // No item delimitation item - silently set the length to the end of the buffer and set the position past the end of the buffer
  element.length = byteStream.byteArray.length - element.dataOffset;
  byteStream.seek(byteStream.byteArray.length - byteStream.position);
};

