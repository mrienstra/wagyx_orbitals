'use strict';
import * as THREE from 'three';
import {
    TrackballControls
} from 'three/addons/controls/TrackballControls.js';

import Stats from 'three/addons/libs/stats.module.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
////////////////////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////////////////////

// standard global variables
let gContainer, gScene, gCamera, gRenderer, gControls, gInfoGui, gStats;
let gNameToInd, gCurrInd;
let gElapsedTime = 0;

var resultSph2Cart = [0.0, 0.0, 0.0];
var resultCart2Sph = [0.0, 0.0, 0.0];
var resultSHarmonics = [0.0, 0.0];

// custom global variables
const ORBITALS = [];
let gOrbitalMesh, gLineCube, gPointsMesh;

//precompute constants
const nMax = 20;
const gFactorials = preComputeFactorials(nMax);
const gCoeffAlengendreKL = preComputeCoeffAlegendre(nMax);
const gCoeffSharmonicsLM = preComputeCoeffSharmonics(nMax);
const gCoeffHWF = preComputeCoeffHWF(nMax);
const gcCamZ = {
    pos: [30, 0, 10],
    up: [0, 0, 1],
    target: [0, 0, 0]
};

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

const gcColors = {
    1: new THREE.Color('hsl(0, 100%, 30%)'),
    2: new THREE.Color('hsl(45, 100%, 30%)'),
    4: new THREE.Color('hsl(90, 100%, 30%)'),
    3: new THREE.Color('hsl(135, 100%, 30%)'),
    5: new THREE.Color('hsl(180, 100%, 30%)'),
    6: new THREE.Color('hsl(225, 100%, 60%)'),
    7: new THREE.Color('hsl(270, 100%, 50%)'),
}


const infernoColors = [
    [25.13112622477341, -12.24266895238567, -23.07032500287172],
    [-71.31942824499214, 32.62606426397723, 73.20951985803202],
    [77.162935699427, -33.40235894210092, -81.80730925738993],
    [-41.70399613139459, 17.43639888205313, 44.35414519872813],
    [11.60249308247187, -3.972853965665698, -15.9423941062914],
    [0.1065134194856116, 0.5639564367884091, 3.932712388889277],
    [0.0002189403691192265, 0.001651004631001012, -0.01948089843709184]
];

const viridisColors = [
    [-5.435455855934631, 4.645852612178535, 26.3124352495832],
    [4.776384997670288, -13.74514537774601, -65.35303263337234],
    [6.228269936347081, 14.17993336680509, 56.69055260068105],
    [-4.634230498983486, -5.799100973351585, -19.33244095627987],
    [-0.3308618287255563, 0.214847559468213, 0.09509516302823659],
    [0.1050930431085774, 1.404613529898575, 1.384590162594685],
    [0.2777273272234177, 0.005407344544966578, 0.3340998053353061]
];

const plasmaColors = [
    [-3.658713842777788, -22.93153465461149, 18.19190778539828],
    [10.02306557647065, 71.41361770095349, -54.07218655560067],
    [-11.10743619062271, -82.66631109428045, 60.13984767418263],
    [6.130348345893603, 42.3461881477227, -28.51885465332158],
    [-2.689460476458034, -7.455851135738909, 3.110799939717086],
    [2.176514634195958, 0.2383834171260182, 0.7539604599784036],
    [0.05873234392399702, 0.02333670892565664, 0.5433401826748754]
];

const magmaColors = [
    [18.65570506591883, -11.48977351997711, -5.601961508734096],
    [-50.76852536473588, 29.04658282127291, 4.23415299384598],
    [52.17613981234068, -27.94360607168351, 12.94416944238394],
    [-27.66873308576866, 14.26473078096533, -13.64921318813922],
    [8.353717279216625, -3.577719514958484, 0.3144679030132573],
    [0.2516605407371642, 0.6775232436837668, 2.494026599312351],
    [-0.002136485053939582, -0.000749655052795221, -0.005386127855323933]
];

const turboColors = [
    [-52.88903478218835, -21.54527364654712, 110.5174647748972],
    [218.7637218434795, 67.52150567819112, -305.2045772184957],
    [-334.8351565777451, -69.31749712757485, 288.5858850615712],
    [228.7660791526501, 25.04986699771073, -91.54105330182436],
    [-66.09402360453038, -4.9279827041226, -10.09439367561635],
    [6.716419496985708, 3.182286745507602, 7.571581586103393],
    [0.1140890109226559, 0.06288340699912215, 0.2248337216805064]
];
const parulaColors = [
    [-9.26408423e+04, 6.89297618e+03, -9.43356433e+04],
    [5.44741547e+05, -3.07474332e+04, 5.46171247e+05],
    [-1.39723148e+06, 5.34337695e+04, -1.37836965e+06],
    [2.05085215e+06, -4.10941677e+04, 1.99182410e+06],
    [-1.89936434e+06, 3.88017881e+03, -1.82102597e+06],
    [1.15427193e+06, 1.80182829e+04, 1.09870097e+06],
    [-4.64081499e+05, -1.52879102e+04, -4.42732980e+05],
    [1.21571275e+05, 6.10623463e+03, 1.17860001e+05],
    [-1.99146220e+04, -1.35579191e+03, -2.00107716e+04],
    [1.88692632e+03, 1.60626301e+02, 2.02973281e+03],
    [-9.25935259e+01, -7.02721632e+00, -1.17363325e+02],
    [2.27805283e+00, 1.10359901e+00, 5.73693221e+00],
    [2.35823373e-01, 1.49256342e-01, 6.46357598e-01]
];

