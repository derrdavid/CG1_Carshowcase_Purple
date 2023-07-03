import { getGlContext, createShaderProgram, parseOBJ, generateSkyboxTexture, createSkybox, createEnvMap, createPhong, InputHandler } from "./libraries/utils.js";
import { getSkyboxImages } from "./libraries/utils.js";
import { Matrix3, Matrix4, Vector3, toRadian } from './libraries/matrix.js';
import { Code4x4 } from "./libraries/codeMatrix.js";
// init Scene
//
const canvas = document.getElementById('canvas');
const gl = getGlContext(canvas);
const inputHandler = new InputHandler(0.0, 0.5, 0.0005, 5.0);

const imgArray = await getSkyboxImages();
const texture = await generateSkyboxTexture(gl, imgArray);

const skybox = await createSkybox(gl);
skybox.texture = texture;
skybox.program = await createShaderProgram(gl, './shaders/skybox/vertex.glsl', './shaders/skybox/fragment.glsl');

const teapot = await createEnvMap(gl);
teapot.texture = texture;
teapot.program = await createShaderProgram(gl, './shaders/envmap/vertex.glsl', "./shaders/envmap/fragment.glsl");

const phong = await createPhong(gl);
phong.program = await createShaderProgram(gl, './shaders/phong/vertex.glsl', "./shaders/phong/fragment.glsl");

// get Locations
//
const lightPositionUniformLocation = gl.getUniformLocation(phong.program, 'light.position');
const lightColorUniformLocation = gl.getUniformLocation(phong.program, 'light.color');
const lightAmbientUniformLocation = gl.getUniformLocation(phong.program, 'light.ambient');

const mat4 = new Code4x4();
var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
const projMatrix = new Float32Array(16);

// main render-loop
//
mat4.perspective(projMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
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
	mat4.lookAt(viewMatrix, [0, 0.5, 6], [0, 0, 0], [Math.sin(inputHandler.lerpedValue / 10), 1, 0]);
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

	mat4.rotate(viewMatrix, viewMatrix, angle / 100, [0.0, 1.0, 0]);
	const invViewMatrix = new Matrix3;
	invViewMatrix.invertFromMatrix4(viewMatrix);
	const eyeDir = new Vector3(0.0, 0.0, 1.0);
	eyeDir.transform(invViewMatrix);

	matProjUniformLocation = gl.getUniformLocation(teapot.program, 'mProj');
	matViewUniformLocation = gl.getUniformLocation(teapot.program, 'mView');
	matWorldUniformLocation = gl.getUniformLocation(teapot.program, 'mWorld');
	let eyeDirUniformLocation = gl.getUniformLocation(teapot.program, 'uEyeDir');

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

	requestAnimationFrame(loop);
	inputHandler.updateLerpedValue();
}
requestAnimationFrame(loop);

