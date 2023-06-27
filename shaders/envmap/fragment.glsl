precision mediump float;

uniform samplerCube skybox;
uniform vec3 uEyeDir;

varying vec3 fNormal;
varying vec2 fragTexCoord;
uniform sampler2D sampler;
void main() {
  vec4 texture = texture2D(sampler, fragTexCoord);
  vec3 eyeDir = normalize(uEyeDir);
  vec3 normalDir = normalize(fNormal);
  vec3 reflection = textureCube(skybox, reflect(-eyeDir, normalDir)).rgb;

  if(length(texture.rgb) < 0.5) {
    discard;
  }
  gl_FragColor = vec4(reflection, 1.0) * texture;
}
