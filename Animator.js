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
	return H_v - W_v/W_j*y_j;
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
	
	// draw the juggler
	
	//body
	context.strokeStyle = "black";
	context.beginPath();
	context.moveTo(x_v(0),y_v(0));
	context.lineTo(x_v(0),y_v(1.5*H));
	context.lineWidth = 5;
	context.stroke();
	
	//head
	context.beginPath();
	context.arc(x_v(0),y_v(1.5*H),prop_r_v(.2),0,2*Math.PI,true);
	context.closePath();
	context.fillStyle = "black";
	context.fill();
	
	//shoulders
	context.beginPath();
	context.moveTo(x_v(0),y_v(1.25*H));
	context.lineTo(x_v(-juggler.W/5),y_v(1.2*H));
	context.lineTo(x_v(-juggler.W/2),y_v(H));
	context.moveTo(x_v(0),y_v(1.25*H));
	context.lineTo(x_v(juggler.W/5),y_v(1.2*H));
	context.lineTo(x_v(juggler.W/2),y_v(H));
	context.lineWidth = 5;
	context.stroke();	
	
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
function start_juggling() {
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
	D_TH_dir_r = parseInt(document.getElementById("in_D_TH_dir_r").value);
	D_TH_dir_l = parseInt(document.getElementById("in_D_TH_dir_l").value);
	
	juggler = new Juggler(N, SSW, W, B, D, D_R_r, D_R_l, D_TH_c_r, D_TH_t_r, D_TH_c_l, D_TH_t_l, H, G, R, D_TH_dir_r, D_TH_dir_l);
	
	W_j = parseFloat(document.getElementById("in_W_j").value);
	T_s = parseFloat(document.getElementById("in_T_s").value);
	
	juggler.init_juggler();
	
	var canvas = document.getElementById('jugglerCanvas');
	animate(canvas);
}