const twilightColors = [
    [85.335349, 9.602600, 85.227117],
    [-261.270519, -29.995422, -266.972991],
    [296.687222, 24.084913, 315.087856],
    [-155.212979, 4.404793, -167.925730],
    [40.899579, -7.894242, 38.569228],
    [-6.529620, -0.183448, -3.940750],
    [0.996106, 0.851653, 0.940566]
];

const coolwarmColors = [
    [0.694723, -25.863102, -4.558659],
    [1.336276, 73.453060, 9.595678],
    [-5.076863, -75.374676, -3.704589],
    [2.218624, 32.578457, -1.643751],
    [0.102341, -7.369214, -1.860252],
    [1.204846, 2.314886, 1.563499],
    [0.227376, 0.286898, 0.752999]
];

const gColorMaps = {
    "inferno": {
        name: "inferno",
        index: 0,
        func: (t) => mapColor(t, infernoColors)
    },
    "coolwarm": {
        name: "coolwarm",
        index: 1,
        func: (t) => mapColor(t, coolwarmColors)
    },
    "viridis": {
        name: "viridis",
        index: 3,
        func: (t) => mapColor(t, viridisColors)
    },
    "turbo": {
        name: "turbo",
        index: 4,
        func: (t) => mapColor(t, turboColors)
    },
    "parula": {
        name: "parula",
        index: 5,
        func: (t) => mapColor(t, parulaColors)
    },
    "grey": {
        name: "grey",
        index: 6,
        func: (t) => [t, t, t]
    },
    "hsl": {
        name: "hsl",
        index: 8,
        func: (t) => {
            const col = new THREE.Color().setHSL(t, 1.0, 0.5);
            return [col.r, col.g, col.b];
        }
    },
    "byN": {
        name: "byN",
        index: 10,
        func: (t) => {
            const col = gcColors[ORBITALS[gCurrInd].n];
            return [col.r * t, col.g * t, col.b * t];
        }
    },
    "redBlueCycle": {
        name: "redBlueCycle",
        index: 11,
        func: (t) => threeColorsInterp([0, 0, 1], [0, 0, 0], [1, 0, 0], 1 - Math.abs(2 * t - 1))
    },
    "twilight": {
        name: "twilight",
        index: 12,
        func: (t) => mapColor(t, twilightColors)
    },
    "twilightShifted": {
        name: "twilightShifted",
        index: 13,
        func: (t) => mapColor((t + 0.5) % 1.0, twilightColors)
    },
    "plasma": {
        name: "plasma",
        index: -1,
        func: (t) => mapColor(t, plasmaColors)
    },
    "magma": {
        name: "magma",
        index: -1,
        func: (t) => mapColor(t, magmaColors)
    },
    "hsl60": {
        name: "hsl60",
        index: -1,
        func: (t) => {
            const col = new THREE.Color().setHSL((t + 1.0 / 6.0) % 1.0, 1.0, 0.5);
            return [col.r, col.g, col.b];
        }
    },
    "blueBlackRed": {
        name: "blueBlackRed",
        index: -1,
        func: (t) => threeColorsInterp([0, 0, 1], [0, 0, 0], [1, 0, 0], t)
    },
    "greenBlackRed": {
        name: "greenBlackRed",
        index: -1,
        func: (t) => threeColorsInterp([0, 1, 0], [0, 0, 0], [1, 0, 0], t)
    },
    "blueBlackYellow": {
        name: "blueBlackYellow",
        index: -1,
        func: (t) => threeColorsInterp([0, 0, 1], [0, 0, 0], [1, 1, 0], t)
    },
    "blueYellow": {
        name: "blueYellow",
        index: 2,
        func: (t) => threeColorsInterp([0, 0, 1], [0, 0, 0], [1, 1, 0], t)
        // func: (t) => t > 0.5 ? [0, 0, 1] : [1, 1, 0]
    },

    "blueWhiteRed": {
        name: "blueWhiteRed",
        index: -1,
        func: (t) => threeColorsInterp([0, 0, 1], [1, 1, 1], [1, 0, 0], t)
    },
    "greenWhiteRed": {
        name: "greenWhiteRed",
        index: -1,
        func: (t) => threeColorsInterp([0, 1, 0], [1, 1, 1], [1, 0, 0], t)
    },
    "blueWhiteYellow": {
        name: "blueWhiteYellow",
        index: -1,
        func: (t) => threeColorsInterp([0, 0, 1], [1, 1, 1], [1, 1, 0], t)
    },
};

const gColorMapNames = {
    "Inferno": "inferno",
    "Viridis": "viridis",
    "Parula": "parula",
    "Grey": "grey",
    // Plasma: "plasma",
    // "Magma": "magma",
    "Cool Warm": "coolwarm",
    "Turbo": "turbo",
    "blueYellow": "blueYellow",
    // "Blue Black Red": "blueBlackRed",
    // "Green Black Red": "greenBlackRed",
    // "Blue Black Yellow": "blueBlackYellow",
    // "Blue White Red": "blueWhiteRed",
    // "Green White Red": "greenWhiteRed",
    // "Blue White Yellow": "blueWhiteYellow",
    "HSL": "hsl",
    // "HSL 60": "hsl60",
    "Twilight": "twilight",
    "Twilight Shifted": "twilightShifted",
    "Red Blue Cycle": "redBlueCycle",
    "By n": "byN",
};


