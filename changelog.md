# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.8.5] - 2020-02-28
### Fixed
- Fix - Fail to find the image element in a DICOM file with corrupt private Sequence/SIEMENS tags. Issue #114

## [1.8.3] - 2018-12-05
### Fixed
- Re-added named exports that were accidentally deleted in 1.8.2

## [1.8.2] - 2018-12-05
### Added
- Added default export named 'dicomParser' to the module

## [1.8.1] - 2018-05-16
### Fix
- Fix module field inside package.json was pointing to src file that is not present in new npm module, pointed it to dist folder now. (issue#91)
- (Webpack) Issue #85: Output global object must be 'this'

## [1.8.0] - 2018-04-12
### Changed
- Updated Webpack to version 4
- DIST folder is now removed from the repository

# [1.7.6] - 2017-11-04

- Add an example of DICOM PDF parsing and display (https://rawgit.com/cornerstonejs/dicomParser/master/examples/encapsulatedPDF/index.html) (thanks @andrebot)
- Fix module name in webpack (thanks @adreyfus)
- Fix import / export extensions for use as a native ES6 module (thanks @kofifus)