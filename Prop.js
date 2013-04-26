/* defining flight_path constants */
var R2L = 1;
var R2R = 2;
var L2L = 3;
var L2R = 4;

function Prop(t_throw, t_catch, flight_path, x, y) {
	
	/* initialization for props */
	this.t_throw = t_throw;
	this.t_catch = t_catch;
	this.flight_path = flight_path;
	this.x = x;
	this.y = y;
	this.active = false;
	
}