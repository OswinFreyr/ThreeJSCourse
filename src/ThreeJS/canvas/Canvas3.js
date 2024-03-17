import * as ThreeCanvas from "@/ThreeJS/BasicAndMouse" ;
import * as THREE from "three";

let elementCube1
let elementSphere1
let elementCube3
let elementCube4

export function initAndBuildThree(container) {

    ThreeCanvas.initThreeJSBase(container, true);
    ThreeCanvas.toggleShadows();
    ThreeCanvas.toggleLights();

    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;
    ThreeCanvas.add(plane);

    let cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    let sphereGeo = new THREE.SphereGeometry(1,32,32);
    let colorRed = new THREE.MeshStandardMaterial({color: 'red'});
    let colorMagenta = new THREE.MeshStandardMaterial({color: 'magenta'});
    let colorGreen = new THREE.MeshStandardMaterial({color: 'green'});
    let colorYellow = new THREE.MeshStandardMaterial({color: 'yellow'});

    elementCube1 = new THREE.Mesh(cubeGeo, colorRed);
    elementCube1.position.set(2,0,0);
    elementSphere1 = new THREE.Mesh(sphereGeo, colorYellow);
    elementSphere1.position.set(0,0,2);
    elementCube3 = new THREE.Mesh(cubeGeo, colorGreen);
    elementCube3.position.set(0,2,0);
    elementCube4 = new THREE.Mesh(cubeGeo, colorMagenta);
    elementCube4.position.set(0,0,0);

    elementCube1.castShadow = true;
    elementCube1.receiveShadow = true;
    ThreeCanvas.add(elementCube1);
    elementSphere1.castShadow = true;
    elementSphere1.receiveShadow = true;
    ThreeCanvas.add(elementSphere1);
    elementCube3.castShadow = true;
    elementCube3.receiveShadow = true;
    ThreeCanvas.add(elementCube3);
    elementCube4.receiveShadow = true;
    ThreeCanvas.add(elementCube4);


    let element = new THREE.Mesh(cubeGeo, customMaterial);
    element.position.set(0, 1, 0);


    ThreeCanvas.setCustomRenderFunction(() => {
        customMaterial.uniforms.time.value += 0.05;
    });

    ThreeCanvas.getScene().add(element) ;

    ThreeCanvas.lookAtCoord(0,0,0);

    buildFogs();
    toggleFog(0);

}

let fogV1;
let fogV2;

export function buildFogs() {
    //const color = 0xAAAAAA;  // Replace with the color you want for the fog
    const color = "black";
    const near = 0.01;       // The minimum distance to start applying fog
    const far = 30;         // The maximum distance at which everything is completely fogged
    const density = 0.2;   // The density of the fog

    fogV1 = new THREE.Fog(color, near, far);
    fogV2 = new THREE.FogExp2(color, density);
}

export function toggleFog(type) {
    if(type == 0) {
        ThreeCanvas.getScene().fog = null ;
    } else if(type == 1) {
        ThreeCanvas.getScene().fog = fogV1 ;
    } else if((type == 2)) {
        ThreeCanvas.getScene().fog = fogV2 ;
    }
}

const customMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec2 vUv;
        uniform float time;
        
        void main() {
            vUv = uv;
            vec3 pos = position;
            float wave = sin(pos.x * 2.0 + pos.y * 2.0 + time) * 0.5;
            pos.z += wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;

        void main() {
            float mixFactor = sin(vUv.x * 3.1415);
            vec3 colorA = vec3(0.7,0.3,0.2);
            vec3 colorB = vec3(0.5,0.6,1);
            vec3 color = mix(colorA, colorB, mixFactor);
            gl_FragColor = vec4(color, 1.0);
        }
    `,
    uniforms: {
        time: { value: 0 }
    }
});