const gQuantities = {
    "real": {
        name: "real",
        func: (r, i) => r,
        index: 0
    },
    "imaginary": {
        name: "imaginary",
        func: (r, i) => i,
        index: 1
    },
    "modulus": {
        name: "modulus",
        func: (r, i) => Math.sqrt(r * r + i * i),
        index: 2
    },
    "pdf": {
        name: "pdf",
        func: (r, i) => r * r + i * i,
        index: 3
    },
    "phase": {
        name: "phase",
        func: (r, i) => Math.atan2(i, r) * RAD2DEG,
        index: 4
    },
    "complex": {
        name: "complex",
        func: (t) => r, //will be ignored by code
        index: 5
    },
};

const gQuantityNames = {
    "Real part": "real",
    "Imaginary part": "imaginary",
    "Modulus": "modulus",
    "Probability density": "pdf",
    "Phase": "phase",
    "Complex": "complex",
};

const gRevFunc = {
    false: (x) => x,
    true: (x) => 1.0 - x
}

const gParameters = {
    cutAway: true,
    boxVisible: false,
    rotate: true,
    resetCamera: function () { },
    needsColorUpdate: false,
    needsMeshUpdate: false,
    colormap: gColorMapNames["Inferno"],
    inverseColormap: false,
    backgroundLevel: 0.85,
    quantity: gQuantityNames["Modulus"],
    sliderN: 2,
    sliderL: 1,
    sliderM: 1,
    targetValue: 0.5,
    deltaValue: 0.5,
};

const gClock = new THREE.Clock();
gClock.start();
init();
// console.log("init", gClock.getElapsedTime());
gRenderer.setAnimationLoop(animationLoop);

