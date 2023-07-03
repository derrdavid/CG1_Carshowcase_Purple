precision mediump float;

struct MaterialParams {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
};

struct LightParams {
  vec3 position;
  vec3 color;
  vec3 ambient;
};

uniform MaterialParams mat;
uniform LightParams light;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec2 fTexCoord;

uniform sampler2D sampler;

void main() {
  vec3 L = normalize(light.position - fPosition);
  vec3 N = normalize(fNormal);
  vec3 V = vec3(-0.5, 0.5, 0.0);

  vec4 texture = texture2D(sampler, fTexCoord);
  if(length(texture.rgb) < 0.5) {
    discard;
  }

  vec3 color = mat.ambient * light.ambient;
  color += mat.diffuse * light.color * max(dot(N, L), 0.0);
  color += mat.specular * light.color * pow(max(dot(reflect(-L, N), V), 0.0), mat.shininess);
  gl_FragColor = vec4(color, 0.5) * texture;
}
