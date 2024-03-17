import * as ThreeCanvas from "@/ThreeJS/BasicAndMouse" ;
import * as THREE from "three";

let isMoving = false;
let elementCube;
let elementSphere;
let texture;
let texture2;
let rotationSpeed = 0.5;
let isRotatingOnX = false;
let isRotatingOnY = false;
let isRotatingOnZ = false;
let isMovingOnX = false;
let isMovingOnY = false;
let isMovingOnZ = false;
let isRotating = false;
let grassPath = '/texture/grass/';
const woodPath = '/texture/wood/';

export function initAndBuildThree(container) {

    ThreeCanvas.initThreeJSBase(container, true) ;

    let cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    let colorMagenta = new THREE.MeshBasicMaterial({color: 'magenta'});
    let sphereGeo = new THREE.SphereGeometry(1,32,32);
    let colorGreen = new THREE.MeshBasicMaterial({color: 'green'});

    elementCube = new THREE.Mesh(cubeGeo, colorMagenta);
    elementCube.position.set(0, 0, 0);

    elementSphere = new THREE.Mesh(sphereGeo, colorGreen);
    texture = new THREE.TextureLoader().load(grassPath + 'grass.png');
    texture2 = new THREE.TextureLoader().load(woodPath + 'basecolor.jpg');
    elementSphere.material = new THREE.MeshBasicMaterial({map: texture});
    elementSphere.position.set(0, 2, 0);

    ThreeCanvas.getScene().add(elementCube);
    ThreeCanvas.getScene().add(elementSphere);
    ThreeCanvas.lookAtCoord(0,0,0);

    ThreeCanvas.setCustomRenderFunction((delta) => {
        if(isMoving) {
            elementCube.position.set(elementCube.position.x + (1 * delta), elementCube.position.y, elementCube.position.z);
            elementCube.position.set(elementCube.position.x, elementCube.position.y, elementCube.position.z + (1 * delta));
            ThreeCanvas.lookAtCoord(elementCube.position.x, elementCube.position.y, elementCube.position.z);
        }
        if(isMovingOnX) {
            elementCube.position.set(elementCube.position.x + (0.25 * delta), elementCube.position.y, elementCube.position.z);
        }
        if(isMovingOnY) {
            elementCube.position.set(elementCube.position.x, elementCube.position.y + (0.25 * delta), elementCube.position.z);
        }
        if(isMovingOnZ) {
            elementCube.position.set(elementCube.position.x, elementCube.position.y, elementCube.position.z + (0.25 * delta));
        }
        if(isRotatingOnX) {
            elementCube.rotation.x += rotationSpeed * delta;
            elementSphere.rotation.x += (rotationSpeed / 2) * delta;
        }
        if(isRotatingOnY) {
            elementCube.rotation.y += rotationSpeed * delta;
            elementSphere.rotation.y += (rotationSpeed / 2) * delta;
        }
        if(isRotatingOnZ) {
            elementCube.rotation.z += rotationSpeed * delta;
            elementSphere.rotation.z += (rotationSpeed / 2) * delta;
        }
        if(isRotating){
            elementCube.rotation.x += rotationSpeed * delta;
            elementSphere.rotation.x += (rotationSpeed / 2) * delta;
            elementCube.rotation.y += rotationSpeed * delta;
            elementSphere.rotation.y += (rotationSpeed / 2) * delta;
            elementCube.rotation.z += rotationSpeed * delta;
            elementSphere.rotation.z += (rotationSpeed / 2) * delta;
        }

    });
    document.addEventListener('keydown', event => {
        if(/^[Xx]$/i.test(event.key)){
            isRotatingOnX = !isRotatingOnX;
        }
        if(/^[Yy]$/i.test(event.key)){
            isRotatingOnY = !isRotatingOnY;
        }
        if(/^[Zz]$/i.test(event.key)){
            isRotatingOnZ = !isRotatingOnZ;
        }
        if(/^[Rr]$/i.test(event.key)){
            isRotating = !isRotating;
        }
        if(/^[VK_NUMPAD0]$/i.test(event.key)){
            elementSphere.material = new THREE.MeshBasicMaterial({map: texture});
        }
        if(/^[VK_NUMPAD1]$/i.test(event.key)){
            elementSphere.material = new THREE.MeshBasicMaterial({map: texture2});
        }
    });
    // setInterval(movChange, 3000);


}

// export function getElementPosition() {
//     return elementCube.getPosition() ;
// }

export function setMoving(makeMove) {
    isMoving = makeMove ;
}

export function resetCubePosition() {
    elementCube.position.set(0, 0, 0);
}

export function setMovingOnX(makeMove) {
    isRotatingOnX = makeMove ;
}

export function setMovingOnY(makeMove) {
    isRotatingOnY = makeMove ;
}

export function setMovingOnZ(makeMove) {
    isRotatingOnZ = makeMove ;
}

export function resetCubeRotation() {
    elementCube.rotation.set(0, 0, 0);
}

export function movChange(){
    if(isMovingOnX){
        isMovingOnX = false;
        isMovingOnY = true;
    }else if(isMovingOnY){
        isMovingOnY = false;
        isMovingOnZ = true;
    } else if(isMovingOnZ) {
        isMovingOnZ = false;
        isMovingOnX = true;
    }else {
        isMovingOnX = true;
    }
}