/////////////////////////////////////////////////////////////////////////////
// FUNCTIONS 	
/////////////////////////////////////////////////////////////////////////////	
function init() {
    // SCENE
    gScene = new THREE.Scene();
    // CAMERA
    const width = window.innerWidth;
    const height = window.innerHeight;
    const viewAngle = 60;
    const near = 0.1;
    const far = 5000;
    gCamera = new THREE.PerspectiveCamera(viewAngle, width / height, near, far);
    gScene.add(gCamera);
    resetCamera();

    // RENDERER
    gRenderer = new THREE.WebGLRenderer({
        antialias: true
    });
    gRenderer.setPixelRatio(window.devicePixelRatio);
    gRenderer.setSize(width,height);
    gRenderer.xr.enabled = true;
    gRenderer.localClippingEnabled = gParameters.cutAway;

    gStats = new Stats();
    document.body.appendChild(gStats.dom);

    document.body.appendChild( VRButton.createButton( gRenderer ) );

    gContainer = document.getElementById('ThreeJS');
    gContainer.appendChild(gRenderer.domElement);

    // CONTROLS
    gControls = new TrackballControls(gCamera, gRenderer.domElement);
    gControls.noPan = true;
    gControls.connect(gRenderer.domElement);

    /////////////////////////////////////////////////////////////////////////////
    // CUSTOM //
    /////////////////////////////////////////////////////////////////////////////

    for (let n = 1; n < nMax + 1; n++) {
        for (let l = 0; l < n; ++l) {
            for (let m = -l; m < l + 1; ++m) {
                const name = makeName(n, l, m);
                ORBITALS.push({ n: n, l: l, m: m, nbPoints: 1000000, radius: 7*n*Math.sqrt(n), name: name, minmax: {}, cellNb:333 });
            }
        }
    }

    gNameToInd = {};
    for (let i = 0; i < ORBITALS.length; ++i) {
        gNameToInd[ORBITALS[i].name] = i;
    }

    gCurrInd = gNameToInd[makeName(gParameters.sliderN, gParameters.sliderL, gParameters.sliderM)];
    const obj0 = ORBITALS[gCurrInd];
    gParameters.samplesNb = Math.round(obj0.nbPoints / 10.0);
    gParameters.samplesNbOld = 0;
    gParameters.log10SamplesNb = Math.log10(gParameters.samplesNb);


    /////////////////////////////////////////////////////////////////////////////
    // GUI //
    /////////////////////////////////////////////////////////////////////////////

    const gui = new dat.GUI();

    const mainCategory = gui.addFolder("Orbital (n,l,m) -- count: " + Object.keys(ORBITALS).length);
    mainCategory.add(gParameters, "sliderN", 1, nMax, 1)
        .name("n  (1 to " + nMax + ")")
        .onChange(function (value) {
            gParameters.sliderL = clamp(gParameters.sliderL, 0, gParameters.sliderN - 1);
            gParameters.sliderM = clamp(gParameters.sliderM, -gParameters.sliderL, gParameters.sliderL);
            gCurrInd = gNameToInd[makeName(gParameters.sliderN, gParameters.sliderL, gParameters.sliderM)];
            const obj = ORBITALS[gCurrInd];
            updateOrbital(obj);
        }).listen();

    mainCategory.add(gParameters, "sliderL", 0, nMax - 1, 1)
        .name("l  (0 to n-1)")
        .onChange(function (value) {
            gParameters.sliderL = clamp(gParameters.sliderL, 0, gParameters.sliderN - 1);
            gParameters.sliderM = clamp(gParameters.sliderM, -gParameters.sliderL, gParameters.sliderL);
            gCurrInd = gNameToInd[makeName(gParameters.sliderN, gParameters.sliderL, gParameters.sliderM)];
            const obj = ORBITALS[gCurrInd];
            updateOrbital(obj);
        }).listen();

    mainCategory.add(gParameters, "sliderM", -nMax + 1, nMax - 1, 1)
        .name("m  (-l to l)")
        .onChange(function (value) {
            gParameters.sliderM = clamp(gParameters.sliderM, -gParameters.sliderL, gParameters.sliderL);
            gCurrInd = gNameToInd[makeName(gParameters.sliderN, gParameters.sliderL, gParameters.sliderM)];
            const obj = ORBITALS[gCurrInd];
            updateOrbital(obj);
        }).listen();

    const optionsFd = gui.addFolder("Options");

    let maxLength = 0;
    for (let arg in ORBITALS) {
        maxLength = Math.max(maxLength, ORBITALS[arg].nbPoints);
    }

    optionsFd.add(gParameters, "log10SamplesNb", 3.0, Math.log10(maxLength * 1.0), 0.01)
        .name("Samples 10^")
        .onChange(function (value) {
            gParameters.samplesNbOld = gParameters.samplesNb;
            gParameters.samplesNb = Math.round(Math.pow(10.0, gParameters.log10SamplesNb));
            updateCount(ORBITALS[gCurrInd]);
        });

    optionsFd.add(gParameters, 'quantity', gQuantityNames).name("Wave function").onChange(function () {
        const obj = ORBITALS[gCurrInd]
        updateMinMax(obj);
        gInfoGui.name(makeInfoHtml(obj));
        gParameters.needsColorUpdate = true;
    });

    optionsFd.add(gParameters, 'colormap', gColorMapNames).name("Color map").onChange(function () {
        gParameters.needsColorUpdate = true;
        gInfoGui.name(makeInfoHtml(ORBITALS[gCurrInd]));
    });
    optionsFd.add(gParameters, 'inverseColormap').name("Reverse colormap").onChange(function () {
        gParameters.needsColorUpdate = true;
        gInfoGui.name(makeInfoHtml(ORBITALS[gCurrInd]));
    });


    optionsFd.add(gParameters, "cutAway")
        .name("Cut away")
        .onChange(function (value) {
            gRenderer.localClippingEnabled = gParameters.cutAway;
            gParameters.needsMeshUpdate = true;
        });

    optionsFd.add(gParameters, "boxVisible")
        .name("Display box")
        .onChange(function (value) {
            gLineCube.material.visible = value;
        });

    optionsFd.add(gParameters, "rotate")
        .name("Activate rotation")
        .onChange(function (value) { });

    optionsFd.add(gParameters, "resetCamera")
        .name("Reset camera")
        .onChange(function (value) {
            resetCamera();
        });

    optionsFd.add(gParameters, "backgroundLevel", 0.0, 1.0, 0.01)
        .name("Background")
        .onChange(function (value) {
            if (gParameters.backgroundLevel > 0.5) {
                gLineCube.material.color = new THREE.Color(0.25, 0.25, 0.25);
            } else {
                gLineCube.material.color = new THREE.Color(0.75, 0.75, 0.75);
            }
        });
    optionsFd.add(gParameters, "targetValue", 0.0, 1.0, 1e-2)
        .name("Target")
        .onChange(function (value) {
            gPointsMesh.material.uniforms.targetValue.value = gParameters.targetValue;
            gParameters.needsColorUpdate = true;
        });
    optionsFd.add(gParameters, "deltaValue", 0.0, 1.0, 1e-2)
        .name("Delta")
        .onChange(function (value) {
            gPointsMesh.material.uniforms.deltaValue.value = gParameters.deltaValue;
            gParameters.needsColorUpdate = true;
        });

    const detailsFd = gui.addFolder("Information");
    gParameters.message = "Please click on an orbital";
    gInfoGui = detailsFd.add(gParameters, "message");
    gInfoGui.__li.children[0].children[0].style.width = "auto";

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // MESHES
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    const clipPlanes = [
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
    ];

    gOrbitalMesh = new THREE.Object3D();

    //adds points
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(obj0.nbPoints * 3, 3));
    pointsGeometry.setAttribute('value', new THREE.Float32BufferAttribute(obj0.nbPoints * 2, 2));
    const d = getCellLength(obj0.radius, obj0.cellNb);

    const pointMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: {
                value: 1.0
            },
            numbers: {
                value: new THREE.Vector3(obj0.n, obj0.l, obj0.m)
            },
            size: {
                value: d
            },
            scale: {
                value: cptUniformScale(height, gCamera.fov)
            },
            colormapIndex: {
                value: gColorMaps[gParameters.colormap].index
            },
            quantityIndex: {
                value: gQuantities[gParameters.quantity].index
            },
            minmax: {
                value: new THREE.Vector2(0.0, 0.0)
            },
            revColormap: {
                value: gParameters.inverseColormap
            },
            targetValue: {
                value: gParameters.targetValue
            },
            deltaValue: {
                value: gParameters.deltaValue
            },
        },
        fragmentShader: "void main(){gl_FragColor=vec4(0.0,0.0,0.0,1.0);}",
        clipping: true,
        clippingPlanes: clipPlanes,
        clipIntersection: true
    });
    // loadShaders("./glsl/simpleVert.glsl","./glsl/simpleFrag.glsl");
    // loadShaders("./glsl/simpleSphereVert.glsl","./glsl/simpleSphereFrag.glsl");
    // loadShaders("./glsl/simpleSphereVert.glsl","./glsl/simpleSphereFrag2.glsl");
    loadShaders("./glsl/impostorSphere_vert.glsl", "./glsl/impostorSphere_frag.glsl");
    gPointsMesh = new THREE.Points(pointsGeometry, pointMaterial);
    gPointsMesh.geometry.setDrawRange(0, gParameters.samplesNb);
    gOrbitalMesh.add(gPointsMesh);

    // adds box
    {
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
        const boxMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true, //set's the wireframe
            visible: gParameters.boxVisible,
        });
        gLineCube = new THREE.Mesh(boxGeometry, boxMaterial);
        gOrbitalMesh.add(gLineCube);
    }

    // {
        // const refFrame = addReferenceFrame(gOrbitalMesh);
        // gOrbitalMesh.add(refFrame);
    // }

    gScene.add(gOrbitalMesh);

    gParameters.sliderN = obj0.n;
    gParameters.sliderL = obj0.l;
    gParameters.sliderM = obj0.m;
    updateOrbital(obj0);
    gui.open();
    mainCategory.open();
    optionsFd.open();
    detailsFd.open();

    document.addEventListener("keydown", onDocumentKeyDown, false);
    window.addEventListener('resize', onWindowResize);
} // end of function init()

