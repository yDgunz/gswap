RIGHT = 0;
LEFT = 1;

function Juggler(N, SSW, W, B, D, H, G, R, C, DWELL_R_RIGHT, DWELL_R_LEFT, DWELL_TH_CATCH_RIGHT, DWELL_TH_THROW_RIGHT, DWELL_TH_CATCH_LEFT, DWELL_TH_THROW_LEFT, DWELL_CCW_RIGHT, DWELL_CCW_LEFT) {
	
	/* static attributes */	
	this.N = N; 		// number of props -- technically you could just get this from the siteswap but it's nice to have explicitly defined
	this.SSW = SSW; 	// siteswap
	this.W = W; 		// width of pattern 
	this.B = B; 		// length of a beat
	this.D = D; 		// dwell time
	this.H = H;			// height of the juggler
	this.G = G;			// gravity
	this.R = R; 		// prop radius
	this.C = C;			// coefficient of restitution for all props

	/* static dwell attributes */
	this.DWELL = [];
	this.DWELL[RIGHT] = {
		R: DWELL_R_RIGHT,
		TH_CATCH: DWELL_TH_CATCH_RIGHT,
		X_CATCH: this.W/2+DWELL_R_RIGHT*Math.cos(DWELL_TH_CATCH_RIGHT),
		Y_CATCH: this.H+DWELL_R_RIGHT*Math.sin(DWELL_TH_CATCH_RIGHT),
		TH_THROW: DWELL_TH_THROW_RIGHT,
		X_THROW: this.W/2+DWELL_R_RIGHT*Math.cos(DWELL_TH_THROW_RIGHT),
		Y_THROW: this.H+DWELL_R_RIGHT*Math.sin(DWELL_TH_THROW_RIGHT),
		CCW: DWELL_CCW_RIGHT
	};
	this.DWELL[LEFT] = {
		R: DWELL_R_LEFT,
		TH_CATCH: DWELL_TH_CATCH_LEFT,
		X_CATCH: -this.W/2+DWELL_R_LEFT*Math.cos(DWELL_TH_CATCH_LEFT),
		Y_CATCH: this.H+DWELL_R_LEFT*Math.sin(DWELL_TH_CATCH_LEFT),
		TH_THROW: DWELL_TH_THROW_LEFT,
		X_THROW: -this.W/2+DWELL_R_LEFT*Math.cos(DWELL_TH_THROW_LEFT),
		Y_THROW: this.H+DWELL_R_LEFT*Math.sin(DWELL_TH_THROW_LEFT)
	};	
	
	/* dynamic */
	this.props = [];			// keeps track of each prop
	this.throw_velocity = [];	// right/left dx/dy for each throw in the SSW
	this.hands = [];			// keeps track of the position of the hands
	this.t = 0;					// general timer
	
	this.next_ssw_index = N%SSW.length;
	
	/* need explicit init function b/c of possible overhead associated with calculating throw velocity */
	this.init = function () {
		
		// calculate throw velocities
		this.throw_velocity = [];
		for (var i = 0; i < this.SSW.length; i++) {
			
			var t_air = parseInt(this.SSW[i][0])*this.B - this.D;
			
			/* if the SSW is odd, the ball is crossing hands */
			var switch_hands = false;
			if (parseInt(this.SSW[i][0]) % 2 == 1)
				switch_hands = true;
			
			this.throw_velocity.push([]);
			
			/* calculate the throw velocities for all possible throws */
			
			var throw_x,throw_y,catch_x,catch_y,throw_dx,throw_dy, opp_hand;
			
			for (var hand = 0; hand <= LEFT; hand++) {
			
				opp_hand = LEFT;
				if (hand == LEFT) 
					opp_hand = RIGHT;
			
				throw_x = this.DWELL[hand].X_THROW;
				throw_y = this.DWELL[hand].Y_THROW;
				if (switch_hands == true) {
					catch_x = this.DWELL[opp_hand].X_CATCH;
					catch_y = this.DWELL[opp_hand].Y_CATCH;			
				} else {
					catch_x = this.DWELL[hand].X_CATCH;
					catch_y = this.DWELL[hand].Y_CATCH;		
				}			
				throw_dx = (catch_x-throw_x)/t_air; // the x velocity is easy to calculate
				
				/* if the throw is more than two characters, assume that means a bounce throw 
				this is going to be deprecated once the patterns get more complicated */
				if (this.SSW[i].length > 1) {
					/* determine whether it's a lift or a force bounce */
					var v_sign = -1;
					if (this.SSW[i][1] == "L") 
						v_sign = 1;
					
					/* determine how many bounces */
					var num_bounces = 1;
					if (this.SSW[i].length > 2) 
						num_bounces = this.SSW[i][2];
					
					// throw velocity for bounce throws are complicated, use this helper function
					throw_dy = get_bounce_v(throw_y, catch_y, t_air, v_sign, .01, .01, .01, num_bounces, this.G, this.C, 10000, this.R);
				}
				/* if it's not a bounce throw the dy is easy to calculate */
				else {
					throw_dy = (catch_y-throw_y-.5*this.G*t_air*t_air)/t_air;		
				}
			
				this.throw_velocity[i][hand] = {
					dx : throw_dx,
					dy : throw_dy
				};		
				
			}
				
		}
		
		/* initialize each prop, alternating the flight path */
		this.props = []
		for (var i = 0; i < this.N; i++) {
			var ssw_index = i%this.SSW.length;
			var ssw = parseInt(this.SSW[ssw_index][0]);
			if (i % 2 == 0) {
				if (ssw % 2 == 0) {
					flight_path = [RIGHT, RIGHT];
				} else {
					flight_path = [RIGHT, LEFT];
				}
				var hand = RIGHT;
			} else {
				if (ssw % 2 == 0) {
					flight_path = [LEFT, LEFT];
				} else {
					flight_path = [LEFT, RIGHT];
				}
				var hand = LEFT;
			}
			
			//get the starting x/y/dx/dy for the prop and create it
			var x,y,dx,dy;
			x = this.DWELL[hand].X_THROW;
			y = this.DWELL[hand].Y_THROW;
			dx = this.throw_velocity[ssw_index][hand].dx;
			dy = this.throw_velocity[ssw_index][hand].dy;
			this.props.push(new Prop(i*this.B+this.D, this.B*(ssw+i), flight_path, x , y, dx, dy, this.R, ssw_index));			
		}
		
		// init the hand positions		
		this.hands[RIGHT] = {x: this.DWELL[RIGHT].X_THROW, y: this.DWELL[RIGHT].Y_THROW};
		this.hands[LEFT] = {x: this.DWELL[LEFT].X_THROW, y: this.DWELL[LEFT].Y_THROW};
		
		return true;
	}
	
	/* given an increment of time, update the juggler 
	increments can't be too large otherwise everything will get messed up */
	this.update = function(dt) {
			
		//if this is the first update, just update the time
		this.t += dt;
		
		// vars to store the time of next catch for r/l and whether or not the hand's positions have been determined
		var t_next_catch = [0, 0];
		var hand_set = [false, false];
	
		//iterate over each prop
		for (var i = 0; i < this.N; i++) {

			// if the prop has been caught, figure out its next throw		
			if ( this.t > this.props[i].t_catch ) { 
				ssw = parseInt(this.SSW[this.next_ssw_index][0]);
				// if the previous path ended in the right hand, start from there
				if (this.props[i].flight_path[1] == RIGHT) {
					if (ssw % 2 == 0) {
						flight_path = [RIGHT, RIGHT];
					} else {
						flight_path = [RIGHT, LEFT];
					}
				} else {
					if (ssw % 2 == 0) {
						flight_path = [LEFT, LEFT];
					} else {
						flight_path = [LEFT, RIGHT];
					}
				}

				this.props[i].flight_path = flight_path;
				/* we want the t_throw value to consistently be a multiple of B + D, hence the floor */
				this.props[i].t_throw = Math.floor(this.t/this.B)*this.B+this.D;
				this.props[i].t_catch = Math.floor(this.t/this.B)*this.B+ssw*this.B;
				this.props[i].ssw_index = this.next_ssw_index;
				
				this.next_ssw_index = (this.next_ssw_index+1)%this.SSW.length;
			}
			
			// get the hand the prop is thrown from
			var hand = this.props[i].flight_path[0];			
			
			// if the throw is in the future, the prop is still in the hand
			if (this.props[i].t_throw > this.t) {
				this.props[i].dx = 0;
				this.props[i].dy = 0;			
			
				var theta_throw = this.DWELL[hand].TH_THROW;
				var theta_catch = this.DWELL[hand].TH_CATCH;
				
				// the calculated dwell angular velocity must match the CCW flag for the hand				
				if (this.DWELL[hand].CCW && theta_throw < theta_catch)
					theta_throw += 2*Math.PI;
				if (!this.DWELL[hand].CCW && theta_throw > theta_catch)
					theta_throw -= 2*Math.PI;
				
				var v_theta = (theta_throw-theta_catch)/this.D;
				
				var center = this.W/2;
				if (hand == LEFT)
					center = -this.W/2;
				
				var theta_t = theta_catch + v_theta*(this.t-this.props[i].t_throw+this.D);
				this.props[i].x = center + this.DWELL[hand].R*Math.cos(theta_t);
				this.props[i].y = this.H + this.DWELL[hand].R*Math.sin(theta_t);				
				
				// assign the juggler's hands coordinates
				this.hands[hand].x = this.props[i].x;
				this.hands[hand].y = this.props[i].y;
				
				hand_set[hand] = true;
			} 
			// if the throw is in the past, the prop is still in the air
			else {
				this.props[i].active = true; //props are not active until they're in the air			
				
				// if dx/dy are 0 (ie. the prop was previously in the hand) get the dx/dy
				if (this.props[i].dx == 0 && this.props[i].dy == 0) {
					this.props[i].dx = this.throw_velocity[this.props[i].ssw_index][hand].dx;
					this.props[i].dy = this.throw_velocity[this.props[i].ssw_index][hand].dy;
				} 
				/* else just calculate the x/y from the dx/dy */
				else {
					this.props[i].x += this.props[i].dx*dt;
					this.props[i].y += this.props[i].dy*dt;
					this.props[i].dy += this.G*dt;
					
					/* bounce on the ground */
					if(this.props[i].y-this.props[i].R <= 0 && this.props[i].dy < 0) {
						this.props[i].dy = -this.C*this.props[i].dy;
					}
				}

				// try to set the next catch time for either hand
				if (this.props[i].t_catch < t_next_catch[hand])
					t_next_catch[hand] = this.props[i].t_catch;
			}
			
		}
		
		//TODO: set the hand positions if not set already using the t_next_catch
		
		return true;
	}
	
}

