//got the camera rotation code from: http://www.mrdoob.com/projects/voxels/#A/

// Animator environment vars, eventually if Animator is a class these will be fields for it
var colors = [0xff0000, 0x00ff00, 0x0000ff]
var juggler;
var T_s;
var startTime;

// Renderer vars
var camera, scene, renderer;
var meshes, floor;
var juggler_body;

// camera vars
var cam_theta, cam_phi, cam_r;

//mouse vars
var isMouseDown = false, onMouseDownTheta, onMouseDownPhi, onMouseDownPosition;

// temp camera vars for demo
var cam_r_dir = true;

function animate() {
	
	var t = ((new Date()).getTime()-startTime)/1000*T_s;//-startTime;
	
	var update_juggler_start = (new Date()).getTime();
	juggler.update_juggler(t);	
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
	
	//this is in case you want to auto rotate
	/*
	cam_theta += .002;
	if (cam_r_dir == true && cam_r > 6)
		cam_r_dir = false;
	
	if (cam_r_dir == false && cam_r < 2)
		cam_r_dir = true;
		
	if (cam_r_dir == true)
		cam_r += .003;
	else
		cam_r -= .003;
	*/
	
	camera.position.x = cam_r * Math.sin( cam_theta ) * Math.cos( cam_phi );
    camera.position.y = cam_r * Math.sin( cam_phi );
    camera.position.z = cam_r * Math.cos( cam_theta ) * Math.cos( cam_phi );

	camera.lookAt(new THREE.Vector3(0,juggler.H,0));
	
	var render_start = (new Date()).getTime();
	renderer.render( scene, camera );
	var render_end = (new Date()).getTime();
	
	$('#statsContainer').find('#update_juggler_time').text(update_juggler_end-update_juggler_start);
	$('#statsContainer').find('#render_time').text(render_end-render_start);
	
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame( animate );
	
}

// function called by the GO button
function start_juggling() {
	
	startTime = (new Date()).getTime();
	
	var N = document.getElementById("in_N").value;
	var SSWtmp = document.getElementById("in_SSW").value.split(",");
	var SSW = [];
	for (var i = 0; i < SSWtmp.length; i++) {
		SSW.push(SSWtmp[i]);
	}
	var W = parseFloat(document.getElementById("in_W").value);
	var B = parseFloat(document.getElementById("in_B").value);
	var D = parseFloat(document.getElementById("in_D").value);
	var D_R_r = parseFloat(document.getElementById("in_D_R_r").value);
	var D_R_l = parseFloat(document.getElementById("in_D_R_l").value);
	var D_TH_c_r = parseFloat(document.getElementById("in_D_TH_c_r").value);
	var D_TH_t_r = parseFloat(document.getElementById("in_D_TH_t_r").value);
	var D_TH_c_l = parseFloat(document.getElementById("in_D_TH_c_l").value);
	var D_TH_t_l = parseFloat(document.getElementById("in_D_TH_t_l").value);
	var H = parseFloat(document.getElementById("in_H").value);
	var G = parseFloat(document.getElementById("in_G").value);
	var R = parseFloat(document.getElementById("in_R").value);
	var D_TH_dir_r = parseInt(document.getElementById("in_D_TH_dir_r").value);
	var D_TH_dir_l = parseInt(document.getElementById("in_D_TH_dir_l").value);
	var C = parseFloat(document.getElementById("in_C").value);
	cam_theta = parseFloat(document.getElementById("in_cam_theta").value);
	cam_phi = parseFloat(document.getElementById("in_cam_phi").value);
	cam_r = parseFloat(document.getElementById("in_cam_r").value);

	//create validation error messages
	validation_msgs = [];
	if (!validate_ssw(N, SSW))
		validation_msgs.push("Invalid siteswap");
	if (D >= B)
		validation_msgs.push("Dwell must be less than beat");
	if (H < 0)
		validation_msgs.push("Height must be > 0");

	//if there are no validation errors, initialize the juggler and renderer
	if (validation_msgs.length > 0) {
		validation_html = "";
		for (i = 0; i < validation_msgs.length; i++)
			validation_html += (validation_msgs[i] + "<br/>");
		document.getElementById("validationMsgs").innerHTML = validation_html;
	} else {
	
		/* add mouse handlers */
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'mouseup', onDocumentMouseUp, false );
		document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
	
		onMouseDownPosition = new THREE.Vector2();
	
		/* init juggler */
	
		juggler = new Juggler(N, SSW, W, B, D, D_R_r, D_R_l, D_TH_c_r, D_TH_t_r, D_TH_c_l, D_TH_t_l, H, G, R, D_TH_dir_r, D_TH_dir_l, C);
		
		W_j = parseFloat(document.getElementById("in_W_j").value);
		T_s = parseFloat(document.getElementById("in_T_s").value);
		
		juggler.init_juggler();
		
		/* init renderer */
		
		/* set up the camera and the scene */
		var $container = $('#canvasContainer');
		
		var width = $(window).width(), height = $(window).height();

		camera = new THREE.PerspectiveCamera( 75, width/height, 1, 10000 );
		camera.position.x = cam_r * Math.sin( cam_theta ) * Math.cos( cam_phi );
        camera.position.y = cam_r * Math.sin( cam_phi );
        camera.position.z = cam_r * Math.cos( cam_theta ) * Math.cos( cam_phi );

		camera.lookAt(new THREE.Vector3(0,H,0));
		
		scene = new THREE.Scene();

		/* set up the meshes */
		meshes = [];
		for (var i = 0; i < juggler.props.length; i++) {
			var mesh = 
				new THREE.Mesh(
					new THREE.SphereGeometry(R, 10, 10)
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
		juggler_body_geometry.vertices.push(new THREE.Vector3(0,1.5*H,.5)); //top
		juggler_body_geometry.vertices.push(new THREE.Vector3(.3,1.5*H,.5)); //shoulder
		juggler_body_geometry.vertices.push(new THREE.Vector3(.4,H,.5)); //elbow
		juggler_body_geometry.vertices.push(new THREE.Vector3(W/2,H,0)); // right hand
		juggler_body_geometry.vertices.push(new THREE.Vector3(.4,H,.5)); //back elbow
		juggler_body_geometry.vertices.push(new THREE.Vector3(.3,1.5*H,.5)); //back to shoulder
		juggler_body_geometry.vertices.push(new THREE.Vector3(-.3,1.5*H,.5)); //other shoulder
		juggler_body_geometry.vertices.push(new THREE.Vector3(-.4,H,.5)); //other elbow
		juggler_body_geometry.vertices.push(new THREE.Vector3(-W/2,H,0)); // left hand
		
		juggler_body = new THREE.Line(juggler_body_geometry, new THREE.LineBasicMaterial({color: 0x000000}));
		scene.add(juggler_body);
		
		/* set up the renderer */
		renderer = new THREE.CanvasRenderer();
		renderer.setSize( width, height );
		
		$container.empty();
		$container.append(renderer.domElement);			
		
		animate();
	}
}

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