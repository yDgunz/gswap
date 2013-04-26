var juggler = new Juggler();
juggler.N = document.getElementById("in_N").value;
var W_j = 20; // juggler environment width in m
var prop_r_j = .4; //radius of prop in m
var H_v = document.getElementById("jugglerCanvas").height;
var W_v = document.getElementById("jugglerCanvas").width;	
var GRAVITY = -9.8;
var startTime = 0;

//calculate x/y in juggler's coordinates to x/y in viewport coordinates 
function x_v (x_j) {
	return W_v/2 + W_v/W_j*x_j;
}
function y_v (y_j) {
	return H_v - W_v/W_j - W_v/W_j*y_j;
}

function prop_r_v (prop_r_j) {
	return prop_r_j*W_v/W_j;
}

// create the request animation frame function 
window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	window.setTimeout(callback, 1000 / 60);
	};
})();

// main animation function	  
function animate(canvas) {

	var context = canvas.getContext('2d');
	
	var t = ((new Date()).getTime()-startTime)/1000;//-startTime;
	
	juggler.updateJuggler(t);
	
	//clear the screen
	context.clearRect(0,0,400,600);
	
	// write some text
	context.font = '10pt Calibri';
	context.fillStyle = "blue";	
	
	context.fillText(t, 20, 20);
	context.fillText("Red - throw: " + juggler.props[0].t_throw + ", catch: " + juggler.props[0].t_catch, 20, 40); 
	context.fillText("Green - throw: " + juggler.props[1].t_throw + ", catch: " + juggler.props[1].t_catch, 20, 60);
	context.fillText("Blue - throw: " + juggler.props[2].t_throw + ", catch: " + juggler.props[2].t_catch, 20, 80);
	
	// draw all the juggler's props
	for (var i = 0; i < juggler.props.length; i++) {
		if (i == 0) {
			color = "#ff0000";
		} else if (i == 1) {
			color = "#00ff00";
		} else {
			color = "#0000ff";
		}
		
		if (juggler.props[i].active == true) {
			context.beginPath();
			context.fillStyle=color;
			context.arc(x_v(juggler.props[i].x),y_v(juggler.props[i].y),prop_r_v(prop_r_j),0,Math.PI*2,true); 
			context.closePath();
			context.fill();
		}
	}
	
	// request new frame
	requestAnimFrame(function() {
	  animate(canvas);
	});
 }
  
// wait a bit, then run the sim (eventaully replace with a button click?)
setTimeout(function() {
	startTime = (new Date()).getTime();
	juggler.initJuggler();
	var canvas = document.getElementById('jugglerCanvas');
	animate(canvas);
}, 10);