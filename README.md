dicomParser
===========

Javascript parser for DICOM Part 10 byte streams.  Target environment is the browser.

[Click here for an live example of the library in action!](https://rawgithub.com/chafey/dicomParser/master/examples/dragAndDropParse/index.html)

Features
========
* Alpha - not released

Backlog
========

* Finish support for sequences (mostly working for explicit at least, not yet for implicit)
* Add support for elements with undefined lengths
* Add conversion functions for the VR's that don't have them yet
* Figure out how to automatically generate documentation from the source (jsdoc)
* Create bower package
* Add support for AMD loaders
* Create more examples

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
------------
Copyright 2014 Chris Hafey