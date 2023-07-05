precision mediump float;

uniform samplerCube skybox;
uniform sampler2D sampler;

varying vec3 fN;
varying vec2 fTexCoord;
varying vec3 fEyeDir;
void main() {
  vec4 texture = texture2D(sampler, fTexCoord);
/**
  if(length(texture.rgb) >= 0.5) {
    discard;
  }
  */

  vec3 V = normalize(fEyeDir);
  vec3 N = normalize(fN);
  vec3 R = normalize(reflect(-V, N));
  vec4 reflection = textureCube(skybox, R);

  vec3 mixedColor = mix(reflection.rgb, texture.rgb, 0.1);
  gl_FragColor = vec4(mixedColor, 1.0);
}
