// Animator environment vars, eventually if Animator is a class these will be fields for it
var colors = [0xff0000, 0x00ff00, 0x0000ff]
var juggler;
var T_s;

// Renderer vars
var camera, scene, renderer;
var meshes, floor;

function animate() {

	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame( animate );

	var t = ((new Date()).getTime()-startTime)/1000*T_s;//-startTime;
	
	juggler.update_juggler(t);

	// draw all the juggler's props
	for (var i = 0; i < juggler.props.length; i++) {
		if (juggler.props[i].active == true) {
			meshes[i].position.x = juggler.props[i].x;
			meshes[i].position.y = juggler.props[i].y;
			meshes[i].rotation.x += .01;
			meshes[i].rotation.y += .01;
		}
	}		
	
	renderer.render( scene, camera );

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
	var cam_x = parseFloat(document.getElementById("in_cam_x").value);
	var cam_y = parseFloat(document.getElementById("in_cam_y").value);
	var cam_z = parseFloat(document.getElementById("in_cam_z").value);

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
		
		var width = $container.width(), height = $(window).height();

		camera = new THREE.PerspectiveCamera( 75, width/height, 1, 10000 );
		camera.position.x = cam_x;
		camera.position.y = cam_y;
		camera.position.z = cam_z;

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
		
		floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 20, 20), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } ));
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