export default function CameraText(scene) {

  var planeGeometry = new THREE.CubeGeometry( 400, 200, 1, 1 );
	finalRenderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );
	var planeMaterial = new THREE.MeshBasicMaterial( { map: finalRenderTarget } );
	var plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.position.set(0,100,-500);
	scene.add(plane);

  return (
    <div>CameraText</div>
  )
}

function update() {
  // update the texture camera's position and look direction
	var relativeCameraOffset = new THREE.Vector3(0,0,1);
	var cameraOffset = MovingCube.matrixWorld.multiplyVector3( relativeCameraOffset );
	textureCamera.position.x = cameraOffset.x;
	textureCamera.position.y = cameraOffset.y;
	textureCamera.position.z = cameraOffset.z;
	var relativeCameraLookOffset = new THREE.Vector3(0,0,-1);
	var cameraLookOffset = relativeCameraLookOffset.applyMatrix4( MovingCube.matrixWorld );
	textureCamera.lookAt( cameraLookOffset );
}

function render() {
	renderer.render( scene, textureCamera, firstRenderTarget, true );
}