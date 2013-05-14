test("Prop tests", function() {
	var prop = new Prop(1, 2, 'R2L', 0, 0, 1)
	ok(prop.t_throw == 1);
	ok(prop.t_catch == 2);
	ok(prop.flight_path == 'R2L');
	ok(prop.R == 1);
	ok(prop.active == false);
});
  
