precision mediump float;

uniform samplerCube skybox;

varying vec3 fTexCoord;

void main() {
    //Übergeben der VertexKoordinaten, um Textur auf Cube zu mappen
    gl_FragColor = textureCube(skybox, fTexCoord);
}
