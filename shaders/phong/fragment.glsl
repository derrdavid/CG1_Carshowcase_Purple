precision mediump float;
struct Light {
  vec3 position;
  vec3 color;
  vec3 ambient;
};
struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
};

uniform Light light;
uniform Material mat;
uniform sampler2D sampler;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec2 fTexCoord;

void main() {
  vec4 texture = texture2D(sampler, fTexCoord);
  if(length(texture.rgb) >= 0.0) {
    discard;
  }
  vec3 N = normalize(fNormal);
  vec3 V = normalize(light.position - fPosition);
  vec3 R = normalize(reflect(-light.position,N));

  vec3 fragColor = mat.ambient * light.ambient;
  fragColor += mat.diffuse * light.color * max(dot(light.position, N), 0.0);
  fragColor += mat.specular * light.color * pow(max(dot(N, R), 0.0), mat.shininess);
  gl_FragColor = mix(vec4(fragColor,1.0), texture, 0.0);
}
