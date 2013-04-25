function juggle() {
	GRAVITY = -9.8;
	juggler = new Juggler();
	
	juggler.SSW = [3]
	juggler.W = 1;
	juggler.B = 1;
	juggler.D = .5;
	juggler.R = .1;
	juggler.R_theta_throw = Math.PI;
	juggler.R_theta_catch = 0;
	juggler.L_theta_throw = 0;
	juggler.L_theta_catch = Math.PI;
	
	juggler.initJuggler();
	juggler.updateJuggler(3.1);
	a = juggler;
	juggler.updateJuggler(3.2);
	b = juggler;
}
window.onload = juggle;

