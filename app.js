import { getGlContext, createShaderProgram, parseOBJ, generateSkyboxTexture, createSkybox, createEnvMap, createPhong, InputHandler, createPlane } from "./libraries/utils.js";
import { getSkyboxImages } from "./libraries/utils.js";
import { Matrix3, Matrix4, Vector3, toRadian } from './libraries/matrix.js';
import { Code3x1, Code4x4 } from "./libraries/codeMatrix.js";
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

const planeEnvMap = await createPlane(gl);
planeEnvMap.texture = texture;
planeEnvMap.program = await createShaderProgram(gl, './shaders/envmap/vertex.glsl', "./shaders/envmap/fragment.glsl");

const carEnvMap = await createEnvMap(gl);
carEnvMap.texture = texture;
carEnvMap.program = await createShaderProgram(gl, './shaders/envmap/vertex.glsl', "./shaders/envmap/fragment.glsl");

const carPaint = await createPhong(gl);
carPaint.program = await createShaderProgram(gl, './shaders/phong/vertex.glsl', "./shaders/phong/fragment.glsl");

// get Locations
//
const lightPositionUniformLocation = gl.getUniformLocation(carPaint.program, 'light.position');
const lightColorUniformLocation = gl.getUniformLocation(carPaint.program, 'light.color');
const lightAmbientUniformLocation = gl.getUniformLocation(carPaint.program, 'light.ambient');
const materialPositionUniformLocation = gl.getUniformLocation(carPaint.program, 'mat.position');
const materialColorUniformLocation = gl.getUniformLocation(carPaint.program, 'mat.color');
const materialAmbientUniformLocation = gl.getUniformLocation(carPaint.program, 'mat.ambient');

const mat4 = new Code4x4();
const vec3 = new Code3x1();
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
	gl.useProgram(carEnvMap.program);

	matProjUniformLocation = gl.getUniformLocation(carEnvMap.program, 'mProj');
	matViewUniformLocation = gl.getUniformLocation(carEnvMap.program, 'mView');
	matWorldUniformLocation = gl.getUniformLocation(carEnvMap.program, 'mWorld');
	const eyeDirUniformLocation = gl.getUniformLocation(carEnvMap.program, 'vEyeDir');

	mat4.translate(viewMatrix, viewMatrix, [-1.5, 0, 0]);
	mat4.rotate(viewMatrix, viewMatrix, angle / 100, [0.0, 1.0, 0]);

	// ! KRITISCHE CODESTELLE
	const invViewMatrix = new Matrix3;
	invViewMatrix.invertFromMatrix4(viewMatrix);
	const eyeDir = [0, 0, 1];
	vec3.multiplyMatrixVector(invViewMatrix, eyeDir);
	// !!!!
	gl.uniform3fv(eyeDirUniformLocation, eyeDir);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	carEnvMap.draw();
	// phong
	//
	gl.useProgram(carPaint.program);

	matProjUniformLocation = gl.getUniformLocation(carPaint.program, 'mProj');
	matViewUniformLocation = gl.getUniformLocation(carPaint.program, 'mView');
	matWorldUniformLocation = gl.getUniformLocation(carPaint.program, 'mWorld');

	worldMatrix = mat4.identity(worldMatrix);

	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	gl.uniform3f(lightPositionUniformLocation, 1.0, 1.0, 0.0);
	gl.uniform3f(lightColorUniformLocation, 0.5, 0.5, 0.5);
	gl.uniform3f(lightAmbientUniformLocation, 0.2, 0.2, 0.2);

	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	carPaint.draw();

	// plane
	//
	/** 
	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);
	gl.useProgram(planeEnvMap.program);

	mat4.rotate(viewMatrix, viewMatrix, -45, [0.0, 1.0, 0]);
	mat4.translate(viewMatrix, viewMatrix, [4, 0, 0]);
	const planeInvViewMatrix = new Matrix3;
	planeInvViewMatrix.invertFromMatrix4(viewMatrix);
	const planeEyeDir = new Vector3(0.0, 0.0, 1.0);
	//planeEyeDir.transform(planeInvViewMatrix);
	transform(planeEyeDir,planeInvViewMatrix)

	matProjUniformLocation = gl.getUniformLocation(planeEnvMap.program, 'mProj');
	matViewUniformLocation = gl.getUniformLocation(planeEnvMap.program, 'mView');
	matWorldUniformLocation = gl.getUniformLocation(planeEnvMap.program, 'mWorld');
	let planeEyeDirUniformLocation = gl.getUniformLocation(planeEnvMap.program, 'uEyeDir');

	gl.uniform3fv(planeEyeDirUniformLocation, planeEyeDir);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	planeEnvMap.draw();
	*/
	requestAnimationFrame(loop);
	inputHandler.updateLerpedValue();
}
requestAnimationFrame(loop);

