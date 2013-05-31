// Animator environment vars, eventually if Animator is a class these will be fields for it
var colors = [0xff0000, 0x00ff00, 0x0000ff]
var juggler;
var T_s;
var t_last_updated;

// Renderer vars
var camera, scene, renderer;
var meshes, floor;
var juggler_body;

// camera vars
var cam_theta, cam_phi, cam_r;

//mouse vars
var isMouseDown = false, onMouseDownTheta, onMouseDownPhi, onMouseDownPosition;

function get_inputs() {

	var N = document.getElementById("in_N").value;
	var SSWtmp = document.getElementById("in_SSW").value.split(",");
	var SSW = [];
	for (var i = 0; i < SSWtmp.length; i++) {
		SSW.push(SSWtmp[i]);
	}
	var W = parseFloat(document.getElementById("in_W").value);
	var B = parseFloat(document.getElementById("in_B").value);
	var D = parseFloat(document.getElementById("in_D").value);
	var DWELL_R_RIGHT = parseFloat(document.getElementById("in_DWELL_R_RIGHT").value);
	var DWELL_R_LEFT = parseFloat(document.getElementById("in_DWELL_R_LEFT").value);
	var DWELL_TH_CATCH_RIGHT = parseFloat(document.getElementById("in_DWELL_TH_CATCH_RIGHT").value);
	var DWELL_TH_THROW_RIGHT = parseFloat(document.getElementById("in_DWELL_TH_THROW_RIGHT").value);
	var DWELL_TH_CATCH_LEFT = parseFloat(document.getElementById("in_DWELL_TH_CATCH_LEFT").value);
	var DWELL_TH_THROW_LEFT = parseFloat(document.getElementById("in_DWELL_TH_THROW_LEFT").value);
	var DWELL_CCW_RIGHT = document.getElementById("in_DWELL_CCW_RIGHT").value == "1" ? true : false;
	var DWELL_CCW_LEFT = document.getElementById("in_DWELL_CCW_LEFT").value == "1" ? true : false;
	var H = parseFloat(document.getElementById("in_H").value);
	var G = parseFloat(document.getElementById("in_G").value);
	var R = parseFloat(document.getElementById("in_R").value);
	var C = parseFloat(document.getElementById("in_C").value);
	var cam_theta = parseFloat(document.getElementById("in_cam_theta").value);
	var cam_phi = parseFloat(document.getElementById("in_cam_phi").value);
	var cam_r = parseFloat(document.getElementById("in_cam_r").value);
	var T_s = parseFloat(document.getElementById("in_T_s").value);

	// validate inputs
	if (!validate_ssw(N, SSW))
		throw "Invalid siteswap";
	if (D >= B)
		throw "Dwell must be less than beat";
	if (H < 0)
		throw "Height must be > 0";
		
	//return an object of the inputs
	return {
		N: N,
		SSW: SSW,
		W: W,
		B: B,
		D: D,
		DWELL_R_RIGHT: DWELL_R_RIGHT,
		DWELL_R_LEFT: DWELL_R_LEFT,
		DWELL_TH_CATCH_RIGHT: DWELL_TH_CATCH_RIGHT,
		DWELL_TH_THROW_RIGHT: DWELL_TH_THROW_RIGHT,
		DWELL_TH_CATCH_LEFT: DWELL_TH_CATCH_LEFT,
		DWELL_TH_THROW_LEFT: DWELL_TH_THROW_LEFT,
		DWELL_CCW_RIGHT: DWELL_CCW_RIGHT,
		DWELL_CCW_LEFT: DWELL_CCW_LEFT,
		H: H,
		G: G,
		R: R,
		C: C,
		cam_theta: cam_theta,
		cam_phi: cam_phi,
		cam_r: cam_r,
		T_s: T_s
	};

}

