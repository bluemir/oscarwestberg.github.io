// Initialize THREE.js
// https://github.com/mrdoob/three.js
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 200 );
var renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

// Initialize global variables
var planetGeometry = new THREE.SphereGeometry( 1, 60, 60);
var sunGeometry = new THREE.SphereGeometry( 1, 40, 40);
var orbitGeometry = new THREE.TorusGeometry(10, 0.01, 16, 100);

var clock = new THREE.Clock();
var sunPos = new THREE.Vector3(0, 0, 10);

var ambientLight = new THREE.Vector4(0.1,0.1,0.1,1);
var ambientMaterial = new THREE.Vector4(222/255,184/255,135/255,1);
var diffuseLight = new THREE.Vector4(0.9, 0.8, 0.3, 1.0);
var diffuseMaterial = new THREE.Vector4(245/255,245/255,220/255,1);
var fallof = new THREE.Vector3(0.01,0.01,0.01);
var sealevel = 0.1;

// Initialize statistics
// https://github.com/mrdoob/stats.js
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

// Load shaders
// https://github.com/codecruzer/webgl-shader-loader-js
SHADER_LOADER.load(
    function (data)
    {
    	uniforms = {
		    time: { type: "f", value: 0 },//,
		    level: { type: "f", value: 6},
		    sunPos: {type: "v3", value: sunPos},
		    ambientLight: {type: "v4", value: ambientLight},
		    ambientMaterial: {type: "v4", value: ambientMaterial},
		    diffuseLight: {type: "v4", value: diffuseLight},
		    diffuseMaterial: {type: "v4", value: diffuseMaterial},
		    fallof: {type: "v3", value: fallof},
		    sealevel: {type: "f", value: sealevel}
		};

        var vShader = data.shader.vertex;
        var fShader = data.shader.fragment;

        planetShader = new THREE.ShaderMaterial({
        	uniforms: 		uniforms,
		    vertexShader:   vShader,
		    fragmentShader: fShader
		});

		uniformsSun = {
			diffuseLight: {type: "v4", value : diffuseLight},
			lengthCamSun: {type: "f", value : camera.position.distanceTo(sunPos)}
		}

		var vShaderSun = data.shaderSun.vertex;
        var fShaderSun = data.shaderSun.fragment;

        sunShader = new THREE.ShaderMaterial({
        	uniforms: 		uniformsSun,
		    vertexShader:   vShaderSun,
		    fragmentShader: fShaderSun
		});

		initialize();
    }
);

function initialize() {
	// Load mesh
	planetMesh = new THREE.Mesh(planetGeometry, planetShader);
	sunMesh = new THREE.Mesh(sunGeometry, sunShader);
	orbitMesh = new THREE.Mesh(orbitGeometry);

	// Add meshes
	scene.add( planetMesh );
	scene.add( sunMesh );
	//scene.add( orbitMesh );

	// Alter meshes 
	sunMesh.scale.set(2,2,2);
	sunMesh.position.set(sunPos.x,sunPos.y,sunPos.z);
	//orbitMesh.position.set(sunPos.x,sunPos.y,sunPos.z);
	//orbitMesh.rotateOnAxis(new THREE.Vector3(1,0,0).normalize(), 1.55);

	// Handle user controls
	// https://threejsdoc.appspot.com/doc/three.js/src.source/extras/controls/TrackballControls.js.html
	controls = new THREE.TrackballControls( camera );
	controls.target.set( 0, 0, 0 );
	controls.minDistance = 5.0;
	controls.maxDistance = 105;
	controls.zoomSpeed = 0.05;
	controls.rotateSpeed = 0.05;
	camera.position.z = 6;

	render();
};


function render() {
	stats.begin();

	// Update planet uniforms
	var delta = clock.getDelta();
	uniforms.time.value += delta;
	uniforms.level.value = camera.position.length();

	// Update sun uniforms
	uniformsSun.lengthCamSun.value = camera.position.distanceTo(sunPos);

	// Update world
	planetMesh.rotation.y += delta * 0.08;
	controls.update();
	renderer.render( scene, camera );
	stats.end();
	//document.getElementById("value").innerHTML = camera.position.length() + "      " + camera.position.distanceTo(sunPos);

	// Call render again
	requestAnimationFrame( render );
};

// Update window if resized
$(window).resize(function( event ) {
	renderer.setSize( window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});



