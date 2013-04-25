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
			this.props.push(new Prop(i*this.B+this.D,this.B*(ssw+i),flight_path));
		}
	}
	
	this.updateJuggler = function(t) {
	
		//iterate over each prop
		for (var i = 0; i < this.N; i++) {
			if ( t > this.props[i].t_catch ) { 
				// if the ball has been caught, figure out its next throw
				ssw = this.SSW.shift();
				this.SSW.push(ssw); // put the ssw at the end of the array
				// if the previous path ended in the right hand, start from there
				if (this.props[i].flight_path[1] == "R") {
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
				
				this.props[i].flight_path = flight_path;
				this.props[i].t_throw = Math.floor(t/this.B)*this.B+this.D;
				this.props[i].t_catch = this.props[i].t_throw+ssw*this.B;
			}
		}
	}
	
	// returns an array of x/y pairs for each prop
	this.positions = function(t) {
		// TODO
	}
	
}