/////////////////////////////////////////////
// MISC
/////////////////////////////////////////////


// Resolve Includes
function resolveIncludes(string) {
    const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
    return string.replace(includePattern, includeReplacer);
}

function includeReplacer(match, include) {
    const string = THREE.ShaderChunk[include];
    if (string === undefined) {
        throw new Error('Can not resolve #include <' + include + '>');
    }
    return resolveIncludes(string);
}

function makeName(n, l, m) {
    return "(" + n + "," + l + "," + m + ")";
}

function addReferenceFrame() {
    const mesh = new THREE.Object3D();

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materialX = new THREE.MeshPhongMaterial({
        color: 0xff0000
    });
    const sphereX = new THREE.Mesh(geometry, materialX);
    sphereX.position.set(10, 0, 0);
    mesh.add(sphereX);

    const materialY = new THREE.MeshLambertMaterial({
        color: 0x00ff00
    });
    const sphereY = new THREE.Mesh(geometry, materialY);
    sphereY.position.set(0, 10, 0);
    mesh.add(sphereY);

    const materialZ = new THREE.MeshStandardMaterial({
        color: 0x0000ff
    });
    const sphereZ = new THREE.Mesh(geometry, materialZ);
    sphereZ.position.set(0, 0, 10);
    mesh.add(sphereZ);
    return mesh
}

function updateCount(obj) {
    gPointsMesh.geometry.setDrawRange(0, gParameters.samplesNb);
}


function updateMinMax(obj) {
    if (obj.minmax[gParameters.quantity] === undefined) {
        let quantityFunc = gQuantities[gParameters.quantity].func;
        if (gParameters.quantity == "phase") {
            obj.maxValue = 180;
            obj.minValue = -180;
        } else if (gParameters.quantity == "complex") {
            obj.minValue = 0;
            quantityFunc = gQuantities.modulus.func;
            obj.maxValue = quantityFunc(obj.values[0], obj.values[1]);
            for (let i = 1; i < obj.nbPoints; ++i) {
                obj.maxValue = Math.max(quantityFunc(obj.values[i * 2 + 0], obj.values[i * 2 + 1]), obj.maxValue);
            }
        } else {
            obj.maxValue = quantityFunc(obj.values[0], obj.values[1]);
            obj.minValue = obj.maxValue;
            for (let i = 1; i < obj.nbPoints; ++i) {
                const val = quantityFunc(obj.values[i * 2 + 0], obj.values[i * 2 + 1]);
                obj.minValue = Math.min(val, obj.minValue);
                obj.maxValue = Math.max(val, obj.maxValue);
            }
        }

        if (gParameters.quantity == "modulus" || gParameters.quantity == "pdf") {
            obj.minValue = 0;
        } else if (gParameters.quantity == "real" || gParameters.quantity == "imaginary") {
            obj.maxValue = Math.max(Math.abs(obj.maxValue), Math.abs(obj.minValue));
            obj.minValue = -obj.maxValue;
        }
        obj.minmax[gParameters.quantity] = [obj.minValue, obj.maxValue];
    } else {
        const minmax = obj.minmax[gParameters.quantity];
        obj.minValue = minmax[0];
        obj.maxValue = minmax[1];
    }
    obj.meanValue = (obj.minValue + obj.maxValue) * 0.5;
    console.log("vMin",obj.minValue,Math.log10(obj.minValue));
    console.log("vMax",obj.maxValue,Math.log10(obj.maxValue));
}

function getCellLength(R, N) {
    return 2 * R / (N - 1);
}

