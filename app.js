/// Initialisiert die Anwendung, indem Shader-Texte und Vertex-Buffer-Objekte geladen werden.
//
async function init() {
    skyboxVertexShaderText = await ((await fetch('./shaders/skybox/vertexSkybox.glsl')).text());
    skyboxFragmentShaderText = await ((await fetch('./shaders/skybox/fragmentSkybox.glsl')).text());
    gouraudVertexShaderText = await ((await fetch('./shaders/gouraud/vertexGouraud.glsl')).text());
    gouraudFragmentShaderText = await ((await fetch('./shaders/gouraud/fragmentGouraud.glsl')).text());
    cubeVbo = await generateCube();
    objVbo = await parseOBJ('./assets/teapot.obj');
}
var InitDemo = async function () {
    /// Initialisiert die Anwendung und holt das WebGL-Kontextobjekt für die Canvas-Oberfläche.
    //
    await init();
    var canvas = document.getElementById('surface');
    var gl = canvas.getContext('webgl');
    if (!gl) {
        gl = canvas.getContext('experimental-webgl');
        alert('your browser does not support WebGl');
    }

    /// Shader-Programme und Objekte initialisieren
    //
    var skyboxProgram = createShaderProgram(gl, skyboxVertexShaderText, skyboxFragmentShaderText);
    var envMapProgram = createShaderProgram(gl, gouraudVertexShaderText, gouraudFragmentShaderText);

    /// Holt die Attribute und Uniform-Locations für die Weltmatrix, die Kameramatrix und die Projektionsmatrix im Skybox-Programm.
    // Skybox Attribute Locations
    var skyboxPositionAttribLocation = gl.getAttribLocation(skyboxProgram, 'vertPosition');

    // EnvMap Attribute Locations
    var envMapPositionAttribLocation = gl.getAttribLocation(envMapProgram, 'vertPosition');
    var envMapColorAttributeLocation = gl.getAttribLocation(envMapProgram, 'vertNormal');
    var envMapPositionAttributeLocation = gl.getAttribLocation(envMapProgram, 'vertPosition');

    // Skybox Uniform Locations
    var skyboxMatWorldUniformLocation = gl.getUniformLocation(skyboxProgram, 'mWorld');
    var skyboxMatViewUniformLocation = gl.getUniformLocation(skyboxProgram, 'mView');
    var skyboxMatProjUniformLocation = gl.getUniformLocation(skyboxProgram, 'mProj');
    var skyboxLocation = gl.getUniformLocation(skyboxProgram, 'skybox');

    // EnvMap Uniform Locations
    var envmapMatWorldUniformLocation = gl.getUniformLocation(envMapProgram, 'mWorld');
    var envmapMatViewUniformLocation = gl.getUniformLocation(envMapProgram, 'mView');
    var envmapMatProjUniformLocation = gl.getUniformLocation(envMapProgram, 'mProj');
    var envmapMatNormalUniformLocation = gl.getUniformLocation(envMapProgram, 'mNormal');

    // Holt die Skybox-Bilder und generiert eine Skybox-Textur im Grafikspeicher.
    var skyboxTextures = getSkyboxImages();
    var skybox = generateSkybox(gl, skyboxTextures);

    gl.useProgram(skyboxProgram);
    // Aktiviert die Textur-Einheit 0, bindet die Skybox-Textur und weist sie der Uniform-Variablen 'skybox' im Skybox-Programm zu.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
    gl.uniform1i(skyboxLocation, 0);

    // Setze Matrizen für World, View und Projection
    var worldMatrix = viewMatrix = projMatrix = new Float32Array(16);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, 0], [0, 0, -1], [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix, (Math.PI / 360) * 90, canvas.width / canvas.height, 0.01, 100);
    gl.uniformMatrix4fv(skyboxMatWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(skyboxMatViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(skyboxMatProjUniformLocation, gl.FALSE, projMatrix);

    // Setze Kameraposition und Fokuspunkt
    const cameraPosition = [0, 0, 0];
    const cameraFocusPoint = glMatrix.vec3.fromValues(0, 0, 1);
    const cameraFocusPointMatrix = glMatrix.mat4.create();
    matrixOp.fromTranslation(cameraFocusPointMatrix, cameraFocusPoint);
    gl.clearColor(0.75, 0.85, 0.8, 1.0);

    /// Main render loop
    //
    var angle = 0;
    var loop = function () {

        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        matrixOp.translate(cameraFocusPointMatrix, cameraFocusPointMatrix, [0, 0, angle]);
        glMatrix.mat4.rotateY(cameraFocusPointMatrix, cameraFocusPointMatrix, Math.PI / 360);
        matrixOp.getTranslation(cameraFocusPoint, cameraFocusPointMatrix);
        matrixOp.lookAt(viewMatrix, cameraPosition, cameraFocusPoint, [0, 1, 0]);

        gl.useProgram(envMapProgram);
        var envMapBufferObject = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(objVbo), gl.STATIC_DRAW);
        gl.uniformMatrix4fv(envmapMatViewUniformLocation, gl.FALSE, viewMatrix);
        var worldMatrixNormal = matrixOp.normalize(worldMatrix);
        gl.uniformMatrix4fv(envmapMatNormalUniformLocation, gl.FALSE, worldMatrixNormal);
        //gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, objVbo.length / 8);

        // skybox
        gl.useProgram(skyboxProgram);
        gl.uniformMatrix4fv(skyboxMatViewUniformLocation, gl.FALSE, viewMatrix);
        var skyboxVertexBufferObject = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(cubeVbo.vertices), gl.STATIC_DRAW);
        var skyboxIndexBufferObject = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVbo.indices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(
            skyboxPositionAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT,
            0);

        gl.enableVertexAttribArray(skyboxPositionAttribLocation);
        gl.drawElements(gl.TRIANGLES, cubeVbo.indices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

};