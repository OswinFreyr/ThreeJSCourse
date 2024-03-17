import * as ThreeCanvas from "@/ThreeJS/BasicAndMouse" ;
import * as THREE from "three";

const woodPath = '/texture/wood/';


export function initAndBuildThree(container) {

    ThreeCanvas.initThreeJSBase(container, true) ;

    let cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    let colorRed = new THREE.MeshBasicMaterial({color: 'red'});
    let colorMagenta = new THREE.MeshBasicMaterial({color: 'magenta'});
    let colorGreen = new THREE.MeshBasicMaterial({color: 'green'});

    // let elementCube = new THREE.Mesh(cubeGeo, colorRed);
    // elementCube.position.set(0, 1, 0);
    let elementCube = new THREE.Mesh(cubeGeo, colorMagenta);
    elementCube.position.set(0,5,0);

    let elementCube2 = new THREE.Mesh(cubeGeo, colorGreen);
    elementCube2.position.set(0, 1, 2);

    let coneGeo = new THREE.ConeGeometry(1,2,32);
    let elementCone = new THREE.Mesh(coneGeo, colorGreen);
    let texture = new THREE.TextureLoader().load(woodPath + 'basecolor.jpg');
    elementCone.material = new THREE.MeshBasicMaterial({map: texture});
    elementCone.position.set(2, 1, 0);

    let anneauGeo = new THREE.RingGeometry(1, 5, 32);
    let elementAnneau = new THREE.Mesh(anneauGeo, colorRed);
    elementAnneau.material = new THREE.MeshBasicMaterial({map: texture});
    elementAnneau.position.set(3,1,3);

    ThreeCanvas.getScene().add(elementCube);
    // ThreeCanvas.lookAtIm(elementCube);
    ThreeCanvas.getScene().add(elementCube2);
    // ThreeCanvas.lookAtIm(elementCube2);
    ThreeCanvas.getScene().add(elementCone);
    ThreeCanvas.getScene().add(elementAnneau);
    ThreeCanvas.lookAtCoord(0,0,0);



}