function updateMesh(obj) {
    if (gParameters.needsMeshUpdate) {
        const positions = gPointsMesh.geometry.getAttribute('position');
        positions.set(obj.positions);
        positions.needsUpdate = true;
        const values = gPointsMesh.geometry.getAttribute('value');
        values.set(obj.values);
        values.needsUpdate = true;
        gParameters.needsMeshUpdate = false;
    }
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function updateColor(obj) {
    if (gParameters.needsColorUpdate) {
        gPointsMesh.material.uniforms.quantityIndex.value = gQuantities[gParameters.quantity].index;
        gPointsMesh.material.uniforms.colormapIndex.value = gColorMaps[gParameters.colormap].index;
        gPointsMesh.material.uniforms.minmax.value = new THREE.Vector2(obj.minValue, obj.maxValue);
        gPointsMesh.material.uniforms.revColormap.value = gParameters.inverseColormap;
        gParameters.needsColorUpdate = false;
    }
}

function animationLoop(time, frame) {
    update();
    render();
    gStats.update();
}

function update() {
    const obj = ORBITALS[gCurrInd];
    let length = gCamera.position.length();
    length = clamp(length, 5, 2500);
    gCamera.position.setLength(length);

    gControls.update();
    const delta = gClock.getDelta();
    if (gParameters.rotate) {
        gElapsedTime += delta;
    }
    updateMesh(obj);
    updateColor(obj);
}

function cptUniformScale(height, fov) {
    return height * 0.5 / Math.tan(DEG2RAD * fov * 0.5);
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    gPointsMesh.material.uniforms.scale.value = cptUniformScale(height, gCamera.fov);
    gCamera.aspect = width / height;
    gCamera.updateProjectionMatrix();
    gRenderer.setSize(width, height);
}

function render() {
    gPointsMesh.material.uniforms.time.value = gElapsedTime;
    gRenderer.setClearColor(new THREE.Color(gParameters.backgroundLevel, gParameters.backgroundLevel, gParameters.backgroundLevel));
    gRenderer.render(gScene, gCamera);
}

function makeColormapScale() {
    const canvas = document.createElement('canvas');
    canvas.width = 220;
    canvas.height = 15;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = id.data;
    const cmap = (x) => gColorMaps[gParameters.colormap].func(gRevFunc[gParameters.inverseColormap](x));
    let col;
    const cols = [];
    for (let x = 0; x < canvas.width; ++x) {
        col = cmap(x / canvas.width);
        col[0] = clamp(Math.floor(col[0] * 256), 0, 255);
        col[1] = clamp(Math.floor(col[1] * 256), 0, 255)
        col[2] = clamp(Math.floor(col[2] * 256), 0, 255)
        cols.push(col);
    }
    let off;
    for (let y = 0; y < canvas.height; ++y) {
        for (let x = 0; x < canvas.width; ++x) {
            off = (y * canvas.width + x) * 4;
            pixels[off] = cols[x][0];
            pixels[off + 1] = cols[x][1];
            pixels[off + 2] = cols[x][2];
            pixels[off + 3] = 255;
        }
    }
    ctx.putImageData(id, 0, 0);
    const message = [];
    message.push("<td height=5 style=\"text-align: center; border:0px solid black\">" + "<img src = \"" + canvas.toDataURL("image/png") + "\">" + "</td>");
    return message;
}

function stringifyValue(value) {
    if (value == 0)
        return "0";
    else if (value < 0)
        return "-";
    else
        return "+";
    // return value.toExponential(2);
}

function makeTable(obj) {
    const message = [];

    let minString = stringifyValue(obj.minValue);
    let maxString = stringifyValue(obj.maxValue);
    let meanString = obj.meanValue == 0 ? "0" : "";

    if (gParameters.quantity == "complex" || gParameters.quantity == "phase") {
        minString = "-180";
        meanString = "0";
        maxString = "180";
    }

    message.push("<b>Scale</b>");
    message.push("<table style=\"border:0px solid black; width:220px\">");
    message.push("<tr>");
    message.push("<td style=\"text-align: left; border:0px solid black;width:33%;\">" + minString + "</td>");
    message.push("<td style=\"text-align: center; border:0px solid black;width:33%;\">" + meanString + "</td>");
    message.push("<td style=\"text-align: right; border:0px solid black;width:33%;\">" + maxString + "</td>");
    message.push("</tr>");
    message.push("</table>");
    message.push(...makeColormapScale());
    message.push("<br>");

    let adequateColormap;
    if (gParameters.quantity == "real" || gParameters.quantity == "imaginary") {
        adequateColormap = "a diverging one like turbo";
    } else if (gParameters.quantity == "phase") {
        adequateColormap = "a cyclic one like HSL";
    } else {
        adequateColormap = "a sequential one like inferno";
    }
    let comment = "The adequate colormap for " + gParameters.quantity + " is " + adequateColormap + ".";
    if (gParameters.quantity == "complex") {
        comment = "The colormap cannot be changed. Color hue is the phase like HSL and intensity of color is modulus."
    }
    message.push(comment);

    return message;
}

function makeInfoHtml(obj) {
    const message = [];
    message.push(...makeTable(obj));
    return message.join("");
}

function updateOrbital(obj) {
    if (!obj.isValid) {
        obj.positions = new Float32Array(obj.nbPoints * 3);
        obj.values = new Float32Array(obj.nbPoints * 2);
        loadImage(obj);
    } else {
        gElapsedTime = 0;
        updateMinMax(obj);
        const oldScale = gLineCube.scale;
        gLineCube.applyMatrix4(new THREE.Matrix4().makeScale(2.0 * obj.radius / oldScale.x, 2.0 * obj.radius / oldScale.y, 2.0 * obj.radius / oldScale.z));
        gInfoGui.name(makeInfoHtml(obj));

        gPointsMesh.material.uniforms.numbers.value = new THREE.Vector3(obj.n, obj.l, obj.m);
        gPointsMesh.material.uniforms.size.value = getCellLength(obj.radius, obj.cellNb);

        gParameters.needsMeshUpdate = true;
        updateMesh(obj);
        // gPointsMesh.geometry.computeBoundingSphere();
        gParameters.needsColorUpdate = true;
        updateColor(obj);
    }
}

function positiveModulo(a, n) {
    return ((a % n) + n) % n;
}

function onDocumentKeyDown(event) {
    const keyCode = event.which;
    if (keyCode == 38) {
        //up arrow key
    } else if (keyCode == 40) {
        // down arrow key
    } else if (keyCode == 37) {
        // left arrow key
        gCurrInd = positiveModulo(gCurrInd - 1, ORBITALS.length);
        const obj = ORBITALS[gCurrInd];
        gParameters.sliderN = obj.n;
        gParameters.sliderL = obj.l;
        gParameters.sliderM = obj.m;
        updateOrbital(obj);
    } else if (keyCode == 39) {
        // the right arrow
        gCurrInd = positiveModulo(gCurrInd + 1, ORBITALS.length);
        const obj = ORBITALS[gCurrInd];
        gParameters.sliderN = obj.n;
        gParameters.sliderL = obj.l;
        gParameters.sliderM = obj.m;
        updateOrbital(obj);
    }
};

function loadImage(obj) {
    const a0 = 1;

    const sph = [0, 0, 0];
    let pos = sph2cart(sph);
    let hwf = hydrogenWaveFunction(sph[0], Math.cos(sph[1]), sph[2], a0, obj.n, obj.l, obj.m);
    let hwfPD = (hwf[0] * hwf[0] + hwf[1] * hwf[1]);
    const factor = 2 * obj.radius * 0.1;
    let i = 0;
    const start=10000; // discards the first points
    while (i < obj.nbPoints+start) {
        const cartNew = [
            pos[0] + (Math.random() - 0.5) * factor,
            pos[1] + (Math.random() - 0.5) * factor,
            pos[2] + (Math.random() - 0.5) * factor,
        ]
        const sphNew = cart2sph(cartNew);
        const hwfNew = hydrogenWaveFunction(sphNew[0], cartNew[2] / sphNew[0], sphNew[2], a0, obj.n, obj.l, obj.m);
        const hwfPDNew = (hwfNew[0] * hwfNew[0] + hwfNew[1] * hwfNew[1]);
        const acceptance = Math.min(hwfPDNew / hwfPD, 1);
        if (Math.random() <= acceptance) {
            hwf = [...hwfNew];
            hwfPD = hwfPDNew;
            pos = [...cartNew];
            if (i>=start){
                const ii=i-start;
                for (let j = 0; j < 3; j++) {
                    obj.positions[ii * 3 + j] = pos[j];
                }
                obj.values[ii * 2 + 0] = hwf[0];
                obj.values[ii * 2 + 1] = hwf[1];
            }
            i += 1;
        }
    }
    obj.isValid = true;
    gParameters.needsMeshUpdate = true;
    gParameters.needsColorUpdate = true;
    updateOrbital(obj);
}

function loadShaders(vertFile, fragFile) {
    THREE.Cache.enabled = true;
    const loader = new THREE.FileLoader();
    loader.load(vertFile,
        function (data) {
            gPointsMesh.material.vertexShader = resolveIncludes(data);
            gPointsMesh.material.needsUpdate = true;
        },
        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        function (err) {
            console.error('An error happened when loading the vertex shader');
        }
    );
    loader.load(fragFile,
        function (data) {
            gPointsMesh.material.fragmentShader = resolveIncludes(data);
            gPointsMesh.material.needsUpdate = true;
        },
        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        function (err) {
            console.error('An error happened when loading the fragment shader');
        }
    );
}

/////////////////////////////////////////////
// PHYSICS
/////////////////////////////////////////////

function preComputeFactorials(nMax) {
    const res = [];
    for (let i = 0; i < 2 * nMax; ++i) {
        res.push(factorial(i));
    }
    return res;
}

function factorial(n) {
    let N = n;
    let r = 1;
    while (N > 0) {
        r *= N--;
    }
    return r;
}

function permutation(k, n) {
    let perm = 1;
    for (let i = 0; i < k; ++i) {
        perm *= (n - i);
    }
    return perm;
}

function binomial(k, n) {
    return permutation(k, n) / factorial(k);
}

function glaguerre(x, a, n) {
    let Lag_n_minus_2 = 1.0;
    let Lag_n_minus_1 = 1.0 + a - x;
    let Lag_n;
    if (n == 0) {
        Lag_n = Lag_n_minus_2;
    } else if (n == 1) {
        Lag_n = Lag_n_minus_1;
    } else {
        for (let k = 2; k <= n; ++k) {
            Lag_n = ((2.0 * k - 1.0 + a - x) * Lag_n_minus_1 - (k - 1.0 + a) * Lag_n_minus_2) / k;
            Lag_n_minus_2 = Lag_n_minus_1;
            Lag_n_minus_1 = Lag_n;
        }
    }
    return Lag_n;
}

function preComputeCoeffAlegendre(nMax) {
    const res = [];
    for (let l = 0; l <= 2 * nMax; ++l) {
        const tp = [];
        for (let k = 0; k <= l; ++k) {
            tp.push(binomial(k, l) * binomial(l, (l + k - 1) / 2));
        }
        res.push(tp);
    }
    return res;
}

function alegendre(x, l, m) {
    let sum = 0.0;
    for (let k = m; k <= l; ++k) {
        // sum += permutation(m, k) *
        //     Math.pow(x, k - m) *
        //     binomial(k, l) *
        //     binomial(l, (l + k - 1) / 2);
        sum += Math.pow(x, k - m) * permutation(m, k) * gCoeffAlengendreKL[l][k];
    }
    return (m % 2 == 0 ? 1 : -1) *
        Math.pow(2.0, l) *
        Math.pow(1.0 - x * x, m * 0.5) *
        sum;
}


function preComputeCoeffSharmonics(nMax) {
    const res = [];
    for (let l = 0; l <= 2 * nMax; ++l) {
        const tp = [];
        for (let m = 0; m <= l; ++m) {
            tp.push(Math.sqrt((2 * l + 1) * gFactorials[l - m] / (4.0 * Math.PI * gFactorials[l + m])));
        }
        res.push(tp);
    }
    return res;
}


function sharmonics(costheta, phi, l, m) {
    // const condonShortleyPhase = (m % 2 == 0 ? 1 : -1); //en trop car déja dans alegendre
    const condonShortleyPhase = 1.0; //the phase is already in legendre poly
    // const value = condonShortleyPhase * Math.sqrt((2 * l + 1) * gFactorials[l - m] / (4.0 * Math.PI * gFactorials[l + m])) *
    const value = condonShortleyPhase * gCoeffSharmonicsLM[l][m] *
        alegendre(costheta, l, m);
    resultSHarmonics[0] = value * Math.cos(m * phi);
    resultSHarmonics[1] = value * Math.sin(m * phi);
    return resultSHarmonics;
}

function preComputeCoeffHWF(nMax) {
    const res = [];
    for (let n = 0; n < nMax + 1; ++n) {
        const tp = [];
        for (let l = 0; l < n; ++l) {
            tp.push(gFactorials[n - l - 1] / (2 * n * gFactorials[n + l]));
        }
        res.push(tp);
    }
    return res;
}

function hydrogenWaveFunction(r, costheta, phi, a0, n, l, m) {
    // const a0star=5.29e-11; // what is the unit ?
    const xi = 2.0 / (n * a0);
    const rho = xi * r;
    // const value = Math.sqrt(Math.pow(xi, 3.0) * factorial(n - l - 1) / (2 * n * factorial(n + l))) *
    const value = Math.sqrt(Math.pow(xi, 3.0) * gCoeffHWF[n][l]) *
        Math.exp(-rho * 0.5) *
        Math.pow(rho, l) *
        glaguerre(rho, 2 * l + 1, n - l - 1);
    const Y = sharmonics(costheta, phi, l, Math.abs(m));
    if (m < 0) {
        //i m negative, use complex conjugate and multiply by (-1)**m
        const s = (m % 2 == 0 ? 1 : -1);
        Y[0] *= s;
        Y[1] *= -s;
    }
    Y[0] *= value;
    Y[1] *= value;
    return Y;

}

function cart2sph(pos) {
    resultCart2Sph[0] = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]);
    resultCart2Sph[1] = Math.acos(pos[2] / resultCart2Sph[0]);
    resultCart2Sph[2] = Math.atan2(pos[1], pos[0]);
    return resultCart2Sph;
}

