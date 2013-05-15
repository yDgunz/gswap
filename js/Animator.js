// Animator environment vars, eventually if Animator is a class these will be fields for it
var colors = [0xff0000, 0x00ff00, 0x0000ff]
var juggler;
var T_s;
var startTime;

// Renderer vars
var camera, scene, renderer;
var meshes, floor;

// camera vars
var cam_theta, cam_phi, cam_r;

// temp camera vars for demo
var cam_r_dir = true;

function animate() {
	
	var t = ((new Date()).getTime()-startTime)/1000*T_s;//-startTime;
	
	var update_juggler_start = (new Date()).getTime();
	juggler.update_juggler(t);	
	var update_juggler_end = (new Date()).getTime();
	
	
	// draw all the juggler's props
	for (var i = 0; i < juggler.props.length; i++) {
		if (juggler.props[i].active == true) {
			meshes[i].position.x = juggler.props[i].x;
			meshes[i].position.y = juggler.props[i].y;
			meshes[i].rotation.x += .01;
			meshes[i].rotation.y += .01;
		}
	}		


	
	/* update camera */
	cam_theta += .002;
	if (cam_r_dir == true && cam_r > 6)
		cam_r_dir = false;
	
	if (cam_r_dir == false && cam_r < 2)
		cam_r_dir = true;
		
	if (cam_r_dir == true)
		cam_r += .003;
	else
		cam_r -= .003;
	
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
		
		
		floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 2, 2), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } ));
		floor.rotation.x += 3*Math.PI/2
		scene.add(floor);
		
		/* set up the renderer */
		renderer = new THREE.CanvasRenderer();
		renderer.setSize( width, height );
		
		$container.empty();
		$container.append(renderer.domElement);			
		
		animate();
	}
}