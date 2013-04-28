//helper function to create test juggler for each test
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
	
	var juggler = test_juggler();
	juggler.init_juggler();
	
	ok(
		juggler.props[0].flight_path == "RL" 
		&& juggler.props[1].flight_path == "LR"
		&& juggler.props[2].flight_path == "RL"
	, "Initial flights path for 3 correct"
	);
	
	ok(
		juggler.props[0].t_t == 1
		&& juggler.props[1].t_t == 3
		&& juggler.props[2].t_t == 5
		&& juggler.props[0].t_c == 6
		&& juggler.props[1].t_c == 8
		&& juggler.props[2].t_c == 10
	, "Throw/cathc times for 3 correct"
	);
	
	ok(
		// balls at +/- .4,0 - need to round to 0 b/c sin(Math.PI) = 0 + eps
		juggler.props[0].x == .5 && Math.floor(juggler.props[0].y) == 1
		&& juggler.props[1].x == -.5 && Math.floor(juggler.props[1].y) == 1
		&& juggler.props[2].x == .5 && Math.floor(juggler.props[2].y) == 1
	, "Initial prop positions correct"
	);
	
	// test a different siteswap
	juggler.SSW = [4,4,1];
	juggler.init_juggler();
	
	ok(
		juggler.props[0].flight_path == "RR" 
		&& juggler.props[1].flight_path == "LL"
		&& juggler.props[2].flight_path == "RL"
	, "Initial flight paths for 441 correct"
	);
	ok(
		juggler.props[0].t_t == 1
		&& juggler.props[1].t_t == 3
		&& juggler.props[2].t_t == 5
		&& juggler.props[0].t_c == 8
		&& juggler.props[1].t_c == 10
		&& juggler.props[2].t_c == 6
	, "Throw/catch times for 441 correct"
	);
	
});

test("Juggler update tests", function() {

	var juggler = test_juggler();
	juggler.init_juggler();
	
	juggler.update_juggler(6.1);
	juggler.update_juggler(6.2);
	
	ok(juggler.props[0].t_t == 7, "Next throw calculated correctly");
	ok(juggler.props[0].t_c == 12, "Next catch calculated correctly");

	juggler.update_juggler(7.5);
	juggler.update_juggler(8.1);
	
	ok(juggler.props[0].t_t == 7 && juggler.props[0].t_c == 12, "Thrown ball not affected");
	ok(juggler.props[1].t_t == 9 && juggler.props[1].t_c == 14, "Next throw/catch calculated correctly again");	
	
});