function sph2cart(pos) {
    resultSph2Cart[0] = pos[0] * Math.cos(pos[2]) * Math.sin(pos[1]);
    resultSph2Cart[1] = pos[0] * Math.sin(pos[2]) * Math.sin(pos[1]);
    resultSph2Cart[2] = pos[0] * Math.cos(pos[1]);
    return resultSph2Cart;
}

/////////////////////////////////////////////
// COLORS
/////////////////////////////////////////////

function colLerp(col1, col2, t) {
    const col = [0, 0, 0];
    for (let j = 0; j < 3; ++j) {
        col[j] = col1[j] * (1 - t) + col2[j] * t;
    }
    return col;
}

function threeColorsInterp(colLeft, colMid, colRight, t) {
    if (t < 0.5) {
        return colLerp(colLeft, colMid, 2.0 * t);
    } else {
        return colLerp(colMid, colRight, (t - 0.5) * 2.0);
    }
}

function mapColor(t, colorsmap) {
    const res = [0.0, 0.0, 0.0];
    for (let col of colorsmap) {
        for (let i = 0; i < 3; ++i) {
            res[i] = res[i] * t + col[i];
        }
    }
    return res;
}

function resetCamera() {
    gCamera.position.set(...gcCamZ.pos);
    gCamera.up.set(...gcCamZ.up);
    gCamera.lookAt(...gcCamZ.target);
}