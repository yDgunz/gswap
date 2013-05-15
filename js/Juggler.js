RIGHT = 0;
LEFT = 1;

function Juggler(N, SSW, W, B, D, D_R_r, D_R_l, D_TH_c_r, D_TH_t_r, D_TH_c_l, D_TH_t_l, H, G, R, D_TH_dir_r, D_TH_dir_l, C) {
	
	/* static */
	this.N = N; 					// number of props -- technically you could just get this from the siteswap...
	this.SSW = SSW; 				// siteswap
	this.W = W; 					// width of pattern 
	this.B = B; 					// length of a beat
	this.D = D; 					// dwell time
	this.D_R_r = D_R_r; 			//radius of dwell path
	this.D_R_l = D_R_l; 			//radius of dwell path
	this.D_TH_c_r = D_TH_c_r; 		//angle of the right hand catch
	this.D_TH_t_r = D_TH_t_r;		//angle of the right hand throw
	this.D_TH_c_l = D_TH_c_l; 		//angle of the left hand catch
	this.D_TH_t_l = D_TH_t_l; 		//angle of the left hand throw
	this.H = H;						//height of the juggler
	this.G = G;						//gravity
	this.R = R; 					//prop radius
	this.D_TH_dir_r = D_TH_dir_r; 	//direction of right hand dwell (1 = CCW, -1 = CW)
	this.D_TH_dir_l = D_TH_dir_l;	//direction of left hand dwell
	this.C = C;						//coefficient of restitution for all props
	
	/* dynamic */
	this.props = [];
	this.last_update_t = 0;
	this.jugglerSSW = [];
	this.dt = 0;
	this.next_ssw_index = N%SSW.length;
	
	// helper functions to return the hand x/y coords for throws and catches
	this.X_t_r = function() {
		return this.W/2+this.D_R_r*Math.cos(this.D_TH_t_r);
	}
	this.X_c_r = function() {
		return this.W/2+this.D_R_r*Math.cos(this.D_TH_c_r);
	}
	this.X_t_l = function() { 
		return -this.W/2+this.D_R_l*Math.cos(this.D_TH_t_l);
	}
	this.X_c_l = function() {
		return -this.W/2+this.D_R_l*Math.cos(this.D_TH_c_l);
	}
	this.Y_t_r = function() {
		return this.H+this.D_R_r*Math.sin(this.D_TH_t_r);
	}
	this.Y_c_r = function() {
		return this.H+this.D_R_r*Math.sin(this.D_TH_c_r);
	}
	this.Y_t_l = function() {
		return this.H+this.D_R_l*Math.sin(this.D_TH_t_l);
	}
	this.Y_c_l = function() {
		return this.H+this.D_R_l*Math.sin(this.D_TH_c_l);
	}
	
	this.init_juggler = function () {
		
		// create the jugglerSSW 
		this.jugglerSSW = [];
		for (var i = 0; i < this.SSW.length; i++) {
			// create an object for each item in the juggler SSW
			var air_T = parseInt(this.SSW[i][0])*B - this.D;
			var switchHands = false;
			if (parseInt(this.SSW[i][0]) % 2 == 1)
				switchHands = true;
			
			this.jugglerSSW.push([]);
			
			var throw_x,throw_y,catch_x,catch_y,throw_dx,throw_dy;
			
			//calculate for right hand
			throw_x = this.X_t_r();
			throw_y = this.Y_t_r();
			if (switchHands == true) {
				catch_x = this.X_c_l();
				catch_y = this.Y_c_l();				
			} else {
				catch_x = this.X_c_r();
				catch_y = this.Y_c_r();				
			}
			throw_dx = (catch_x-throw_x)/air_T;
			if (this.SSW[i].length > 1) {
				/* determine whether or not it's a lift or a force bounce */
				if (this.SSW[i][1] == "L") 
					var v_sign = 1;
				else
					var v_sign = -1;
				
				/* determine how many bounces */
				if (this.SSW[i].length > 2) 
					var num_bounces = this.SSW[i][2];
				else
					var num_bounces = 1;
				
				throw_dy = get_bounce_v(throw_y, catch_y, air_T, v_sign, .01, .01, .01, num_bounces, this.G, this.C, 10000, this.R);
			}
			else {
				throw_dy = (catch_y-throw_y-.5*this.G*air_T*air_T)/air_T;		
			}
		
			this.jugglerSSW[i][RIGHT] = {
				"throw_x" : throw_x,
				"throw_y" : throw_y,
				"catch_x" : catch_x,
				"catch_y" : catch_y,
				"throw_dx" : throw_dx,
				"throw_dy" : throw_dy
			};
			
			//calculate for left hand
			throw_x = this.X_t_l();
			throw_y = this.Y_t_l();
			if (switchHands == true) {
				catch_x = this.X_c_r();
				catch_y = this.Y_c_r();				
			} else {
				catch_x = this.X_c_l();
				catch_y = this.Y_c_l();				
			}
			throw_dx = (catch_x-throw_x)/air_T;
			if (this.SSW[i].length > 1) {
				/* determine whether or not it's a lift or a force bounce */
				if (this.SSW[i][1] == "L") 
					var v_sign = 1;
				else
					var v_sign = -1;
				
				/* determine how many bounces */
				if (this.SSW[i].length > 2) 
					var num_bounces = this.SSW[i][2];
				else
					var num_bounces = 1;
				
				throw_dy = get_bounce_v(throw_y, catch_y, air_T, v_sign, .01, .01, .01, num_bounces, this.G, this.C, 10000, this.R);
			}
			else {
				throw_dy = (catch_y-throw_y-.5*this.G*air_T*air_T)/air_T;
			}
		
			this.jugglerSSW[i][LEFT] = {
				"throw_x" : throw_x,
				"throw_y" : throw_y,
				"catch_x" : catch_x,
				"catch_y" : catch_y,
				"throw_dx" : throw_dx,
				"throw_dy" : throw_dy
			};			
		
		}
		
		// clear out props array
		this.props = []
		
		// initialize each prop, alternating the flight path
		for (var i = 0; i < this.N; i++) {
			var ssw_index = i%this.SSW.length;
			var ssw = parseInt(this.SSW[ssw_index][0]);
			if (i % 2 == 0) {
				if (ssw % 2 == 0) {
					flight_path = "RR";
				} else {
					flight_path = "RL";
				}
				var hand = RIGHT;
			} else {
				if (ssw % 2 == 0) {
					flight_path = "LL";
				} else {
					flight_path = "LR";
				}
				var hand = LEFT;
			}
			var x,y,dx,dy;
			x = this.jugglerSSW[ssw_index][hand].throw_x;
			y = this.jugglerSSW[ssw_index][hand].throw_y;
			dx = this.jugglerSSW[ssw_index][hand].throw_dx;
			dy = this.jugglerSSW[ssw_index][hand].throw_dy;
			this.props.push(new Prop(i*this.B+this.D, this.B*(ssw+i), flight_path, x , y, dx, dy, this.R, ssw_index));			
		}
		
		return true;
	}
	
	this.update_juggler = function(t) {
			
		//if this is the first update, just update the time
		this.dt = t-this.last_update_t;
		this.last_update_t = t;
	
		//iterate over each prop
		for (var i = 0; i < this.N; i++) {

			// if the ball has been caught, figure out its next throw		
			if ( t > this.props[i].t_catch ) { 
				ssw = parseInt(this.SSW[this.next_ssw_index][0]);
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
				this.props[i].t_catch = Math.floor(t/this.B)*this.B+ssw*this.B;
				this.props[i].ssw_index = this.next_ssw_index;
				
				this.next_ssw_index = (this.next_ssw_index+1)%this.SSW.length;
			}
			
			// get the hand the prop is thrown from
			if (this.props[i].flight_path[0] == "R")
				hand = RIGHT;
			else
				hand = LEFT;
			
			// if the throw is in the future, the prop is still in the hand
			if (this.props[i].t_throw > t) {
				this.props[i].dx = 0;
				this.props[i].dy = 0;
			
				if(hand == RIGHT) {
					theta_throw = 2*Math.PI*this.D_TH_dir_r+this.D_TH_t_r;
					theta_catch = this.D_TH_c_r;					
					v_theta = (theta_throw-theta_catch)/this.D;
					R = this.D_R_r;
					center = this.W/2;
				} else {
					theta_throw = this.D_TH_t_l;
					theta_catch = this.D_TH_c_l;
					v_theta = (theta_throw-theta_catch)/this.D;
					R = this.D_R_l;
					center = -this.W/2;
				}
				
				theta_t = theta_catch + v_theta*(t-this.props[i].t_throw+this.D);
				this.props[i].x = center + R*Math.cos(theta_t);
				this.props[i].y = this.H+R*Math.sin(theta_t);				
			} 
			// if the throw is in the past, the prop is still in the air
			else {
				this.props[i].active = true;			
				
				// if dx/dy are 0 (ie. the prop was previously in the hand) get the dx/dy
				if (this.props[i].dx == 0 && this.props[i].dy == 0) {
					this.props[i].dx = this.jugglerSSW[this.props[i].ssw_index][hand].throw_dx;
					this.props[i].dy = this.jugglerSSW[this.props[i].ssw_index][hand].throw_dy;
				} else {
					this.props[i].x += this.props[i].dx*this.dt;
					this.props[i].y += this.props[i].dy*this.dt;
					this.props[i].dy += this.G*this.dt;
					
					/* bounce on the ground */
					if(this.props[i].y-this.props[i].R <= 0 && this.props[i].dy < 0) {
						this.props[i].dy = -this.C*this.props[i].dy;
					}
				}

			}
			
		}
		
		return true;
	}
	
}

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