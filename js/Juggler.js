var LEFT = 0;
var RIGHT = 1;

function Juggler(pattern,propsInput) {

	this.colors = ["blue", "red", "yellow", "green", "purple"]

	this.pattern = new Pattern(pattern);

	this.props = null; // props get loaded on init
	this.juggleTime = null;
	this.throwCounter = null;

	this.init = function () {
		this.juggleTime = 0;
		this.throwCounter = 0;

		var numProps = getNumberOfProps(this.pattern.throws.map( function(a) { return a[0].siteswap } ));

		this.props = [];

		var hand = 1; // start with the right hand
		for (var i = 0; i < numProps; i++) {
			
			var prop = new Prop(propsInput[i].radius,propsInput[i].C,hand,this.colors[i%this.colors.length]);
			
			prop.throwIndex = Math.floor(this.throwCounter) % this.pattern.throws.length;

			prop.throwTime = Math.floor(this.throwCounter)*this.pattern.beatDuration*(this.pattern.sync ? 2 : 1) + this.pattern.throws[prop.throwIndex][hand].dwellDuration;
			prop.catchTime = Math.floor(this.throwCounter)*this.pattern.beatDuration*(this.pattern.sync ? 2 : 1) + this.pattern.beatDuration*this.pattern.throws[prop.throwIndex][hand].siteswap[0];
			var dwellPath = this.pattern.throws[prop.throwIndex][hand].dwellPath;

			/* get last position in dwell path (where you throw from)
			make sure this is a clone of the dwellPath position object! */
			if ( dwellPath.type == "linear" ) {
				prop.position = $.extend({},dwellPath.path[dwellPath.path.length-1]); 	
			} else if ( dwellPath.type == "circular" ) {
				prop.position = 
					{
						x: dwellPath.center.x + dwellPath.radius*Math.cos(dwellPath.thetaThrow),
						y: dwellPath.center.y + dwellPath.radius*Math.sin(dwellPath.thetaThrow),
						z: dwellPath.center.z
					};
			}
			

			var throwVelocity = this.pattern.getThrowVelocity(prop)

			prop.velocity = throwVelocity.velocity;

			prop.rotation = {x: 3*Math.PI/2, y: 0, z:0};
			prop.rotationVelocity = throwVelocity.rotationVelocity;

			this.props.push(prop);

			hand = 1 - hand; // switch hands

			// only increment the throw index counter if the pattern is async or we're on an odd numbered i (meaning an even number of props)
			this.throwCounter += (this.pattern.sync ? 0.5 : 1);

			/*if (!this.pattern.sync || i % 2 == 1) {
				this.throwCounter++;
			}*/
		}

	}

	/* given an increment of time, update the juggler 
	increment can't be too large or things get messed up */
	this.update = function (dt) {
		this.juggleTime += dt;

		// iterate over each prop
		for (var i = 0; i < this.props.length; i++) {
			
			var prop = this.props[i];

			// if throw is in the future, prop is still in hand
			if ( prop.throwTime >= this.juggleTime && prop.active == true) {
				this.interpolateDwellPath(prop);
			} 
			// if catch is in the future, prop is in the air
			else if ( prop.throwTime < this.juggleTime && prop.catchTime > this.juggleTime ) {
				prop.updatePosition(dt);	
				prop.active = true;	
			}
			// if catch is in the past, get next throw 
			else if ( prop.catchTime <= this.juggleTime ) {
				this.getNextThrow(prop);
			}
		}
	}

	this.interpolateDwellPath = function(prop) {

		if ( this.pattern.throws[prop.throwIndex][prop.throwHand].dwellPath.type == "linear" ) {

			//get index along dwell path that we're going from

			var dwellPath = this.pattern.throws[prop.throwIndex][prop.throwHand].dwellPath.path;
			var dwellDuration = this.pattern.throws[prop.throwIndex][prop.throwHand].dwellDuration;
			var dwellCompleted = ( this.juggleTime - ( prop.throwTime - dwellDuration ) ) / dwellDuration;

			var dwellPathIndex = Math.floor( dwellCompleted * ( dwellPath.length-1 ) );

			var p0 = dwellPath[dwellPathIndex];
			var p1 = dwellPath[dwellPathIndex+1];
			
			// uff this next part is complicated, need to document this
			var t = ( this.juggleTime - ( prop.throwTime - dwellDuration ) - dwellPathIndex * ( dwellDuration / (dwellPath.length-1) ) ) / ( dwellDuration / (dwellPath.length-1) );

			// p = p0 + (p1 - p0)*t
			prop.position.x = p0.x + (p1.x - p0.x)*t;
			prop.position.y = p0.y + (p1.y - p0.y)*t;
			prop.position.z = p0.z + (p1.z - p0.z)*t;

		} else if ( this.pattern.throws[prop.throwIndex][prop.throwHand].dwellPath.type == "circular" ) {

			var thetaThrow = this.pattern.throws[prop.throwIndex][prop.throwHand].dwellPath.thetaThrow;
			var thetaCatch = this.pattern.throws[prop.throwIndex][prop.throwHand].dwellPath.thetaCatch;
			var ccw = this.pattern.throws[prop.throwIndex][prop.throwHand].dwellPath.ccw;
			var radius = this.pattern.throws[prop.throwIndex][prop.throwHand].dwellPath.radius;
			var dwellDuration = this.pattern.throws[prop.throwIndex][prop.throwHand].dwellDuration;

			// the calculated dwell angular velocity must match the CCW flag for the hand
			if ( ccw && thetaThrow < thetaCatch )
				thetaThrow += 2*Math.PI;
			if ( !ccw && thetaThrow > thetaCatch )
				thetaThrow -= 2*Math.PI;

			var thetaV = ( thetaThrow - thetaCatch )/dwellDuration;

			var center = this.pattern.throws[prop.throwIndex][prop.throwHand].dwellPath.center;
			var thetaT = thetaCatch + thetaV*(this.juggleTime - prop.throwTime + dwellDuration);

			prop.position = 
				{
					x: center.x + radius*Math.cos(thetaT),
					y: center.y + radius*Math.sin(thetaT),
					z: center.z
				};

		}

	}

	this.getNextThrow = function (prop) {
		//hands change if async siteswap is even, or sync siteswap has crossing = true
		prop.throwHand = (!this.pattern.sync && this.pattern.throws[prop.throwIndex][prop.throwHand].siteswap % 2 == 1) || (this.pattern.sync && this.pattern.throws[prop.throwIndex][prop.throwHand].siteswap[1] == "x") ? (1 - prop.throwHand) : prop.throwHand;
		//get new throw index
		prop.throwIndex = Math.floor(this.throwCounter) % this.pattern.throws.length;
		//get the new throw/catch times. using the floor so we can always have them be multiples of the beat duration
		prop.throwTime = Math.floor(this.juggleTime/this.pattern.beatDuration)*this.pattern.beatDuration+this.pattern.throws[prop.throwIndex][prop.throwHand].dwellDuration; 
		prop.catchTime = Math.floor(this.juggleTime/this.pattern.beatDuration)*this.pattern.beatDuration+parseInt(this.pattern.throws[prop.throwIndex][prop.throwHand].siteswap[0])*this.pattern.beatDuration;

		var throwVelocity = this.pattern.getThrowVelocity(prop);
		prop.velocity = throwVelocity.velocity;
		prop.rotationVelocity = throwVelocity.rotationVelocity;

		this.throwCounter += (this.pattern.sync ? .5 : 1)
	}

}