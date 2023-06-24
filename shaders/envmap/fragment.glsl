precision mediump float;

uniform samplerCube skybox;
uniform vec3 uEyeDir;

varying vec3 fNormal;
void main()
{
  vec3 eyeDir = normalize(uEyeDir);
  vec3 normalDir = normalize(fNormal);
  vec3 reflection = textureCube(skybox, reflect(-eyeDir, normalDir)).rgb;
  gl_FragColor =  vec4(reflection, 1.0);
}
