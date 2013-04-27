var colors = ["red", "green", "blue", "yellow", "teal", "pink", "grey"]
var juggler;
var W_j = 5; // juggler environment width in m
var H_v = document.getElementById("jugglerCanvas").height; // height of the viewport in px
var W_v = document.getElementById("jugglerCanvas").width;  // width of the viewport in px
var T_s = 1;

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
	
	var t = ((new Date()).getTime()-startTime)/1000*T_s;//-startTime;
	
	juggler.updateJuggler(t);
	
	//clear the screen
	context.clearRect(0,0,400,600);
	context.fillStyle = "#eeeeee"
	context.fillRect(0,0,400,600);
	
	// write some text
	context.font = '10pt Calibri';
	context.fillStyle = "blue";	
	
	context.fillText(t, 20, 20);
	context.fillText("Red - throw: " + juggler.props[0].t_t + ", catch: " + juggler.props[0].t_c, 20, 40); 
	context.fillText("Green - throw: " + juggler.props[1].t_t + ", catch: " + juggler.props[1].t_c, 20, 60);
	context.fillText("Blue - throw: " + juggler.props[2].t_t + ", catch: " + juggler.props[2].t_c, 20, 80);
	
	// draw all the juggler's props
	for (var i = 0; i < juggler.props.length; i++) {
		color = colors[i];
		
		if (juggler.props[i].active == true) {
			context.beginPath();
			context.fillStyle=color;
			context.arc(x_v(juggler.props[i].x),y_v(juggler.props[i].y),prop_r_v(juggler.props[i].R),0,Math.PI*2,true); 
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
function startJuggling() {
	startTime = (new Date()).getTime();
	juggler = new Juggler();
	
	juggler.N = document.getElementById("in_N").value;
	SSWtmp = document.getElementById("in_SSW").value.split(",");
	SSW = [];
	for (var i = 0; i < SSWtmp.length; i++) {
		SSW.push(parseInt(SSWtmp[i]));
	}
	juggler.SSW = SSW;
	juggler.W = parseFloat(document.getElementById("in_W").value);
	juggler.B = parseFloat(document.getElementById("in_B").value);
	juggler.D = parseFloat(document.getElementById("in_D").value);
	juggler.D_R_r = parseFloat(document.getElementById("in_D_R_r").value);
	juggler.D_R_l = parseFloat(document.getElementById("in_D_R_l").value);
	juggler.D_TH_c_r = parseFloat(document.getElementById("in_D_TH_c_r").value);
	juggler.D_TH_t_r = parseFloat(document.getElementById("in_D_TH_t_r").value);
	juggler.D_TH_c_l = parseFloat(document.getElementById("in_D_TH_c_l").value);
	juggler.D_TH_t_l = parseFloat(document.getElementById("in_D_TH_t_l").value);
	juggler.H = parseFloat(document.getElementById("in_H").value);
	juggler.G = parseFloat(document.getElementById("in_G").value);
	juggler.R = parseFloat(document.getElementById("in_R").value);
	W_j = parseFloat(document.getElementById("in_W_j").value);
	T_s = parseFloat(document.getElementById("in_T_s").value);
	
	juggler.initJuggler();
	var canvas = document.getElementById('jugglerCanvas');
	animate(canvas);
}