/**
 * Internal helper functions for parsing DICOM elements
 */

var dicomParser = (function (dicomParser)
{
  "use strict";

  if(dicomParser === undefined)
  {
    dicomParser = {};
  }

  /**
   * reads from the byte stream until it finds the magic number for the Sequence Delimitation Item item
   * and then sets the length of the element
   * @param byteStream
   * @param element
   */
  dicomParser.findAndSetUNElementLength = function(byteStream, element)
  {
    if(byteStream === undefined)
    {
      throw "dicomParser.findAndSetUNElementLength: missing required parameter 'byteStream'";
    }

    var itemDelimitationItemLength = 8; // group, element, length
    var maxPosition = byteStream.byteArray.length - itemDelimitationItemLength;
    while(byteStream.position <= maxPosition)
    {
      var groupNumber;
      groupNumber = byteStream.readUint16();
      if(groupNumber === 0xfffe)
      {
        var elementNumber;
        elementNumber = byteStream.readUint16();
        if(elementNumber === 0xe0dd)
        {
          // NOTE: It would be better to also check for the length to be 0 as part of the check above
          // but we will just log a warning for now
          var itemDelimiterLength;
          itemDelimiterLength = byteStream.readUint32(); // the length
          if(itemDelimiterLength !== 0) {
            byteStream.warnings('encountered non zero length following item delimiter at position' + byteStream.position - 4 + " while reading element of undefined length with tag ' + element.tag");
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


  return dicomParser;
}(dicomParser));