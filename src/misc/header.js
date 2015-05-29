(function (root, factory) {

    // node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        if(dicomParser === undefined) {
            dicomParser = {};

            // meteor
            if (typeof Package !== 'undefined') {
                root.dicomParser = dicomParser;
            }
        }
        dicomParser = factory();
    }
}(this, function () {
