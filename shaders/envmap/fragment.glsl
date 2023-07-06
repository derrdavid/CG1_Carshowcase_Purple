precision mediump float;

uniform samplerCube skybox;
uniform sampler2D textureSampler;
uniform sampler2D maskSampler;

varying vec3 fN;
varying vec2 fTexCoord;
varying vec3 fEyeDir;
void main() {
  vec4 texture = texture2D(textureSampler, fTexCoord);
  vec4 mask = texture2D(maskSampler, fTexCoord);

  float opacity = 0.7;
  if(length(mask.rgb) <= 0.0) {
    opacity = 1.0;
  }

  vec3 V = normalize(fEyeDir);
  vec3 N = normalize(fN);
  vec3 R = normalize(reflect(-V, N));
  vec4 reflection = textureCube(skybox, R);

  vec3 mixedColor = mix(reflection.rgb, texture.rgb, 0.2);
  gl_FragColor = vec4(mixedColor, opacity);
}
