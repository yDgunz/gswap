test("Prop tests", function() {
	var prop = new Prop(1, 2, 'R2L')
	ok(prop.t_throw == 1);
	ok(prop.t_catch == 2);
	ok(prop.flight_path == 'R2L')
});
  
 test("Juggler init tests", function() {
	var juggler = new Juggler()
	
	juggler.W = 1
	juggler.B = 2
	juggler.D = 1
	
	//check some of the defaults
	ok(juggler.SSW[0] == 3 && juggler.SSW.length == 1, "Default siteswap is [3]");
	ok(juggler.V_x() == 1, "Default V_x is 1");
	//ok(juggler.V_y() == 10, "Default V_y is 10"); // is this necessary?
	
	juggler.initJuggler();
	
	ok(
		juggler.props[0].flight_path == "RL" 
		&& juggler.props[1].flight_path == "LR"
		&& juggler.props[2].flight_path == "RL"
	, "Initialized flight paths should be alternating"
	)
	ok(
		juggler.props[0].t_throw == 1
		&& juggler.props[1].t_throw == 3
		&& juggler.props[2].t_throw == 5
		&& juggler.props[0].t_catch == 2
		&& juggler.props[1].t_catch == 4
		&& juggler.props[2].t_catch == 6
	, "Validate throw/catch times calculated correctly"
	)
	
	// test a different siteswap
	
	juggler.SSW = [4,4,1];
	juggler.initJuggler();
	
		ok(
		juggler.props[0].flight_path == "RR" 
		&& juggler.props[1].flight_path == "LL"
		&& juggler.props[2].flight_path == "RL"
	, "Initialized flight paths should be alternating"
	)
	
});