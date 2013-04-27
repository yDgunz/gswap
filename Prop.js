/* defining flight_path constants */
var R2L = 1;
var R2R = 2;
var L2L = 3;
var L2R = 4;

function Prop(t_t, t_c, flight_path, x, y, R) {
	
	/* initialization for props */
	this.t_t = t_t;
	this.t_c = t_c;
	this.flight_path = flight_path;
	this.x = x;
	this.y = y;
	this.active = false;
	this.R = R;
	
}