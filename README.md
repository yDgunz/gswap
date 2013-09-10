gswap
=========

gswap is a Javascript/HTML5 siteswap animator that uses Three.js for 3D rendering. It is best used with Google Chrome. 

[Siteswap](http://en.wikipedia.org/wiki/Siteswap) is a notation used to describe juggling patterns. Gswap does introduce some novel extensions on traditional vanilla siteswap.

License
-------
You may use gswap-js under the terms of the MIT License (See [LICENSE](LICENSE)).

Examples
--------

Code Layout
-----------
- css - self explanatory
- qunit - unit testing js/css files
- test - unit tests
- js 
 - jquery, three.js and other external libraries
 - Animator - responsible for interaction with the DOM
 - Juggler - describes the state of a juggler and its props
 - Prop - basic class for something that is juggled
- example HTML files
