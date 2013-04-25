function Juggler() {
	
	this.N = 3; 	// number of balls
	this.SSW = [3]; 	// siteswap
	this.W = .5; 	// width of pattern 
	this.B = 1.0; 	// length of a beat
	this.D = .5; 	// dwell time
	this.R_theta_catch = 0; 	//angle of the right hand catch
	this.R_theta_throw = Math.PI;	//angle of the right hand throw
	this.L_theta_catch = Math.PI; 	//angle of the left hand catch
	this.L_theta_throw = 0; 	//angle of the left hand throw
	this.R = .1; 	//radius of dwell path
	this.props = []; 	// the props array is initially empty
	
	// helper vars
	this.V_x = function () { 	// x velocity
		return this.W/(this.B-this.D);
	}
	
	this.V_y = function () {	// y velocity
		return -.5*GRAVITY*(this.B-this.D);
	}
	
	this.initJuggler = function () {
		
		// clear out props array
		this.props = []
		
		// initialize each prop, alternating the path
		for (var i = 0; i < this.N; i++) {
			ssw = this.SSW.shift();
			this.SSW.push(ssw); // put the ssw at the end of the array
			if (i % 2 == 0) {
				if (ssw % 2 == 0) {
					flight_path = "RR";
				} else {
					flight_path = "RL";
				}
			} else {
				if (ssw % 2 == 0) {
					flight_path = "LL";
				} else {
					flight_path = "LR";
				}
			}
			this.props.push(new Prop(i*this.B+this.D,(i+1)*this.B,flight_path));
		}
	}
	
}