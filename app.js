import { getGlContext, createShaderProgram, createSkybox, createBodyChrome, createBodyPaint, InputHandler, createTyres } from "./libraries/utils.js";
import { Code3x1, Code4x4, Code3x3 } from "./libraries/codeMatrix.js";
// init Scene
//
const canvas = document.getElementById('canvas');
const gl = getGlContext(canvas);
const inputHandler = new InputHandler(0.0, 0.5, 0.0005, 5.0);

const skybox = await createSkybox(gl);
skybox.program = await createShaderProgram(gl, './shaders/skybox/vertex.glsl', './shaders/skybox/fragment.glsl');

const bodyChrome = await createBodyChrome(gl, './assets/body.obj');
bodyChrome.program = await createShaderProgram(gl, './shaders/envmap/vertex.glsl', "./shaders/envmap/fragment.glsl");

const tyres = await createTyres(gl, './assets/tyres.obj');
tyres.program = await createShaderProgram(gl, './shaders/envmap/vertex.glsl', "./shaders/envmap/fragment.glsl");

const bodyPaint = await createBodyPaint(gl);
bodyPaint.program = await createShaderProgram(gl, './shaders/phong/vertex.glsl', "./shaders/phong/fragment.glsl");

// get Locations
//

var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
const projMatrix = new Float32Array(16);
Code4x4.perspective(projMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const loop = function () {
	const angle = performance.now() / 1000;
	const speed = inputHandler.lerpedValue * angle;
	// skybox
	//
	gl.disable(gl.DEPTH_TEST);
	gl.useProgram(skybox.program);

	let matProjUniformLocation = gl.getUniformLocation(skybox.program, 'mProj');
	let matViewUniformLocation = gl.getUniformLocation(skybox.program, 'mView');
	let matWorldUniformLocation = gl.getUniformLocation(skybox.program, 'mWorld');

	Code4x4.lookAt(viewMatrix, [0, 0.5, 5], [0, 0, 0], [Math.sin(inputHandler.lerpedValue / 10), 1, 0]);
	Code4x4.rotate(viewMatrix, viewMatrix, speed / 8, [0, 1, 0]);

	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	skybox.draw();

	// envmap
	//
	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);
	gl.useProgram(bodyChrome.program);

	matProjUniformLocation = gl.getUniformLocation(bodyChrome.program, 'mProj');
	matViewUniformLocation = gl.getUniformLocation(bodyChrome.program, 'mView');
	matWorldUniformLocation = gl.getUniformLocation(bodyChrome.program, 'mWorld');
	let eyeDirUniformLocation = gl.getUniformLocation(bodyChrome.program, 'vEyeDir');
	let useMaskUniformLocation = gl.getUniformLocation(bodyChrome.program, "useMask");

	Code4x4.translate(viewMatrix, viewMatrix, [0, 0, 0]);
	Code4x4.rotate(viewMatrix, viewMatrix, angle / 100, [0.0, 1.0, 0]);
	const invViewMatrix = new Float32Array(9);
	Code3x3.invertFrom4x4(invViewMatrix, viewMatrix);
	const eyeDir = [0, 0, 1];
	Code3x1.multiplyMatrixVector(invViewMatrix, eyeDir);

	gl.uniform1i(useMaskUniformLocation, true);
	gl.uniform3fv(eyeDirUniformLocation, eyeDir);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	bodyChrome.draw();

	// tyres
	//
	gl.useProgram(tyres.program);

	matProjUniformLocation = gl.getUniformLocation(tyres.program, 'mProj');
	matViewUniformLocation = gl.getUniformLocation(tyres.program, 'mView');
	matWorldUniformLocation = gl.getUniformLocation(tyres.program, 'mWorld');
	eyeDirUniformLocation = gl.getUniformLocation(tyres.program, 'vEyeDir');

	worldMatrix = Code4x4.identity(worldMatrix);

	gl.uniform3fv(eyeDirUniformLocation, eyeDir);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	tyres.draw();
	// phong
	//
	gl.useProgram(bodyPaint.program);

	matProjUniformLocation = gl.getUniformLocation(bodyPaint.program, 'mProj');
	matViewUniformLocation = gl.getUniformLocation(bodyPaint.program, 'mView');
	matWorldUniformLocation = gl.getUniformLocation(bodyPaint.program, 'mWorld');

	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	bodyPaint.draw();


	requestAnimationFrame(loop);
	inputHandler.updateLerpedValue();
}
requestAnimationFrame(loop);

