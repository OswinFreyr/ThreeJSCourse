import * as ThreeCanvas from "@/ThreeJS/BasicAndMouse" ;
import * as THREE from "three";

const renderer = new THREE.WebGLRenderer( { antialias: true } );


export function initAndBuildThree(container, canvas) {

    container.appendChild( renderer.domElement );
    ThreeCanvas.enterScene(container,'/scene/scene.json');

    canvas.addEventListener( 'mousedown', () => {
        document.body.requestPointerLock();
    } );
}