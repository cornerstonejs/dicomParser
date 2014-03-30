dicomParser
===========

Javascript parser for DICOM Part 10 byte streams.

[Click here for an live example of the library in action!](https://rawgithub.com/chafey/dicomParser/master/examples/dragAndDropParse/index.html)

[Click here for an list of live examples](https://rawgithub.com/chafey/dicomParser/master/examples/index.html)


Project Status
------------
* Alpha but stable

Why another Javascript DICOM parsing library?
------------

While building the WADO Image Loader for [cornerstone](https://github.com/chafey/cornerstone), I couldn't find a Javascript DICOM parser that exactly met
my needs.  DICOM really isn't that hard to parse so I figured I would just make my own.  Here are some of the key things that I
really wanted out of a DICOM library that I am hoping to deliver:

* License is extremely liberal so it could be used in any type of project
* Only deals with parsing DICOM - no code to actually display the images
* Designed to work well in a browser
* Follows modern javascript best practices
* Has documentation and examples on how to use it
* Does not hide the underlying data stream from you
* Does not require a data dictionary
* Decodes individual elements "on demand" - this goes with not needing a data dictionary
* Code guards against corrupt or invalid data streams by sanity checking lengths and offsets
* Does not depend on any external dependencies - just drop it in and go
* Has unit tests
* Code is easy to understand

Backlog
------------

* Finish support for sequences (mostly working for explicit at least, not yet for implicit)
* Add support for elements with undefined lengths
* Add conversion functions for the VR's that don't have them yet
* Figure out how to automatically generate documentation from the source (jsdoc)
* Create bower package
* Add support for AMD loaders
* Create an example that leverages a data dictionary

Build System
============

This project uses grunt to build the software.

Pre-requisites:
---------------

NodeJs - [click to visit web site for installation instructions](http://nodejs.org).

grunt-cli

> npm install -g grunt-cli

Common Tasks
------------

Update dependencies (after each pull):
> npm install

> bower install

Running the build:
> grunt

Automatically running the build and unit tests after each source change:
> grunt watch


Copyright
============
Copyright 2014 Chris Hafey [chafey@gmail.com](mailto:chafey@gmail.com)