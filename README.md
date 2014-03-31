dicomParser
===========

Javascript parser for DICOM Part 10 byte streams.  Requires IE10+ or any other modern browser

[Click here for a live example of using the library to display specific fields from a DICOM files](https://rawgithub.com/chafey/dicomParser/master/examples/dragAndDropParse/index.html)

[Click here for a live example of using the library to do a DICOM dump of a DICOM file](https://rawgithub.com/chafey/dicomParser/master/examples/dragAndDropDump/index.html)


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
* Designed to work well in a browser (modern ones at least)
* Follows modern javascript best practices
* Has documentation and examples on how to use it
* Does not hide the underlying data stream from you
* Does not require a data dictionary
* Decodes individual elements "on demand" - this goes with not needing a data dictionary
* Code guards against corrupt or invalid data streams by sanity checking lengths and offsets
* Does not depend on any external dependencies - just drop it in and go
* Has unit tests
* Code is easy to understand

Curious why these are important to me?  Read more about this in the Soapbox section at the bottom of this page.

Backlog
------------

* Add conversion functions for the VR's that don't have them yet
* Figure out how to automatically generate documentation from the source (jsdoc)
* Create bower package
* Add support for AMD loaders
* Create an example that leverages a data dictionary
* Figure out why drag and drop doesn't work for IE11
* Add unit tests for sequence parsing functionality

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


Soapbox
============

Interested in knowing why the above goals are important to me?  Here you go:

_License is extremely liberal so it could be used in any type of project_

DICOM is an open standard and parsing it is easy enough that it should be freely available for
all types of products - personal, open source and commercial.  I am hoping that the MIT license
will help it see the widest possible adoption (which will in the end help the most patients).
I will dual license it under GPL if someone asks.

_Only deals with parsing DICOM - no code to actually display the images_

I am a big believer in small reusable pieces of software and loose coupling.  There is no reason to
tightly couple the parser with image display.  I hope that keeping this library small and simple will
help it reach the widest adoption.

_Designed to work well in a browser (modern ones at least)_

There are some good javascript DICOM parsing libraries available for server development on node.js but they
won't automatically work in a browser.  I needed a library that let me easily parse WADO responses and
I figured others would also prefer a simple library to do this with no dependencies.  I don't have any plans
to make this library work in node.js but would welcome contributions from anyone that wants to do the work.
The library does make use of the [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBuffer)
object which is widely supported except for IE (it is available on IE10+).  I have no plans to add support
for older versions of IE.

_Follows modern javascript best practices_

This of course means different things to different people but I have found great benefit from making sure
my javascript passes [jshint](http://www.jshint.com/) and leveraging the
[module pattern](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html).  I also have a great affinity to
[AMD modules](http://requirejs.org/docs/whyamd.html) but I understand that not everyone wants to use them.
So for this library I am shooting for simply making sure the code uses the module pattern and passes jshint.

_Has documentation and examples on how to use it_

Do I really need to convince you that this is needed?

_Does not hide the underlying data stream from you_

I have used many DICOM parsing libraries over the years and most of them either hide the underlying byte stream
from you or make it really difficult to access.  There are times when you need to access the bytes  - and there
is no reason to make it hard to do.  A few examples of the need for this include when you are dealing with UN VR's,
private data and implicit little endian transfer syntaxes (which unfortunately are still widely being used)
and you don't have a complete data dictionary.  This library addresses this issue by not even trying to parse
the data and doing it on demand.  So what you get from a parse is basically a set of pointers to where the data
for each element is in the byte stream and then you call the function you want to extract the type you want.  An
awesome side effect of this is that you don't need a data dictionary to parse a file even if it uses implicit
little endian.  Usually you know which elements you want to access and know what type they are so designing your
parser around a data dictionary is just adding unnecessary complexity.  Additionally, it really isn't the clients
job to know what data dictionary a given data set may need - in this day and age the Image Archive should manage this
complexity by managing the data dictionary and providing data in explicit transfer syntaxes.

_Does not require a data dictionary_

See above, data dictionaries are not required for most use cases so why would a library author burden its users
with it at all?  For those use cases that do require it, you can layer it on top of this library.  If you do want
to know the VR, request the instance in an explicit transfer syntax and you can have it.  If your Image Archive
can't do this for you, get a new one.

_Decodes individual elements "on demand" - this goes with not needing a data dictionary_

See above, this is related to not requiring a data dictionary.  Usually you know exactly what elements you need
and what their types are.  The only time this is not the case is when you are building a DICOM Dump utility or
you can't get an explicit transfer syntax and have one of those weird elements that can be either OB or OW (and you
can _usually_ figure out which one it is without the VR anyway)

_Code guards against corrupt or invalid data streams by sanity checking lengths and offsets_

Even though you would expect an Image Archive to _never_ send you data that isn't 100% DICOM compliant,
that is not a bet I would make.  As I like to say - there is no "DICOM police" to penalize vendors
who ship software that creates bytes streams that violate the DICOM standard.  In general it is good
practice to never trust data from another system - even one that you are in full control of.

_Does not depend on any external dependencies - just drop it in and go_

Sort of addressed above as maximizing adoption requires that the library minimize the burden on its users.  I did
find a few interesting libraries that were targeted at making it easier and safer to parse byte streams but
they just seemed like overkill so I decided to do it all in one to keep it as simple as it could be.  In general
I am a big fan of building complex systems from lots of smaller simpler pieces.  Some good
references on this include the [microjs site](http://microjs.com/#) and the
[cujo.js manifseto](http://cujojs.com/manifesto.html)

_Has unit tests_

I generally feel that units tests are _mostly_ a waste of time for front end development, but a DICOM parser
is perhaps one of the best examples of when you should write unit tests.  I did use
[TDD](http://en.wikipedia.org/wiki/Test-driven_development) on this project and had unit tests
covering ~ 80% of the code paths passing before I even tried to load my first real DICOM file.  Before I wrote
this library, I did a quick prototype without unit tests that actually took me much less time
(writing tests takes time....).   So in the end I don't think it saved me much time getting to a first release,
but I am hoping it will pay for itself in the long run (especially if this library receives wide adoption).
I also know that some people out there won't even look at it unless it has good test coverage.

_Code is easy to understand_

In my experience, writing code that is easy to understand is *far more important* than writing documentation or unit
tests for that code.  The reason is that when a developer needs to fix or enhance a piece of code, they _almost never_
start with the unit tests or documentation - they jump straight into the code and start thrashing about in the debugger.
If some other developer is looking at your code, you probably made a mistake - either a simple typo or a design issue if you
really blew it.  In either case, you should have mercy on them in advance and make their unenviable task of fixing
or extending your code the best it can be.  You can find out more about this by googling for "self documenting code"

Copyright
============
Copyright 2014 Chris Hafey [chafey@gmail.com](mailto:chafey@gmail.com)