function init_renderer() {
	//add the event listeners for mouse interaction
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
	
	onMouseDownPosition = new THREE.Vector2();
	
	// set up the camera and the scene 
	var $container = $('#canvasContainer');
	
	var width = $(window).width(), height = $(window).height();

	camera = new THREE.PerspectiveCamera( 75, width/height, 1, 10000 );
	camera.position.x = cam_r * Math.sin( cam_theta ) * Math.cos( cam_phi );
	camera.position.y = cam_r * Math.sin( cam_phi );
	camera.position.z = cam_r * Math.cos( cam_theta ) * Math.cos( cam_phi );

	camera.lookAt(new THREE.Vector3(0,juggler.H,0));
	
	scene = new THREE.Scene();

	/* set up the meshes */
	meshes = [];
	for (var i = 0; i < juggler.props.length; i++) {
		var mesh = 
			new THREE.Mesh(
				new THREE.SphereGeometry(juggler.R, 10, 10)
				, new THREE.MeshBasicMaterial( { color: colors[i % colors.length], wireframe: true } )
			);
		meshes.push(mesh);
		scene.add(meshes[i]);
	}
	
	
	floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 3, 3), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } ));
	floor.rotation.x += 3*Math.PI/2
	scene.add(floor);
	
	var juggler_body_geometry = new THREE.Geometry();		
	juggler_body_geometry.vertices.push(new THREE.Vector3(0,0,.5)); //base
	juggler_body_geometry.vertices.push(new THREE.Vector3(0,1.5*juggler.H,.5)); //top
	juggler_body_geometry.vertices.push(new THREE.Vector3(.3,1.5*juggler.H,.5)); //shoulder
	juggler_body_geometry.vertices.push(new THREE.Vector3(.4,juggler.H,.5)); //elbow
	juggler_body_geometry.vertices.push(new THREE.Vector3(juggler.W/2,juggler.H,0)); // right hand
	juggler_body_geometry.vertices.push(new THREE.Vector3(.4,juggler.H,.5)); //back elbow
	juggler_body_geometry.vertices.push(new THREE.Vector3(.3,1.5*juggler.H,.5)); //back to shoulder
	juggler_body_geometry.vertices.push(new THREE.Vector3(-.3,1.5*juggler.H,.5)); //other shoulder
	juggler_body_geometry.vertices.push(new THREE.Vector3(-.4,juggler.H,.5)); //other elbow
	juggler_body_geometry.vertices.push(new THREE.Vector3(-juggler.W/2,juggler.H,0)); // left hand
	
	juggler_body = new THREE.Line(juggler_body_geometry, new THREE.LineBasicMaterial({color: 0x000000}));
	scene.add(juggler_body);
	
	/* set up the renderer */
	renderer = new THREE.CanvasRenderer();
	renderer.setSize( width, height );
	
	$container.empty();
	$container.append(renderer.domElement);
}

function init_debugger() {
	//ssw debugger
	for (var i = 0; i < juggler.throw_velocity.length; i++) {
		$('#debug_ssw_header').append("<th id='debug_ssw_header_" + i + "'>" + i + "</th>");
		$('#debug_ssw_dx_left').append("<td id='debug_ssw_dx_left_" + i + "' class='numeric'></td>");
		$('#debug_ssw_dy_left').append("<td id='debug_ssw_dy_left_" + i + "' class='numeric'></td>");
		$('#debug_ssw_dx_right').append("<td id='debug_ssw_dx_right_" + i + "' class='numeric'></td>");
		$('#debug_ssw_dy_right').append("<td id='debug_ssw_dy_right_" + i + "' class='numeric'></td>");
	}
	
	// prop debugger
	for (var i = 0; i < juggler.props.length; i++) {
		$('#debug_prop_header').append("<th id='debug_prop_header_" + i + "'>" + i + "</th>");
		$('#debug_prop_ssw').append("<td id='debug_prop_ssw_" + i + "'></td>");
		$('#debug_prop_t_throw').append("<td id='debug_prop_t_throw_" + i + "' class='numeric'></td>");
		$('#debug_prop_t_catch').append("<td id='debug_prop_t_catch_" + i + "' class='numeric'></td>");
		$('#debug_prop_x').append("<td id='debug_prop_x_" + i + "' class='numeric'></td>");
		$('#debug_prop_y').append("<td id='debug_prop_y_" + i + "' class='numeric'></td>");
		$('#debug_prop_dx').append("<td id='debug_prop_dx_" + i + "' class='numeric'></td>");
		$('#debug_prop_dy').append("<td id='debug_prop_dy_" + i + "' class='numeric'></td>");		
	}
}

