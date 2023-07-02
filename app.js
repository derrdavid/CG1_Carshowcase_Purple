import { createPlane, getGlContext, createShaderProgram, parseOBJ, generateSkyboxTexture, createSkybox, createTeapot, createPhong } from "./libraries/utils.js";
import { getSkyboxImages } from "./libraries/utils.js";
import { Matrix3, Matrix4, Vector3, toRadian } from './libraries/matrix.js';
import { Mat4 } from "./libraries/codeMatrix.js";
// handle Tastatureingabe
// 
let lerpedValue = 0.0;
let targetValue = 0.5;
let lerpSpeed = 0.0005;
let maxSpeed = 5;
document.addEventListener('keydown', function (event) {
	if (event.keyCode == 37) {
		// links
		targetValue -= 0.01;

	} else if (event.keyCode == 39) {
		// rechts
		targetValue += 0.01;
	}
});
function updateLerpedValue() {
	if (lerpedValue >= maxSpeed) {
		lerpedValue = maxSpeed;
	} else if (lerpedValue <= -maxSpeed) {
		lerpedValue = -maxSpeed;
	}
	lerpedValue = lerp(lerpedValue, targetValue, lerpSpeed);
	if (Math.abs(lerpedValue - targetValue) > 0.01) {
		requestAnimationFrame(updateLerpedValue);
	}
}
function lerp(a, b, t) {
	return a * (1 - t) + b * t;
}

// init Scene
//
const canvas = document.getElementById('canvas');
const gl = getGlContext(canvas);

const imgArray = await getSkyboxImages();
const texture = await generateSkyboxTexture(gl, imgArray);

const skybox = await createSkybox(gl);
skybox.texture = texture;
skybox.program = await createShaderProgram(gl, './shaders/skybox/vertex.glsl', './shaders/skybox/fragment.glsl');

const teapot = await createTeapot(gl);
teapot.texture = texture;
teapot.program = await createShaderProgram(gl, './shaders/envmap/vertex.glsl', "./shaders/envmap/fragment.glsl");

const phong = await createPhong(gl);
phong.program = await createShaderProgram(gl, './shaders/phong/vertex.glsl', "./shaders/phong/fragment.glsl");

const plane = await createPlane(gl);
plane.program = await createShaderProgram(gl, './shaders/phong/vertex.glsl', "./shaders/phong/fragment.glsl");

// get Locations
//
const lightPositionUniformLocation = gl.getUniformLocation(phong.program, 'light.position');
const lightColorUniformLocation = gl.getUniformLocation(phong.program, 'light.color');
const lightAmbientUniformLocation = gl.getUniformLocation(phong.program, 'light.ambient');

const lightPlanePositionUniformLocation = gl.getUniformLocation(plane.program, 'light.position');
const lightPlaneColorUniformLocation = gl.getUniformLocation(plane.program, 'light.color');
const lightPlaneAmbientUniformLocation = gl.getUniformLocation(plane.program, 'light.ambient');

var worldMatrix = new Matrix4();
var viewMatrix = new Matrix4();
const projMatrix = new Matrix4();
const mat4 = new Mat4();
mat4.perspective(projMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

// main render-loop
//
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
const loop = function () {
	const angle = performance.now() / 1000;
	const speed = lerpedValue * angle;
	// skybox
	//
	gl.disable(gl.DEPTH_TEST);
	gl.useProgram(skybox.program);

	let matProjUniformLocation = gl.getUniformLocation(skybox.program, 'mProj');
	let matViewUniformLocation = gl.getUniformLocation(skybox.program, 'mView');
	let matWorldUniformLocation = gl.getUniformLocation(skybox.program, 'mWorld');

	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 3, 10], [0, 0, 0], [0, 1, 0]);
	mat4.rotate(viewMatrix, viewMatrix, speed / 8, [0, 1, 0]);

	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	skybox.draw();
	// envmap
	//
	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);

	gl.useProgram(teapot.program);

	const invViewMatrix = new Matrix3;
	invViewMatrix.invertFromMatrix4(viewMatrix);
	const eyeDir = new Vector3(1.0, 1.0, 1.0);
	eyeDir.transform(invViewMatrix);
	worldMatrix = mat4.identity(worldMatrix);
	mat4.scale(viewMatrix, viewMatrix, [2, 2, 2]);
	mat4.translate(viewMatrix, viewMatrix, [0, 0, 0]);

	let eyeDirUniformLocation = gl.getUniformLocation(teapot.program, 'uEyeDir');
	matProjUniformLocation = gl.getUniformLocation(teapot.program, 'mProj');
	matViewUniformLocation = gl.getUniformLocation(teapot.program, 'mView');
	matWorldUniformLocation = gl.getUniformLocation(teapot.program, 'mWorld');

	gl.uniform3fv(eyeDirUniformLocation, eyeDir);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	teapot.draw();
	// phong
	//
	gl.useProgram(phong.program);

	matProjUniformLocation = gl.getUniformLocation(phong.program, 'mProj');
	matViewUniformLocation = gl.getUniformLocation(phong.program, 'mView');
	matWorldUniformLocation = gl.getUniformLocation(phong.program, 'mWorld');

	worldMatrix = mat4.identity(worldMatrix);

	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	gl.uniform3f(lightPositionUniformLocation, 1.0, 1.0, 0.0);
	gl.uniform3f(lightColorUniformLocation, 1.0, 1.0, 1.0);
	gl.uniform3f(lightAmbientUniformLocation, 0.2, 0.2, 0.2);

	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	phong.draw();
	/*
		gl.useProgram(plane.program);
		const matPlaneProjUniformLocation = gl.getUniformLocation(plane.program, 'mProj');
		gl.uniformMatrix4fv(matPlaneProjUniformLocation, gl.FALSE, projMatrix);
		viewMatrix.scale([3.0, 0.1, 3.0]);
		//viewMatrix.translate(new Vector3(0.0, -7, 0.0));
		viewMatrix = new Mat4().translate(viewMatrix, viewMatrix, [1.0, 1.0, 1.0]);
		const matPlaneViewUniformLocation = gl.getUniformLocation(plane.program, 'mView');
		gl.uniformMatrix4fv(matPlaneViewUniformLocation, gl.FALSE, viewMatrix);
		const matPlaneWorldUniformLocation = gl.getUniformLocation(plane.program, 'mWorld');
		gl.uniformMatrix4fv(matPlaneWorldUniformLocation, gl.FALSE, worldMatrix);
	
		gl.uniform3f(lightPlanePositionUniformLocation, 1.0, 1.0, 0.0);
		gl.uniform3f(lightPlaneColorUniformLocation, 1.0, 1.0, 1.0);
		gl.uniform3f(lightPlaneAmbientUniformLocation, 0.2, 0.2, 0.2);
	
		gl.uniformMatrix4fv(matPlaneViewUniformLocation, gl.FALSE, viewMatrix);
		plane.draw();
	**/
	requestAnimationFrame(loop);
	updateLerpedValue();


}
requestAnimationFrame(loop);

