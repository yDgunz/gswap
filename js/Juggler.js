var RIGHT = 0;
var LEFT = 1;

function Juggler(siteswap) {

	this.colors = ["blue", "red", "yellow", "green", "purple"]

	/* way of parsing sync siteswap :
	a.slice(1,a.length-1).split(")(").map(function(b) { console.log(b.split(",")); return b; })
	*/

	var pattern = {beatDuration: .3, throws: []};
	siteswap.split('').map(function(s) {
		pattern.throws.push(
				{
					siteswap: s,
					bounces: 0,
					forceBounce: false,
					dwellDuration: .2,
					dwellPath:
						[
							{
								type: "circular",
								center: {x: .2, y: 1, z: 0},
								radius: .2,
								thetaCatch: 0,
								thetaThrow: Math.PI,
								ccw: false	
							},
							{
								type: "circular",
								center: {x: -.2, y: 1, z: 0},
								radius: .2,
								thetaCatch: Math.PI,
								thetaThrow: 0,
								ccw: true	
							}
						]
				}
			);
	});

	this.pattern = new Pattern(pattern);

	this.props = null; // props get loaded on init
	this.juggleTime = null;
	this.throwCounter = null;

	this.init = function () {
		this.juggleTime = 0;
		this.throwCounter = 0;

		var numProps = this.pattern.getNumberOfProps();

		this.props = [];

		var hand = 0; // start with the right hand
		for (var i = 0; i < numProps; i++) {
			
			var prop = new Prop(.08,.95,hand,this.colors[i%this.colors.length]);
			
			prop.throwIndex = this.throwCounter++ % this.pattern.throws.length;
			prop.throwTime = i*this.pattern.beatDuration + this.pattern.throws[prop.throwIndex].dwellDuration;
			prop.catchTime = i*this.pattern.beatDuration + this.pattern.beatDuration*this.pattern.throws[prop.throwIndex].siteswap;
			var dwellPath = this.pattern.throws[prop.throwIndex].dwellPath[hand];

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
			

			prop.velocity = this.pattern.getThrowVelocity(prop);

			this.props.push(prop);

			hand = 1 - hand; // switch hands
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

		if ( this.pattern.throws[prop.throwIndex].dwellPath[prop.throwHand].type == "linear" ) {

			//get index along dwell path that we're going from

			var dwellPath = this.pattern.throws[prop.throwIndex].dwellPath[prop.throwHand].path;
			var dwellDuration = this.pattern.throws[prop.throwIndex].dwellDuration;
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

		} else if ( this.pattern.throws[prop.throwIndex].dwellPath[prop.throwHand].type == "circular" ) {

			var thetaThrow = this.pattern.throws[prop.throwIndex].dwellPath[prop.throwHand].thetaThrow;
			var thetaCatch = this.pattern.throws[prop.throwIndex].dwellPath[prop.throwHand].thetaCatch;
			var ccw = this.pattern.throws[prop.throwIndex].dwellPath[prop.throwHand].ccw;
			var radius = this.pattern.throws[prop.throwIndex].dwellPath[prop.throwHand].radius;
			var dwellDuration = this.pattern.throws[prop.throwIndex].dwellDuration;

			// the calculated dwell angular velocity must match the CCW flag for the hand
			if ( ccw && thetaThrow < thetaCatch )
				thetaThrow += 2*Math.PI;
			if ( !ccw && thetaThrow > thetaCatch )
				thetaThrow -= 2*Math.PI;

			var thetaV = ( thetaThrow - thetaCatch )/dwellDuration;

			var center = this.pattern.throws[prop.throwIndex].dwellPath[prop.throwHand].center;
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
		//update hand
		prop.throwHand = this.pattern.throws[prop.throwIndex].siteswap % 2 == 0 ? prop.throwHand : (1 - prop.throwHand);
		//get new throw index
		prop.throwIndex = this.throwCounter++ % this.pattern.throws.length;
		//get the new throw/catch times. using the floor so we can always have them be multiples of the beat duration
		prop.throwTime = Math.floor(this.juggleTime/this.pattern.beatDuration)*this.pattern.beatDuration+this.pattern.throws[prop.throwIndex].dwellDuration; 
		prop.catchTime = Math.floor(this.juggleTime/this.pattern.beatDuration)*this.pattern.beatDuration+parseInt(this.pattern.throws[prop.throwIndex].siteswap[0])*this.pattern.beatDuration;

		prop.velocity = this.pattern.getThrowVelocity(prop);
	}

}