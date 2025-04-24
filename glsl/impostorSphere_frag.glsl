uniform float size;
	uniform vec3 numbers;
	uniform vec2 minmax;
	uniform int quantityIndex;
	uniform int colormapIndex;
	uniform bool revColormap;
	uniform float targetValue;
	uniform float deltaValue;

	varying vec2 vValue;
	varying float vSize;
	varying vec4 mvPosition;
	varying mat4 vModelViewMatrix;
	varying mat4 vProjectionMatrix;
	
	#include <clipping_planes_pars_fragment>
	#include <common>
	
	vec3 viridis(float t) {
		const vec3 c0 = vec3(0.2777273272234177, 0.005407344544966578, 0.3340998053353061);
		const vec3 c1 = vec3(0.1050930431085774, 1.404613529898575, 1.384590162594685);
		const vec3 c2 = vec3(-0.3308618287255563, 0.214847559468213, 0.09509516302823659);
		const vec3 c3 = vec3(-4.634230498983486, -5.799100973351585, -19.33244095627987);
		const vec3 c4 = vec3(6.228269936347081, 14.17993336680509, 56.69055260068105);
		const vec3 c5 = vec3(4.776384997670288, -13.74514537774601, -65.35303263337234);
		const vec3 c6 = vec3(-5.435455855934631, 4.645852612178535, 26.3124352495832);
		return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
	}
	
	vec3 plasma(float t) {
		const vec3 c0 = vec3(0.05873234392399702, 0.02333670892565664, 0.5433401826748754);
		const vec3 c1 = vec3(2.176514634195958, 0.2383834171260182, 0.7539604599784036);
		const vec3 c2 = vec3(-2.689460476458034, -7.455851135738909, 3.110799939717086);
		const vec3 c3 = vec3(6.130348345893603, 42.3461881477227, -28.51885465332158);
		const vec3 c4 = vec3(-11.10743619062271, -82.66631109428045, 60.13984767418263);
		const vec3 c5 = vec3(10.02306557647065, 71.41361770095349, -54.07218655560067);
		const vec3 c6 = vec3(-3.658713842777788, -22.93153465461149, 18.19190778539828);
		return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
	}
	
	vec3 magma(float t) {
		const vec3 c0 = vec3(-0.002136485053939582, -0.000749655052795221, -0.005386127855323933);
		const vec3 c1 = vec3(0.2516605407371642, 0.6775232436837668, 2.494026599312351);
		const vec3 c2 = vec3(8.353717279216625, -3.577719514958484, 0.3144679030132573);
		const vec3 c3 = vec3(-27.66873308576866, 14.26473078096533, -13.64921318813922);
		const vec3 c4 = vec3(52.17613981234068, -27.94360607168351, 12.94416944238394);
		const vec3 c5 = vec3(-50.76852536473588, 29.04658282127291, 4.23415299384598);
		const vec3 c6 = vec3(18.65570506591883, -11.48977351997711, -5.601961508734096);
		return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
	}
	
	vec3 inferno(float t) {
		const vec3 c0 = vec3(0.0002189403691192265, 0.001651004631001012, -0.01948089843709184);
		const vec3 c1 = vec3(0.1065134194856116, 0.5639564367884091, 3.932712388889277);
		const vec3 c2 = vec3(11.60249308247187, -3.972853965665698, -15.9423941062914);
		const vec3 c3 = vec3(-41.70399613139459, 17.43639888205313, 44.35414519872813);
		const vec3 c4 = vec3(77.162935699427, -33.40235894210092, -81.80730925738993);
		const vec3 c5 = vec3(-71.31942824499214, 32.62606426397723, 73.20951985803202);
		const vec3 c6 = vec3(25.13112622477341, -12.24266895238567, -23.07032500287172);
		return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
	}
	
	vec3 turbo(float t) {
		const vec3 c0 = vec3(0.1140890109226559, 0.06288340699912215, 0.2248337216805064);
		const vec3 c1 = vec3(6.716419496985708, 3.182286745507602, 7.571581586103393);
		const vec3 c2 = vec3(-66.09402360453038, -4.9279827041226, -10.09439367561635);
		const vec3 c3 = vec3(228.7660791526501, 25.04986699771073, -91.54105330182436);
		const vec3 c4 = vec3(-334.8351565777451, -69.31749712757485, 288.5858850615712);
		const vec3 c5 = vec3(218.7637218434795, 67.52150567819112, -305.2045772184957);
		const vec3 c6 = vec3(-52.88903478218835, -21.54527364654712, 110.5174647748972);
		return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
	}
	
	vec3 parula(float t) {
		const vec3 c0 = vec3(2.35823373e-01, 1.49256342e-01, 6.46357598e-01);
		const vec3 c1 = vec3(2.27805283e+00, 1.10359901e+00, 5.73693221e+00);
		const vec3 c2 = vec3(-9.25935259e+01, -7.02721632e+00, -1.17363325e+02);
		const vec3 c3 = vec3(1.88692632e+03, 1.60626301e+02, 2.02973281e+03);
		const vec3 c4 = vec3(-1.99146220e+04, -1.35579191e+03, -2.00107716e+04);
		const vec3 c5 = vec3(1.21571275e+05, 6.10623463e+03, 1.17860001e+05);
		const vec3 c6 = vec3(-4.64081499e+05, -1.52879102e+04, -4.42732980e+05);
		const vec3 c7 = vec3(1.15427193e+06, 1.80182829e+04, 1.09870097e+06);
		const vec3 c8 = vec3(-1.89936434e+06, 3.88017881e+03, -1.82102597e+06);
		const vec3 c9 = vec3(2.05085215e+06, -4.10941677e+04, 1.99182410e+06);
		const vec3 c10 = vec3(-1.39723148e+06, 5.34337695e+04, -1.37836965e+06);
		const vec3 c11 = vec3(5.44741547e+05, -3.07474332e+04, 5.46171247e+05);
		const vec3 c12 = vec3(-9.26408423e+04, 6.89297618e+03, -9.43356433e+04);
		return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * (c6 + t * (c7 + t * (c8 + t * (c9 + t * (c10 + t * (c11 + t * c12)))))))))));
	}
	
	vec3 twilight(float t) {
		const vec3 c0 = vec3(0.996106, 0.851653, 0.940566);
		const vec3 c1 = vec3(-6.529620, -0.183448, -3.940750);
		const vec3 c2 = vec3(40.899579, -7.894242, 38.569228);
		const vec3 c3 = vec3(-155.212979, 4.404793, -167.925730);
		const vec3 c4 = vec3(296.687222, 24.084913, 315.087856);
		const vec3 c5 = vec3(-261.270519, -29.995422, -266.972991);
		const vec3 c6 = vec3(85.335349, 9.602600, 85.227117);
		return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
	}
	
	vec3 coolwarm(float t) {
		const vec3 c0 = vec3(0.227376,0.286898,0.752999);
		const vec3 c1 = vec3(1.204846,2.314886,1.563499);
		const vec3 c2 = vec3(0.102341,-7.369214,-1.860252);
		const vec3 c3 = vec3(2.218624,32.578457,-1.643751);
		const vec3 c4 = vec3(-5.076863,-75.374676,-3.704589);
		const vec3 c5 = vec3(1.336276,73.453060,9.595678);
		const vec3 c6 = vec3(0.694723,-25.863102,-4.558659);
		return c0+t*(c1+t*(c2+t*(c3+t*(c4+t*(c5+t*c6)))));
	}

	vec3 threeColorsInterp(vec3 colLeft, vec3 colMid, vec3 colRight, float t) {
		return t < 0.5 ? mix(colLeft, colMid, 2.0 * t)
						: mix(colMid, colRight, (t - 0.5) * 2.0);
	}
	
	vec3 hsv2rgb(in vec3 c) {
		vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
						0.0, 1.0);
		return c.z * mix(vec3(1.0), rgb, c.y);
	}
	
	vec3 hsl2rgb(in vec3 c) {
		vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
						0.0, 1.0);
		return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
	}
	
	vec3 byN(in int n) { return hsl2rgb(vec3(float(n - 1) * 0.125, 1.0, 0.5)); }
	
	vec3 colormap(float t, int index, int n) {
		if (index == 0) {
		return inferno(t);
		} else if (index == 1) {
		return coolwarm(t);
		} else if (index == 2) {
		return t > 0.5 ? vec3(0.0,0.0,1.0) : vec3(1.0,1.0,0.0);
		// return threeColorsInterp(vec3(0.0, 0.0, 1.0), vec3(0.0, 0.0, 0.0),
									// vec3(1.0, 1.0, 0.0), t);
		} else if (index == 3) {
		return viridis(t);
		} else if (index == 4) {
		return turbo(t);
		} else if (index == 5) {
		return parula(t);
		} else if (index == 6) {
		return vec3(t); // grey
		} else if (index == 7) {
		return threeColorsInterp(vec3(0.0, 0.0, 1.0), vec3(0.0, 0.0, 0.0),
									vec3(1.0, 0.0, 0.0), t);
		} else if (index == 8) {
		// return hsv2rgb(vec3(t,1.0,0.5));
		return hsl2rgb(vec3(t, 1.0, 0.5));
		} else if (index == 9) {
		// return hsv2rgb(vec3(mod(t + 0.166667,1.0),1.0,0.5));
		return hsl2rgb(vec3(mod(t + 0.166667, 1.0), 1.0, 0.5));
		} else if (index == 10) {
		return byN(n);
		} else if (index == 11) {
		// red blue cycle
		return threeColorsInterp(vec3(0.0, 0.0, 1.0), vec3(0.0, 0.0, 0.0),
									vec3(1.0, 0.0, 0.0), 1.0 - abs(2.0 * t - 1.0));
		} else if (index == 12) {
		return twilight(t);
		} else if (index == 13) {
		return twilight(mod(t + 0.5, 1.0));
		} else {
		return vec3(0.0);
		}
	}
	
	float modulus(vec2 complex) { return length(complex); }
	float phase(vec2 complex) {
		return atan(complex.y, complex.x) * 180.0 * RECIPROCAL_PI;
	}
	
	float quantity(vec2 complex, int index) {
		if (index == 0) {
		return complex.x;
		} else if (index == 1) {
		return complex.y;
		} else if (index == 2) {
		return modulus(complex);
		} else if (index == 3) {
		return dot(complex, complex);
		} else if (index == 4) {
		return phase(complex);
		} else {
		return 0.0;
		}
	}
	
	float brdf(vec3 normal, vec3 lightDir) {
		float rho = 1.f;
		return rho / PI;
		//*dot(normal,-lightDir);
	}
	
	void main() {
	#include <clipping_planes_fragment>
		// calculate normal from texture coordinates
		vec3 sphereNormal;
		sphereNormal.xy = gl_PointCoord * 2.0 - vec2(1.0);
		sphereNormal.y = -sphereNormal.y;
		sphereNormal.xy =
			round(sphereNormal.xy * vSize) / vSize; // produces symmetric circles
		float mag = dot(sphereNormal.xy, sphereNormal.xy);
		sphereNormal.z = sqrt(1.0 - mag);
	
		vec3 spherePos = mvPosition.xyz + sphereNormal * size * 0.5;
		vec3 color = vec3(0.0);
		if (mag <= 1.0) {
		float sphereDist = length(spherePos);
		// light on camera
		{
			vec3 lightPos = vec3(0.0);
			vec3 lightDir = spherePos - lightPos;
			float lightDist = length(lightDir);
			lightDir /= lightDist;
			float lightIntensity = 2.0;
			float temp =
				brdf(sphereNormal, lightDir) * max(0.0, dot(sphereNormal, -lightDir));
			temp *= lightIntensity / pow(lightDist, 0.5);
			color += temp;
		}
		// light on center
		{
			vec3 lightPos = (vModelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
			vec3 lightDir = spherePos - lightPos;
			float lightDist = length(lightDir);
			lightDir /= lightDist;
			float lightIntensity = 5.0;
			float temp =
				brdf(sphereNormal, lightDir) * max(0.0, dot(sphereNormal, -lightDir));
			temp *= lightIntensity / pow(lightDist, 0.3);
			color += temp;
		}
		// light from above
		{
			vec3 lightDir = (vModelViewMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz;
			float lightDist = length(lightDir);
			lightDir /= lightDist;
			float lightTopIntensity = 1.0;
			float lightBottomIntensity = 0.2;
			float dotNL = dot(sphereNormal, -lightDir);
			float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
			float irradiance =
				mix(lightBottomIntensity, lightTopIntensity, hemiDiffuseWeight);
			color += irradiance;
		}
	
		// compute the color accordingg to the quantity and colormap chosen for
		// display
		float t;
		if (quantityIndex == 5) {
			// complex case
			color *= (modulus(vValue) - minmax.x) / (minmax.y - minmax.x);
			t = (phase(vValue) + 180.0) / 360.0;
		} else {
			float q = quantity(vValue, quantityIndex);
			if (abs(abs(q)-targetValue*minmax.y) < deltaValue*minmax.y) {
				t = (q - minmax.x) / (minmax.y - minmax.x);
			} else {
				discard;
			}		
		}
		t = revColormap ? 1.0 - t : t;
		color *= colormap(t, colormapIndex, int(numbers.x));
		gl_FragColor = vec4(color, 1.0);
	
		// recompute the fragment depth so tatht the spheres intersects
		vec4 coord = vProjectionMatrix * vec4(spherePos, 1.0);
		gl_FragDepth = coord.z / coord.w;
		} else
		discard;
	}