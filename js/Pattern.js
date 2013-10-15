var G = -9.8;

function Pattern(pattern) {
	this.beatDuration = pattern.beatDuration;
	this.sync = pattern.sync;
	this.throws = pattern.throws;

	this.getThrowVelocity = function (prop) {

		var throwIndex = prop.throwIndex;
		var hand = prop.throwHand;
		
		var siteswap = parseInt(this.throws[throwIndex][hand].siteswap[0]);

		//if the siteswap is odd, the throw crosses hands
		var targetHand = (!this.sync && siteswap % 2 == 1) || (this.sync && this.throws[throwIndex][hand].siteswap[1] == "x") ? (1 - hand) : hand;
		var throwDuration = this.beatDuration*siteswap - this.throws[throwIndex][hand].dwellDuration;
		
		var catchDwellPath = this.throws[(throwIndex + siteswap) % this.throws.length][targetHand].dwellPath;
		if ( catchDwellPath.type == "linear" ) {
			catchPosition = catchDwellPath.path[0];		
		} else if ( catchDwellPath.type == "circular" ) {
			catchPosition = 
				{
					x: catchDwellPath.center.x + catchDwellPath.radius*Math.cos(catchDwellPath.thetaCatch),
					y: catchDwellPath.center.y + catchDwellPath.radius*Math.sin(catchDwellPath.thetaCatch),
					z: catchDwellPath.center.z
				};
		}

		var throwDwellPath = this.throws[throwIndex][hand].dwellPath;
		if ( throwDwellPath.type == "linear" ) {
			throwPosition = throwDwellPath.path[throwDwellPath.path.length-1];
		} else if ( throwDwellPath.type == "circular" ) {
			throwPosition = 
				{
					x: throwDwellPath.center.x + throwDwellPath.radius*Math.cos(throwDwellPath.thetaThrow),
					y: throwDwellPath.center.y + throwDwellPath.radius*Math.sin(throwDwellPath.thetaThrow),
					z: throwDwellPath.center.z
				};
		}

		var dy;
		if ( this.throws[throwIndex][hand].bounces == 0 )  {
			dy = ( catchPosition.y - throwPosition.y - .5*G*throwDuration*throwDuration ) / throwDuration;
		} else {
			dy = get_bounce_v(throwPosition.y, catchPosition.y, throwDuration, (this.throws[throwIndex][hand].forceBounce ? -1 : 1) , .01, .01, .01, this.throws[throwIndex][hand].bounces, G, prop.C, 1000, prop.radius)
		}
		
		var velocity = 
			{
				dx: ( catchPosition.x - throwPosition.x ) / throwDuration,
				dy: dy,
				dz: ( catchPosition.z - throwPosition.z ) / throwDuration
			};

		return velocity;
	}
}

function getNumberOfProps(siteswap) {
	var sum = 0;
	var length = 0;
	for (var i = 0; i < siteswap.length; i++) {
		if(!isNaN(siteswap[i])) {
			sum += parseInt(siteswap[i]);
			length++;
		}
	}
	return sum / length;
}

/* calculate the bounce velocity given the start/end heights - wrote this function a while ago, excuse variable name inconsistency!*/
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