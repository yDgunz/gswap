var EPS = .001;

function test_juggler() {
	var juggler = new Juggler(
		3 //N
		, [3] //SSW
		, 3 //W
		, 2 //B
		, 1 //D
		, 1 //D_R_r
		, 1 //D_R_l
		, 0 //D_TH_c_r
		, Math.PI //D_TH_t_r
		, Math.PI //D_TH_c_l
		, 0 //D_TH_t_l
		, 1 //H
		, -9.8 //G
		, .5 //R
	);
	
	return juggler;
	
}
  
test("Juggler attribute tests", function() {

	var juggler = test_juggler();
	
	ok(
		juggler.N == 3 
		&& juggler.SSW[0] == 3
		&& juggler.W == 3
		&& juggler.B == 2
		&& juggler.D == 1
		&& juggler.D_R_r == 1
		&& juggler.D_R_l == 1
		&& juggler.D_TH_c_r == 0
		&& juggler.D_TH_t_r == Math.PI
		&& juggler.D_TH_c_l == Math.PI
		&& juggler.D_TH_t_l == 0
		&& juggler.H == 1
		&& juggler.G == -9.8
		&& juggler.R == .5
	, "Juggler attributes set properly"
	);
});

test("Juggler init tests", function () {
	
	juggler.init_juggler();
	
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
	juggler.init_juggler();
	
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

	
	juggler.init_juggler();
	
	juggler.update_juggler(3.1);
	juggler.update_juggler(3.2);
	
	ok(juggler.props[0].t_throw == 3.5, "Next throw calculated correctly");
	ok(juggler.props[0].t_catch == 6.5, "Next catch calculated correctly");

	juggler.update_juggler(3.5);
	juggler.update_juggler(4.1);
	
	ok(juggler.props[0].t_throw == 3.5 && juggler.props[0].t_catch == 6.5, "Thrown ball not affected");
	ok(juggler.props[1].t_throw == 4.5 && juggler.props[1].t_catch == 7.5, "Next throw/catch calculated correctly again");	
	
});