// Animator environment vars, eventually if Animator is a class these will be fields for it
var colors = ["red", "green", "blue", "yellow", "teal", "pink", "grey"]
var juggler;
var W_j; // juggler environment width in m
var canvas = document.getElementById("jugglerCanvas");
var H_v = canvas.height; // height of the viewport in px
var W_v = canvas.width;  // width of the viewport in px
var T_s;

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
	
	juggler.update_juggler(t);
	
	//clear the screen
	context.fillStyle = "#eeeeee"
	context.fillRect(0,0,400,600);
	
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
  
// function called by the GO button
function startJuggling() {
	startTime = (new Date()).getTime();
	
	N = document.getElementById("in_N").value;
	SSWtmp = document.getElementById("in_SSW").value.split(",");
	SSW = [];
	for (var i = 0; i < SSWtmp.length; i++) {
		SSW.push(parseInt(SSWtmp[i]));
	}
	W = parseFloat(document.getElementById("in_W").value);
	B = parseFloat(document.getElementById("in_B").value);
	D = parseFloat(document.getElementById("in_D").value);
	D_R_r = parseFloat(document.getElementById("in_D_R_r").value);
	D_R_l = parseFloat(document.getElementById("in_D_R_l").value);
	D_TH_c_r = parseFloat(document.getElementById("in_D_TH_c_r").value);
	D_TH_t_r = parseFloat(document.getElementById("in_D_TH_t_r").value);
	D_TH_c_l = parseFloat(document.getElementById("in_D_TH_c_l").value);
	D_TH_t_l = parseFloat(document.getElementById("in_D_TH_t_l").value);
	H = parseFloat(document.getElementById("in_H").value);
	G = parseFloat(document.getElementById("in_G").value);
	R = parseFloat(document.getElementById("in_R").value);
	
	juggler = new Juggler(N, SSW, W, B, D, D_R_r, D_R_l, D_TH_c_r, D_TH_t_r, D_TH_c_l, D_TH_t_l, H, G, R);
	
	W_j = parseFloat(document.getElementById("in_W_j").value);
	T_s = parseFloat(document.getElementById("in_T_s").value);
	
	juggler.init_juggler();
	
	var canvas = document.getElementById('jugglerCanvas');
	animate(canvas);
}