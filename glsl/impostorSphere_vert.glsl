uniform float time;
uniform float size;
uniform float scale;
uniform vec3 numbers;
attribute vec2 value;

varying float vSize;
varying vec4 mvPosition;
varying vec2 vValue;
varying mat4 vModelViewMatrix;
varying mat4 vProjectionMatrix;

#include <clipping_planes_pars_vertex>
#include <common>


mat4 rotatez(float theta) {
  float c = cos(theta);
  float s = sin(theta);
  mat4 rz = mat4(c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
                 0.0, 1.0);
  return rz;
}

void main() {
  vValue = value;
  vec3 transformed = vec3(position);

  float theta = -time * numbers.z / length(transformed.xy);
  mvPosition = rotatez(theta) * vec4(transformed, 1.0);
  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size;
  bool isPerspective = isPerspectiveMatrix(projectionMatrix);
  if (isPerspective)
    gl_PointSize *= (scale / -mvPosition.z);
  vSize = gl_PointSize;
#include <clipping_planes_vertex>
  vModelViewMatrix = modelViewMatrix;
  vProjectionMatrix = projectionMatrix;
}