/* helper function to check if the provided SSW is valid */
function validate_ssw(N,ssw) {

	//checks if the given ssw is valid for the number of props N

	sum = 0;
	land = []; //keeps track of when throws land
	
	for (var i = 0; i < ssw.length; i++) {
		if (land[i+parseInt(ssw[i][0])] == 1) {
			return false;
		}
		land[i+parseInt(ssw[i][0])] = 1;
		sum += parseInt(ssw[i][0]);
	}
	
	if (sum/ssw.length != N) {
		return false;
	}
	
	
	return true;

}

/* calculate the bounce velocity given the start/end heights */
function get_bounce_v(H_1, H_2, T, V_sign, dt, eps, dv, num_bounces, g, C, tries, R) {
	//this will return the initial velocity for a bounce
	//H_1 = starting height
	//H_2 = final height
	//T = total time
	//V_sign = lift/force bounce
	//dt = time increment for simulation
	//eps = amount of error allowed
	//dv = velocity increment for simulation
	//num_bounces = number of bounces required
	//g = gravity
	//C = coefficient of restitution
	//tries = number of times to attempt before calling with more lenient params
	//R = radius of prop
	
	var V_0 = 0;
	var it = 0;
	var done = false;
	
	var v;
	var y;
	var bounces;
	
	while (!done && it <= tries) {
		
		//starting velocity and position
		v = V_0;
		y = H_1;
		bounces = 0;
		
		for (var t = 0; t <= T; t += dt) {
			
			//update position and velocity
			y += v*dt;
			v += g*dt;
			
			//if prop is at the floor, velocity changes and loses momentum according to C
			if (y-R <= 0) {
				v = -C*v;
				bounces++;
			}
		}
		
		// if the final position matches H_2, we're done! else we're trying again with a new v moving in the direction of V_sign
		if (bounces == num_bounces && Math.abs(H_2-y) <= eps) {
			done = true;
		} else {
			V_0 += V_sign*dv;
			it++;
		}
		
	}
	
	//if we've reached the max tries and we weren't done, try again with a smaller dv/dt and a larger eps
	if(done == true) {
		return V_0;
	} else {
		//return get_bounce_v(H_1, H_2, T, V_sign, dt-dt*.1, eps+eps*.1, dv-dv*.1, num_bounces, g, C, tries+1, R);
		//recursive call isn't working... just throw an error
		throw {
			name: "Unable to calculate V",
			message: "Unable to calculate v"
		}
	}
	
}