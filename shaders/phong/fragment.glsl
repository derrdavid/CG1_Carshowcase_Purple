precision mediump float;
struct Light {
  vec3 position;
  vec3 color;
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
  vec4 texture = texture2D(sampler, fTexCoord); // Artefakt

  vec3 N = normalize(fNormal);
  // Richtungsvektor zur Kamera
  vec3 V = normalize(light.position - fPosition);
  // V entlang der Normalen reflektieren
  vec3 R = normalize(reflect(-V, N));

  vec3 fragColor = mat.ambient * light.color;
  fragColor += mat.diffuse * light.color * max(dot(V, N), 0.0);
  fragColor += mat.specular * light.color * pow(max(dot(R, N), 0.0), mat.shininess);
  gl_FragColor = mix(vec4(fragColor, 1.0), texture, 0.0);
}
