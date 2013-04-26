//TO DO
// make a function that creates the new juggler and call from within each test

GRAVITY = -9.8;

test("Prop tests", function() {
	var prop = new Prop(1, 2, 'R2L')
	ok(prop.t_throw == 1);
	ok(prop.t_catch == 2);
	ok(prop.flight_path == 'R2L')
});
  
test("Juggler init tests", function() {

var juggler = new Juggler();

juggler.W = 1;
juggler.B = 1;
juggler.D = .5;
juggler.R = .1;
juggler.R_theta_throw = Math.PI;
juggler.R_theta_catch = 0;
juggler.L_theta_throw = 0;
juggler.L_theta_catch = Math.PI;
	
	//check some of the defaults
	ok(juggler.SSW[0] == 3 && juggler.SSW.length == 1, "Default siteswap is [3]");
	
	juggler.initJuggler();
	
	ok(
		juggler.props[0].flight_path == "RL" 
		&& juggler.props[1].flight_path == "LR"
		&& juggler.props[2].flight_path == "RL"
	, "Initialized flight paths should be alternating"
	);
	ok(
		juggler.props[0].t_throw == .5
		&& juggler.props[1].t_throw == 1.5
		&& juggler.props[2].t_throw == 2.5
		&& juggler.props[0].t_catch == 3
		&& juggler.props[1].t_catch == 4
		&& juggler.props[2].t_catch == 5
	, "Validate throw/catch times calculated correctly"
	);
	
	ok(
		// balls at +/- .4,0 - need to round to 0 b/c sin(Math.PI) = 0 + eps
		juggler.props[0].x == .4 && Math.floor(juggler.props[0].y) == 0
		&& juggler.props[1].x == -.4 && Math.floor(juggler.props[1].y) == 0
		&& juggler.props[2].x == .4 && Math.floor(juggler.props[2].y) == 0
	, "Validate init positions"
	);
	
	// test a different siteswap
	
	juggler.SSW = [4,4,1];
	juggler.initJuggler();
	
	ok(
		juggler.props[0].flight_path == "RR" 
		&& juggler.props[1].flight_path == "LL"
		&& juggler.props[2].flight_path == "RL"
	, "Initialized flight paths should be alternating"
	);
	ok(
		juggler.props[0].t_throw == .5
		&& juggler.props[1].t_throw == 1.5
		&& juggler.props[2].t_throw == 2.5
		&& juggler.props[0].t_catch == 4
		&& juggler.props[1].t_catch == 5
		&& juggler.props[2].t_catch == 3
	, "Validate throw/catch times calculated correctly"
	);
	
});

test("Juggler update tests", function() {

var juggler = new Juggler();

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
	juggler.updateJuggler(3.2);
	
	ok(juggler.props[0].t_throw == 3.5, "Next throw calculated correctly");
	ok(juggler.props[0].t_catch == 6.5, "Next catch calculated correctly");

	juggler.updateJuggler(3.5);
	juggler.updateJuggler(4.1);
	
	ok(juggler.props[0].t_throw == 3.5 && juggler.props[0].t_catch == 6.5, "Thrown ball not affected");
	ok(juggler.props[1].t_throw == 4.5 && juggler.props[1].t_catch == 7.5, "Next throw/catch calculated correctly again");	
	
});