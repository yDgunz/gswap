function Prop(radius, C, throwHand, color, type) {

	/* static attributes */
	this.radius = radius;
	this.C = C; // coefficient of restitution (ie. how bouncy it is)
	this.throwHand = throwHand;
	this.color = color;
	this.active = false;
	this.type = type;

	/* dynamic attributes */
	this.throwIndex = null;
	this.throwTime = null;
	this.catchTime = null;
	this.position = {x: null, y: null, z: null};
	this.velocity = {dx: null, dy: null, dz: null};
	this.rotation = {x: null, y: null, z: null};
	this.rotationVelocity = {dx: null, dy: null, dz: null};

	this.updatePosition = function(dt) {
		// would like to do this with some matrix operations but dont really want to import a vector library if unnecessary		
		this.position.x += this.velocity.dx*dt;
		this.position.y += ( this.velocity.dy*dt + .5*G*dt*dt );
		this.position.z += this.velocity.dz*dt;

		this.velocity.dy += G*dt;

		if(this.position.y-this.radius <= 0 && this.velocity.dy < 0) {
			this.velocity.dy = -this.C*this.velocity.dy;
		}

		this.rotation.x += this.rotationVelocity.dx*dt;
		this.rotation.y += this.rotationVelocity.dy*dt;
		this.rotation.z += this.rotationVelocity.dz*dt;

	}

}