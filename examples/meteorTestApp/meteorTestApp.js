if(Meteor.isClient)
{
    Template.dropZone.events({
        // Catch the dropped event
        'dropped #dropZone': function(event, temp) {

            var file = event.originalEvent.dataTransfer.files[0];
            var reader = new FileReader();
            reader.onload = function (file) {
                var arrayBuffer = reader.result;
                var byteArray = new Uint8Array(arrayBuffer);
                var dataSet = dicomParser.parseDicom(byteArray);

                $('span[data-dicom]').each(function(index, value)
                {
                    var attr = $(value).attr('data-dicom');
                    var element = dataSet.elements[attr];
                    var text = "";
                    if(element !== undefined)
                    {
                        var str = dataSet.string(attr);
                        if(str !== undefined) {
                            text = str;
                        }
                    }
                    $(value).text(text);
                });
            };
            reader.readAsArrayBuffer(file);
        }

    });

}
