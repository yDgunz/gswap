//general
var timeScale = 1;

// 2D rendering var
var canvas;
var viewportHeight = 3

// Renderer vars
var renderMode;

var camera, scene, renderer;
var meshes, floor;

// camera vars
var camTheta = 2.5, camPhi = .4, camRadius = 3;

//mouse vars
var isMouseDown = false, onMouseDownTheta, onMouseDownPhi, onMouseDownPosition;

var juggler, lastUpdatedTime;

function go() {
	
	renderMode = $('input:radio[name=renderMode]:checked').val();

	juggler = new Juggler($('#siteswap').val());
	juggler.init();

	lastUpdatedTime = 0;

	animate();
}

function zoom(zoomIn) {
	viewportHeight += ( zoomIn ? -.1 : .1);
	camRadius += ( zoomIn ? -.1 : .1);
}

function adjustSpeed(slowDown) {
	timeScale += (slowDown ? -.1 : .1);
}

function drawScene2D(juggler) {
	
	if (lastUpdatedTime == 0) {
		var $container = $('#canvasContainer');
		$container.empty();
		$container.append('<canvas id="myCanvas"></canvas>')[0];
		canvas = $('#myCanvas')[0]
	}

	canvas.height = $(window).height();
	canvas.width = $('#canvasContainer').width();
	var context = canvas.getContext('2d');

	// clear
	context.clearRect(0, 0, canvas.width, canvas.height);

	// update
	var scale = canvas.height/viewportHeight;

	juggler.props.map(function(prop) {
		if (prop.active) {
			context.beginPath();
			context.arc(canvas.width/2+prop.position.x*scale,canvas.height-prop.position.y*scale,prop.radius*scale,0,2*Math.PI);
			context.fillStyle = prop.color;
			context.fill();
		}
	});

}

function drawScene3D(juggler) {
	if (lastUpdatedTime == 0) {

		var $container = $('#canvasContainer');
		var width = $('#canvasContainer').width(), height = $(window).height();;

		camera = new THREE.PerspectiveCamera( 75, width / height, 1, 10000 );
		camera.position.x = camRadius * Math.sin( camTheta ) * Math.cos( camPhi );
		camera.position.y = camRadius * Math.sin( camPhi );
		camera.position.z = camRadius * Math.cos( camTheta ) * Math.cos( camPhi );

		camera.lookAt(new THREE.Vector3(0,1,0));

		scene = new THREE.Scene();

		meshes = [];
		juggler.props.map(function(prop) {

			mesh = new THREE.Mesh( new THREE.SphereGeometry( prop.radius ), 
				new THREE.MeshBasicMaterial( { color: prop.color, wireframe: true } ) );

			mesh.position.x = prop.position.x;
			mesh.position.y = prop.position.y;
			mesh.position.z = prop.position.z;

			scene.add( mesh );
			meshes.push(mesh);

		});

		floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 3, 3), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } ));
		floor.rotation.x += 3*Math.PI/2
		scene.add(floor);

		renderer = new THREE.CanvasRenderer();
		renderer.setSize( width, height );

		$container.empty();
		$container.append(renderer.domElement);

		//add the event listeners for mouse interaction
		renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
		renderer.domElement.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
		
		onMouseDownPosition = new THREE.Vector2();

	} else {

		//update prop positions
		for (var i = 0; i < juggler.props.length; i++) {
			meshes[i].position.x = juggler.props[i].position.x;
			meshes[i].position.y = juggler.props[i].position.y;
			meshes[i].position.z = juggler.props[i].position.z;
			meshes[i].rotation.x += .01;
			meshes[i].rotation.y += .01;
		}	

		///update camera
		camera.position.x = camRadius * Math.sin( camTheta ) * Math.cos( camPhi );
		camera.position.y = camRadius * Math.sin( camPhi );
		camera.position.z = camRadius * Math.cos( camTheta ) * Math.cos( camPhi );

		camera.lookAt(new THREE.Vector3(0,1,0));	
		
		
	
	}

	renderer.render( scene, camera );

}

function animate() {	

	var now = (new Date()).getTime();
	var dt = (now - lastUpdatedTime) / 1000 * timeScale;

	if (dt > .05) {
		dt = .05;
	}

	juggler.update(dt);

	if (renderMode == '2D') {
		drawScene2D(juggler);
	} else if (renderMode == '3D') {
		drawScene3D(juggler);
	}

	lastUpdatedTime = now;

	requestAnimationFrame(function() { animate(); });	
	
}

//got the camera rotation code from: http://www.mrdoob.com/projects/voxels/#A/
function onDocumentMouseDown( event ) {
	isMouseDown = true;
	onMouseDownTheta = camTheta;
	onMouseDownPhi = camPhi;
	onMouseDownPosition.x = event.clientX;
	onMouseDownPosition.y = event.clientY;
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	if ( isMouseDown ) {
		camTheta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.01 ) + onMouseDownTheta;
		
		var dy = event.clientY - onMouseDownPosition.y;
		//TODO: update this so the camera can't cross the pole
		camPhi = ( ( dy ) * 0.01 ) + onMouseDownPhi;
	}
}

function onDocumentMouseUp( event ) {
	event.preventDefault();
	isMouseDown = false;
}

function onDocumentMouseWheel( event ) {
	camRadius -= event.wheelDeltaY*.01;
}