function update_debugger() {
	//general
	$('#debug_general_t').text(juggler.t.toFixed(2));
	
	//ssw debugger
	for (var i = 0; i < juggler.throw_velocity.length; i++) {
		$('#debug_ssw_dx_left_' + i).text(juggler.throw_velocity[i][0].dx.toFixed(2));
		$('#debug_ssw_dy_left_' + i).text(juggler.throw_velocity[i][0].dy.toFixed(2));
		$('#debug_ssw_dx_right_' + i).text(juggler.throw_velocity[i][1].dx.toFixed(2));
		$('#debug_ssw_dy_right_' + i).text(juggler.throw_velocity[i][1].dy.toFixed(2));
	}

	// prop debugger
	for (var i = 0; i < juggler.props.length; i++) {
		$('#debug_prop_ssw_' + i).text(juggler.SSW[juggler.props[i].ssw_index]);
		$('#debug_prop_t_throw_' + i).text(juggler.props[i].t_throw.toFixed(2));
		$('#debug_prop_t_catch_' + i).text(juggler.props[i].t_catch.toFixed(2));
		$('#debug_prop_x_' + i).text(juggler.props[i].x.toFixed(2));
		$('#debug_prop_y_' + i).text(juggler.props[i].y.toFixed(2));
		$('#debug_prop_dx_' + i).text(juggler.props[i].dx.toFixed(2));
		$('#debug_prop_dy_' + i).text(juggler.props[i].dy.toFixed(2));
	}
}

// function called by the juggle button
function init() {
	
	// get inputs
	var i = get_inputs();
	
	T_s = i.T_s;
	
	// init juggler
	juggler = new Juggler(i.N, i.SSW, i.W, i.B, i.D, i.H, i.G, i.R, i.C, i.DWELL_R_RIGHT, i.DWELL_R_LEFT, i.DWELL_TH_CATCH_RIGHT, i.DWELL_TH_THROW_RIGHT, i.DWELL_TH_CATCH_LEFT, i.DWELL_TH_THROW_LEFT, i.DWELL_CCW_RIGHT, i.DWELL_CCW_LEFT);
	juggler.init();
	
	t_last_updated = (new Date()).getTime();
	
	// init renderer
	cam_theta = i.cam_theta;
	cam_phi = i.cam_phi;
	cam_r = i.cam_r
	init_renderer();			
	
	// init debugger
	init_debugger();
	update_debugger();
	
	animate();
}

function animate() {
		
	var update_juggler_start = (new Date()).getTime();
	var now = (new Date()).getTime();
	var dt = (now - t_last_updated) * T_s / 1000;
	juggler.update(dt);
	t_last_updated = now;
	var update_juggler_end = (new Date()).getTime();
	
	// update the juggler's props positions
	for (var i = 0; i < juggler.props.length; i++) {
		if (juggler.props[i].active == true) {
			meshes[i].position.x = juggler.props[i].x;
			meshes[i].position.y = juggler.props[i].y;
			meshes[i].rotation.x += .01;
			meshes[i].rotation.y += .01;
		}
	}		

	// update the juggler's hands positions
	juggler_body.geometry.vertices[4].x = juggler.hands[RIGHT].x;
	juggler_body.geometry.vertices[4].y = juggler.hands[RIGHT].y;
	juggler_body.geometry.vertices[9].x = juggler.hands[LEFT].x;
	juggler_body.geometry.vertices[9].y = juggler.hands[LEFT].y;
	
	/* update camera */
	
	camera.position.x = cam_r * Math.sin( cam_theta ) * Math.cos( cam_phi );
	camera.position.y = cam_r * Math.sin( cam_phi );
	camera.position.z = cam_r * Math.cos( cam_theta ) * Math.cos( cam_phi );

	camera.lookAt(new THREE.Vector3(0,juggler.H,0));
	
	var render_start = (new Date()).getTime();
	renderer.render( scene, camera );
	var render_end = (new Date()).getTime();
	
	//update debugger
	update_debugger();
	
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame( animate );
		
}

//got the camera rotation code from: http://www.mrdoob.com/projects/voxels/#A/
function onDocumentMouseDown( event ) {
	isMouseDown = true;
	onMouseDownTheta = cam_theta;
	onMouseDownPhi = cam_phi;
	onMouseDownPosition.x = event.clientX;
	onMouseDownPosition.y = event.clientY;
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	if ( isMouseDown ) {
		cam_theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.01 ) + onMouseDownTheta;
		cam_phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.01 ) + onMouseDownPhi;
	}
}

function onDocumentMouseUp( event ) {
	event.preventDefault();
	isMouseDown = false;
}

function onDocumentMouseWheel( event ) {
	cam_r -= event.wheelDeltaY*.01;
}