function Juggler() {
	
	this.N = 6; 					// number of props -- technically you could just get this from the siteswap...
	this.SSW = [6]; 				// siteswap
	this.W = 1; 					// width of pattern 
	this.B = .3; 					// length of a beat
	this.D = .2; 					// dwell time
	this.D_R_r = .2; 				//radius of dwell path
	this.D_R_l = .2; 				//radius of dwell path
	this.D_TH_c_r = 0; 				//angle of the right hand catch
	this.D_TH_t_r = Math.PI;		//angle of the right hand throw
	this.D_TH_c_l = Math.PI; 		//angle of the left hand catch
	this.D_TH_t_l = 0; 				//angle of the left hand throw
	this.H = 1;						//height of the juggler
	this.G = -9.8;					//gravity
	this.R = .1; 					// prop radius
	
	// helper functions to return the hand x/y coords for throws and catches
	this.D_X_t_r = function() {
		return this.W/2+this.D_R_r*Math.cos(this.D_TH_t_r);
	}
	this.D_X_c_r = function() {
		return this.W/2+this.D_R_r*Math.cos(this.D_TH_c_r);
	}
	this.D_X_t_l = function() { 
		return -this.W/2+this.D_R_l*Math.cos(this.D_TH_t_l);
	}
	this.D_X_c_l = function() {
		return -this.W/2+this.D_R_l*Math.cos(this.D_TH_c_l);
	}
	this.D_Y_t_r = function() {
		return this.H+this.D_R_r*Math.sin(this.D_TH_t_r);
	}
	this.D_Y_c_r = function() {
		return this.H+this.D_R_r*Math.sin(this.D_TH_c_r);
	}
	this.D_Y_t_l = function() {
		return this.H+this.D_R_l*Math.sin(this.D_TH_t_l);
	}
	this.D_Y_c_l = function() {
		return this.H+this.D_R_l*Math.sin(this.D_TH_c_l);
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
				// prop starting in right hand
				x = this.D_X_t_r();
				y = this.D_Y_t_r();
			} else {
				if (ssw % 2 == 0) {
					flight_path = "LL";
				} else {
					flight_path = "LR";
				}
				// prop starting in left hand
				x = this.D_X_t_l();
				y = this.D_Y_t_l();
			}
			this.props.push(new Prop(i*this.B+this.D, this.B*(ssw+i), flight_path, x , y, this.R));
		}
		
		return true;
	}
	
	this.updateJuggler = function(t) {
	
		//iterate over each prop
		for (var i = 0; i < this.N; i++) {

			// if the ball has been caught, figure out its next throw		
			if ( t > this.props[i].t_c ) { 
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
				this.props[i].t_t = Math.floor(t/this.B)*this.B+this.D;
				this.props[i].t_c = Math.floor(t/this.B)*this.B+ssw*this.B;
			}
			
			// get the hand the prop is thrown from
			hand = this.props[i].flight_path[0];
			
			// if the throw is in the future, the prop is still in the hand
			if (this.props[i].t_t > t) {
				if(hand == "R") {
					theta_throw = this.D_TH_t_r;
					theta_catch = this.D_TH_c_r;
					v_theta = (theta_catch-theta_throw)/this.D;
					R = this.D_R_r;
					center = this.W/2;
				} else {
					theta_throw = this.D_TH_t_l;
					theta_catch = this.D_TH_c_l;
					v_theta = (theta_catch-theta_throw)/this.D;
					R = this.D_R_l;
					center = -this.W/2;
				}
				
				theta_t = theta_catch + v_theta*(this.D-this.props[i].t_t+t);
				this.props[i].x = center + R*Math.cos(theta_t);
				this.props[i].y = this.H+R*Math.sin(theta_t);				
			} 
			// if the throw is in the past, the prop is still in the air
			else {
				this.props[i].active = true;
				if(this.props[i].flight_path == "RL") {
					x_throw = this.D_X_t_r();
					y_throw = this.D_Y_t_r();
					x_catch = this.D_X_c_l();
					y_catch = this.D_Y_c_l();
				} else if (this.props[i].flight_path == "RR") {
					x_throw = this.D_X_t_r();
					y_throw = this.D_Y_t_r();
					x_catch = this.D_X_c_r();
					y_catch = this.D_Y_c_r();
				} else if (this.props[i].flight_path == "LL") {
					x_throw = this.D_X_t_l();
					y_throw = this.D_Y_t_l();
					x_catch = this.D_X_c_l();
					y_catch = this.D_Y_c_l();
				} else {
					x_throw = this.D_X_t_l();
					y_throw = this.D_Y_t_l();
					x_catch = this.D_X_c_r();
					y_catch = this.D_Y_c_r();
				}
				
				this.props[i].x = x_throw + (x_catch - x_throw)/(this.props[i].t_c - this.props[i].t_t)*(t-this.props[i].t_t);
				this.props[i].y = y_throw + ((y_catch - y_throw) - .5*this.G*(this.props[i].t_c-this.props[i].t_t)*(this.props[i].t_c-this.props[i].t_t))/(this.props[i].t_c-this.props[i].t_t)*(t-this.props[i].t_t) + .5*this.G*(t-this.props[i].t_t)*(t-this.props[i].t_t);
			}
			
		}
		
		return true;
	}
	
}