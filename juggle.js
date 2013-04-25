// create the request animation frame function 
window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	window.setTimeout(callback, 1000 / 60);
	};
})();

// define canvas and environment
var scale =300; // px per m
var x0 = 400; // 0,0
var y0 = 400; 

var W = 1; // width of pattern in cm
var B = .2; // flight time in seconds for a single beat
var D = 1; // dwell in seconds
var g = -10; // gravity in cm/s^2
var timeElapsed = 0;

//define balls and add them to the queue of balls we are waiting to act on
var balls = new Array();
balls[0] = new Ball(-1,.05,"#0000ff");
balls[1] = new Ball(1,.05,"#ff0000");
balls[2] = new Ball(-1,.05,"#00ff00");

var siteswap = [3];
var siteswap_index = 0;

function incrementSiteswapIndex() {
	siteswap_index++;
	if (siteswap_index >= siteswap.length) {
		siteswap_index = 0;
	}
}

// classes
function Ball(hand,r,fillColor) {
	this.siteswap = 0; 
	this.timeOfThrow = 0;
	
	this.hand = hand;
	this.x = hand*W*.5;
	this.y = 0;	
	this.r = r;
	this.fillColor = fillColor;

	this.dx = function () {
		if (this.siteswap % 2 == 1)
			return -this.hand*W/(this.siteswap*B);
		else
			return 0;
	}
	
	this.dy = function () {
		return -.5*g*this.siteswap*B;
	}
	
	this.drawBall = function (context) {
		//draw the ball
		context.beginPath();
		context.fillStyle=this.fillColor;
		// draw the ball considering the scale and 0,0 position
		// this also facilitates flipping the y-axis
		context.arc(x0+this.x*scale,y0-this.y*scale,this.r*scale,0,Math.PI*2,true); 
		context.closePath();
		context.fill();
	}
	
}

// main animation function	  
 function animate(canvas, startTime) {

	var context = canvas.getContext('2d');
	
	var time = ((new Date()).getTime() - startTime)/1000;
	
	//get the width of the canvas
	var width = $("#canvasContainer").width();
	var height = $("#canvasContainer").height();
	context.canvas.width = width;
	context.canvas.height = height;
	
	//clear the screen
	context.clearRect(0,0,width,height);
	
	// write some text
	context.font = '10pt Calibri';
	context.fillStyle = "blue";	
	
	context.fillText("Ball 1 - dx " + balls[0].dx() + " dy " + balls[0].dy(), 20, 20);	
	context.fillText("Ball 1 - x " + balls[0].x + " y " + balls[0].y, 20, 40);	
	context.fillText("Time " + time, 20, 60);
	context.fillText("Ball 1 - siteswap " + balls[0].siteswap, 20, 80);	
	context.fillText("Ball 1 - hand " + balls[0].hand, 20, 100);	
	
	if (timeElapsed == 0) {
		timeElapsed = time;
	}
	
	// if we've passed a certain amount of time, throw the next ball
	if ((time - timeElapsed) >= B) {
		if (ballsWaiting.length > 0) {
			var ballToThrow = ballsWaiting.shift();
			balls[ballToThrow].siteswap = siteswap[siteswap_index];
			incrementSiteswapIndex();
			balls[ballToThrow].timeOfThrow = time;
			timeElapsed = timeElapsed + B;
		}
	}	
	
	for (var i = 0; i < balls.length; i++) {
		
		// if the throw is completed, throw again
		if (balls[i].siteswap != 0 && (time-balls[i].timeOfThrow) >= balls[i].siteswap*B) {
			
			if (balls[i].siteswap % 2 == 1) {
				balls[i].hand = -balls[i].hand;
			}
			balls[i].siteswap = siteswap[siteswap_index];
			incrementSiteswapIndex();
			balls[i].timeOfThrow = balls[i].timeOfThrow+balls[i].siteswap*B;
		}
		
		balls[i].x = balls[i].hand*W*.5 + balls[i].dx()*(time-balls[i].timeOfThrow);
		balls[i].y = balls[i].dy()*(time-balls[i].timeOfThrow) + .5*g*(time-balls[i].timeOfThrow)*(time-balls[i].timeOfThrow);
	
		balls[i].drawBall(context);
	}
	
	// request new frame
	requestAnimFrame(function() {
	  animate(canvas, startTime);
	});
  }
	  
	  
  // wait a bit, then run the sim (eventaully replace with a button click?)
  setTimeout(function() {
	var startTime = (new Date()).getTime();
	var canvas = document.getElementById('myCanvas');
	animate(canvas, startTime);
  }, 10);