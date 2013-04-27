gswap-js
=========

A simple siteswap animator for vanilla siteswap.

License
-------
You may use gswap-js under the terms of the MIT License (See [LICENSE](LICENSE)).


Examples
--------

Code Layout
-----------
HTML
	example
	test - calls all the test.js files
CSS
	example
Javascript
	juggle - creates an Animator and passes it a new Juggler and canvas based on the params in the HTML
	Animator - updates and draws a Juggler on the given canvas
		canvas the canvas to render
		G gravity constant in m/s^2
		W_v width of the viewport in m
	Juggler - has an array of Props and calculates the x/y positions of each Prop given a set of parameters. All coordinates are in meters. All angles in radians.
		N number of props (configurable by the siteswap...)
		SSW siteswap array
		W width of pattern
		B beat time
		D dwell time
		D_R_r radius of right hand dwell path
		D_R_l radius of left hand dwell path
		D_TH_t_r angle of right hand throw
		D_TH_c_r angle of right hand catch
		D_TH_t_l angle of left hand throw
		D_TH_c_l angle of left hand catch
		H juggler height
	Prop - something a Juggler juggles!
	Prop.test.js, Juggler.test.js, Animator.test.js - do I need to write tests for the animator?
Lib
	qunit