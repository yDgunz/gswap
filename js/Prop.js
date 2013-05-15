function Prop(t_throw, t_catch, flight_path, x, y, dx, dy, R, ssw_index) {
	
	/* static attributes */
	this.R = R;
	
	/* dynamic attributes */
	this.t_throw = t_throw;
	this.t_catch = t_catch;
	this.flight_path = flight_path;
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.active = false;
	this.ssw_index = ssw_index;
	
}