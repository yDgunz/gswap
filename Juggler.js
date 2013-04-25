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
	
	// calculate some helper vars
	this.x_R_throw = function() {
		return this.W/2+this.R*Math.cos(this.R_theta_throw);
	}
	this.x_R_catch = function() {
		return this.W/2+this.R*Math.cos(this.R_theta_catch);
	}
	this.x_L_throw = function() { 
		return -this.W/2+this.R*Math.cos(this.L_theta_throw);
	}
	this.x_L_catch = function() {
		return -this.W/2+this.R*Math.cos(this.L_theta_catch);
	}
	this.y_R_throw = function() {
		return this.R*Math.sin(this.R_theta_throw);
	}
	this.y_R_catch = function() {
		return this.R*Math.sin(this.R_theta_catch);
	}
	this.y_L_throw = function() {
		return this.R*Math.sin(this.L_theta_throw);
	}
	this.y_L_catch = function() {
		return this.R*Math.sin(this.L_theta_catch);
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
				x = this.x_R_throw();
				y = this.y_R_throw();
			} else {
				if (ssw % 2 == 0) {
					flight_path = "LL";
				} else {
					flight_path = "LR";
				}
				// prop starting in left hand
				x = this.x_L_throw();
				y = this.y_L_throw();
			}
			this.props.push(new Prop(i*this.B+this.D, this.B*(ssw+i), flight_path, x , y));
		}
		
		return true;
	}
	
	this.updateJuggler = function(t) {
	
		//iterate over each prop
		for (var i = 0; i < this.N; i++) {

			// if the ball has been caught, figure out its next throw		
			if ( t > this.props[i].t_catch ) { 
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
			
			// get the hand the prop is thrown from
			hand = this.props[i].flight_path[0];
			
			// if the throw is in the future, the prop is still in the hand
			if (this.props[i].t_throw > t) {
				if(hand == "R") {
					theta_throw = this.R_theta_throw;
					theta_catch = this.R_theta_catch;
					center = this.W/2;
				} else {
					theta_throw = this.L_theta_throw;
					theta_catch = this.L_theta_catch;
					center = -this.W/2;
				}
				
				theta_t = theta_catch + (theta_throw-theta_catch)/this.D*t;
				this.props[i].x = center + this.R*Math.cos(theta_t);
				this.props[i].y = this.R*Math.sin(theta_t);				
			} 
			// if the throw is in the past, the prop is still in the air
			else {
				if(this.props[i].flight_path == "RL") {
					x_throw = this.x_R_throw();
					y_throw = this.y_R_throw();
					x_catch = this.x_L_catch();
					y_catch = this.y_L_catch();
				} else if (this.props[i].flight_path == "RR") {
					x_throw = this.x_R_throw();
					y_throw = this.y_R_throw();
					x_catch = this.x_R_catch();
					y_catch = this.y_R_catch();
				} else if (this.props[i].flight_path == "LL") {
					x_throw = this.x_L_throw();
					y_throw = this.y_L_throw();
					x_catch = this.x_L_catch();
					y_catch = this.y_L_catch();
				} else {
					x_throw = this.x_L_throw();
					y_throw = this.y_L_throw();
					x_catch = this.x_R_catch();
					y_catch = this.y_R_catch();
				}
				
				this.props[i].x = x_throw + (x_catch - x_throw)/(this.props[i].t_catch - this.props[i].t_throw)*(t-this.props[i].t_throw);
				this.props[i].y = y_throw + ((y_catch - y_throw) - .5*GRAVITY*(this.props[i].t_catch-this.props[i].t_throw)*(this.props[i].t_catch-this.props[i].t_throw))/(this.props[i].t_catch-this.props[i].t_throw)*(t-this.props[i].t_throw) + .5*GRAVITY*(t-this.props[i].t_throw)*(t-this.props[i].t_throw);
			}
			
		}
		
		return true;
	}
	
}