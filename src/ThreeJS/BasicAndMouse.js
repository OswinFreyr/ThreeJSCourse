/* eslint-disable no-unused-vars */
import * as THREE from "three";
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import {createApp } from 'vue';
import {Capsule} from 'three/addons/math/Capsule.js';
import { Octree } from 'three/addons/math/Octree.js';



let inDebuggingMode;
let frameId;

const mouse = {x: 0, y: 0};
let mouse3D = new THREE.Vector3();


let renderer, canvas, camera;
let scene, container;
let controls ;
let canvasBounds;
let externalRenderFunction = null;
let externalMouseMovementFunction = null;

let cameraStartX, cameraStartY, cameraStartZ ;

let uiElements = [] ;
//let uiElementsFunctions = [] ;
const clock = new THREE.Clock();

export function getRenderer()
{
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    return renderer ;
}

export function getScene()
{
    return scene ;
}

/*export function setScene(newScene)
{
    scene = newScene ;
}*/

function builtEventListener() {
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('scroll', updateCanvasBounds, false);
}

function onWindowResize() {
    if (!camera || !renderer || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (inDebuggingMode) {
        console.log('Resizing to:', width, height);
    }

    // Update camera aspect ratio and renderer size
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    updateCanvasBounds();
}

function updateCanvasBounds() {
    if (renderer && renderer.domElement) {
        console.log('Updating canvas bounds to ' + renderer.domElement.getBoundingClientRect().width + 'x' + renderer.domElement.getBoundingClientRect().height + 'px');
        canvasBounds = renderer.domElement.getBoundingClientRect();
    } else {
        console.log('Unable to act on updateCanvasBounds(). No renderer or renderer.domElement found.')
    }
}



export function initThreeJSBase(isContainer, inDebug, maScene, maCamera) {

    container = isContainer;
    inDebuggingMode = inDebug ;
    builtEventListener() ;

    if (!container) {
        console.error('No container element provided for Three.js initialization.');
        return;
    }

    canvas = container.querySelector('canvas');

    if (!canvas) {
        console.error('No canvas element found in the container.');
        return;
    }

    createRenderer(canvas, !inDebuggingMode);
    updateCanvasBounds();
    if(maCamera)
        importCamera(container.clientWidth, container.clientHeight,  maCamera) ;
    else
        createCamera(container.clientWidth, container.clientHeight);


    // Si je n'ai pas déja défini ma scene
    if(!maScene)
        scene = new THREE.Scene();
    else
        scene = maScene ;

    if (inDebuggingMode) {
        setInDebug(true);
    }

    let firstRender = true;
    let lastRenderTime = 0;

    onWindowResize() ;

    function render(time) {

        makeRenderCheck() ;

        if(controls)
            controls.update( clock.getDelta() );

        time *= 0.001;

        // Calculate the delta time
        const deltaTime = time - lastRenderTime;

        lastRenderTime = time;

        if (externalRenderFunction) {
            externalRenderFunction(deltaTime);
        }

        frameId = requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    function makeRenderCheck() {
        if (firstRender) {
            firstRender = false;
            container.style.display = 'flex'; // Show the canvas after the first render
        }
    }

    requestAnimationFrame(render);
}

export function addUIComponent(MyComponent, startInvisible = true, forceCss = true) {

    const element = document.createElement('div');
    const app = createApp(MyComponent);
    app.mount(element);

    document.querySelector('#dynamic-container').appendChild(element);

    if(startInvisible) {
        element.style.visibility = 'hidden';
    }

    if(forceCss) {
        setCssForUI(element);
    }

    uiElements.push(element) ;

    return element ;
}

function setCssForUI(element) {

    element.style.position = "absolute";
    element.style.transform = "translate(-50%, -50%)";
    element.style.zIndex = '1000';
    element.style.overflow = "hidden" ;

    // element.classList.add('my-custom-style');
}

export function followElement(htmlElement, elementToFollow, decalX = 0, decalY = 0) {

    if(!htmlElement || !elementToFollow) {
        console.log("Can't follow yet")
        return ;
    }


    const vector = new THREE.Vector3();

    // Convert the world position of the mesh to screen space
    vector.setFromMatrixPosition(elementToFollow.matrixWorld);
    vector.project(camera);

    // Convert the normalized screen space coordinates to CSS coordinates

    const x = (vector.x *  .5 + .5) * renderer.domElement.clientWidth + decalX;
    const y = -(vector.y * .5 - .5) * renderer.domElement.clientHeight + decalY;

    // Update the position of the HTML element
    var rect = canvas.getBoundingClientRect();

    let posX = x + rect.left ;
    let posY = y + rect.top ;

    htmlElement.style.left = posX + "px";
    htmlElement.style.top = posY + "px";
}

let playerCollider;
let playerVelocity;
let playerDirection;
let playerOnFloor = false;
const keyStates = {};
const GRAVITY = 30;
const STEPS_PER_FRAME = 5;
const worldOctree = new Octree();
const raycaster = new THREE.Raycaster();
let cameraFPS;

let currentScene = null;

export function enterScene(isContainer, scenePath, cameraName, inDebug = true, toggleShadow = true) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.ObjectLoader();
        let sceneCamera;

        // Clear existing scene if it exists
        if (currentScene) {
            currentScene.children.forEach(child => {
                if (child.type === 'Mesh') {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            currentScene = null;
        }

        loader.load(
            scenePath, // Path to your exported scene file
            function (maScene) {
                // Fait apres le chargement
                cameraFPS = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
                cameraFPS.rotation.order = 'YXZ';

                initThreeJSBase(isContainer, inDebug, maScene, sceneCamera);

                if (toggleShadow)
                    toggleShadows();

                document.addEventListener('keydown', (event) => {
                    keyStates[event.code] = true;
                });
                document.addEventListener('keyup', (event) => {
                    keyStates[event.code] = false;
                });

                document.addEventListener('mouseup', () => {
                    if (document.pointerLockElement !== null) {
                        // essai raycasting
                        /*raycaster.setFromCamera(getMouse2D(), getCamera());
                        const intersects = raycaster.intersectObjects(scenePath);

                        if (intersects.length > 0) {
                            // Le premier bloc qui intersect avec mon rayon
                            let intersect = intersects[0].object ;
                            const clickedObjectUserData = intersect.userData;

                            console.log("Clicked ID:", clickedObjectUserData.id);
                        }*/
                    }
                });
                document.body.addEventListener('mousemove', (event) => {

                    if (document.pointerLockElement === document.body) {
                        cameraFPS.rotation.y -= event.movementX / 500;
                        cameraFPS.rotation.x -= event.movementY / 500;
                    }

                });

                playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);
                playerVelocity = new THREE.Vector3();
                playerDirection = new THREE.Vector3();

                worldOctree.fromGraphNode(maScene);

                maScene.traverse(child => {

                    if (child.isMesh) {

                        child.castShadow = true;
                        child.receiveShadow = true;

                        if (child.material.map) {

                            child.material.map.anisotropy = 4;

                        }

                    }

                });

                currentScene = maScene; // Update current scene
                resolve(maScene);
                animate();
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (err) {
                console.error('An error happened' + err);
                reject(err);
            }
        );
    });
}

// Function to reload the scene
export function reloadScene(container, scenePath, cameraName, inDebug = true, toggleShadow = true) {
    return new Promise((resolve, reject) => {
        if (!currentScene) {
            reject("No scene loaded to reload.");
            return;
        }
        enterScene(container, scenePath, cameraName, inDebug, toggleShadow)
            .then(scene => {
                resolve(scene);
            })
            .catch(err => {
                reject(err);
            });
    });
}

/*
export function enterScene(isContainer, scenePath, cameraName, inDebug = true, toggleShadow = true) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.ObjectLoader();
        let sceneCamera ;
        loader.load(
            scenePath, // Path to your exported scene file
            function ( maScene ) {
                // Fait apres le chargement
                cameraFPS = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );
                cameraFPS.rotation.order = 'YXZ';

                initThreeJSBase(isContainer, inDebug, maScene, sceneCamera ) ;

                if(toggleShadow)
                    toggleShadows() ;

                document.addEventListener( 'keydown', ( event ) => {
                    keyStates[ event.code ] = true;
                } );
                document.addEventListener( 'keyup', ( event ) => {
                    keyStates[ event.code ] = false;
                } );

                document.addEventListener( 'mouseup', () => {
                    if ( document.pointerLockElement !== null ) {
                        // essai raycasting
                        /*raycaster.setFromCamera(getMouse2D(), getCamera());
                        const intersects = raycaster.intersectObjects(scenePath);

                        if (intersects.length > 0) {
                            // Le premier bloc qui intersect avec mon rayon
                            let intersect = intersects[0].object ;
                            const clickedObjectUserData = intersect.userData;

                            console.log("Clicked ID:", clickedObjectUserData.id);
                        }*//*
                    }
                } );
                document.body.addEventListener( 'mousemove', ( event ) => {

                    if ( document.pointerLockElement === document.body ) {
                        cameraFPS.rotation.y -= event.movementX / 500;
                        cameraFPS.rotation.x -= event.movementY / 500;
                    }

                } );

                playerCollider = new Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );
                playerVelocity = new THREE.Vector3();
                playerDirection = new THREE.Vector3();

                worldOctree.fromGraphNode( maScene );

                maScene.traverse( child => {

                    if ( child.isMesh ) {

                        child.castShadow = true;
                        child.receiveShadow = true;

                        if ( child.material.map ) {

                            child.material.map.anisotropy = 4;

                        }

                    }

                } );

                resolve(maScene);
                animate();
            },
            function ( xhr ) {
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },
            function ( err ) {
                console.error( 'An error happened' + err);
                reject(err);
            }
        );
    });
}*/

export function setCustomRenderFunction(func) {
    externalRenderFunction = func;
}

export function toggleShadows() {
    renderer.shadowMap.enabled = !renderer.shadowMap.enabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows
}


function onMouseMove(event) {
    if (!camera || !canvasBounds) return;

    // Clamp the mouse position to the canvas bounds
    const clampedX = Math.min(Math.max(event.clientX, canvasBounds.left), canvasBounds.right);
    const clampedY = Math.min(Math.max(event.clientY, canvasBounds.top), canvasBounds.bottom);

    // Calculate mouse position relative to the canvas
    mouse.x = ((clampedX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    mouse.y = -((clampedY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

    mouse3D.set(mouse.x, mouse.y, 0.0); // Set Z between -1 and 1

    if (externalMouseMovementFunction) {
        externalMouseMovementFunction(mouse);
    }
}

function createRenderer(canvas, isTransparent) {
    if (renderer) {
        renderer.dispose();
    }

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
        alpha: isTransparent
    });
}

function createCamera(width, height) {
    const fov = 50;
    const aspect = width / height; // Adjust for canvas size
    const near = 0.1;
    const far = 20000;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    cameraStartX = 3 ;
    cameraStartY = 3 ;
    cameraStartZ = 3 ;

    resetCamera() ;
}

function importCamera(width, height, maCamera) {
    maCamera.fov = 50;
    maCamera.aspect = width / height;
    maCamera.near = 0.1;
    maCamera.far = 20000;

    camera = maCamera ;

    cameraStartX = camera.position.x ;
    cameraStartY = camera.position.y ;
    cameraStartZ = camera.position.z ;
}

export function resetCamera() {
    camera.position.x = cameraStartX;
    camera.position.y = cameraStartY;
    camera.position.z = cameraStartZ;
}

export function setCameraPosition(x,y,z, asInitPosition = false) {
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;

    if(asInitPosition) {
        cameraStartX = x ;
        cameraStartY = y ;
        cameraStartZ = z ;
    }
}

export function toggleVisibility(forElement) {
    if (forElement.style.visibility === 'hidden') {
        forElement.style.visibility = 'visible';
    } else {
        forElement.style.visibility = 'hidden';
    }
}

export function getCamera() {
    return camera ;
}

export function setCamera(newCamera) {
    camera = newCamera
}

export function zoomInOrOut(zoomIn) {
    let zoomStep = 2;

    let cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    if (zoomIn) {
        camera.position.addScaledVector(cameraDirection, zoomStep);
    } else {
        camera.position.addScaledVector(cameraDirection, -zoomStep);
    }
}

export function setAsCastAndReceive(model, cast =true, receive=true) {
    model.traverse(function(object) {
        if (object.isMesh) {
            object.castShadow = cast;
            object.receiveShadow = receive;
        }
    });
}

// Debugging stuff
let line;
let axesHelper ;

export function setInDebug(setOrRemove) {

    if(!axesHelper || !line) {
        initDebug() ;
    }

    if(setOrRemove) {
        scene.add(axesHelper);
        scene.add(line);
        createRenderer(canvas,false) ;
    } else {
        scene.remove(axesHelper);
        scene.remove(line);
        createRenderer(canvas, true) ;
    }
}

export function getMouse2D() {
    return mouse ;
}

export function getNormalizedMouse() {

    if(mouse3D) {
        return mouse3D.clone().normalize() ;
    } else {
        console.log("PAS DE MOUSE 3D a NORMALISE")
        return null ;
    }

}

function initDebug() {
    // Create axis helper to display the center of the rendering
    axesHelper = new THREE.AxesHelper(10);

    // Create a line between the center and the mouse
    let lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});
    let lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
    line = new THREE.Line(lineGeometry, lineMaterial);
}

export function lookAtIm(element) {
    camera.lookAt(element.position) ;
}

export function add(element) {
    scene.add(element) ;
}

let directionalLight
let lightsAreOn ;

export function toggleLights() {
    initLight() ;
    if(lightsAreOn) {
        scene.remove(directionalLight);
    } else {
        scene.add(directionalLight);
    }

    return directionalLight ;
}

export function setLightPosition(x,y,z) {
    initLight() ;

    if(!x) {
        x = directionalLight.position.x ;
    }
    if(!y) {
        y = directionalLight.position.y ;
    }
    if(!z) {
        z = directionalLight.position.z ;
    }

    directionalLight.position.set(x, y, z);
}

export function initLightPrecise(x,y,z) {
    if(!directionalLight) {
        directionalLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
        directionalLight.position.set( - 5, 25, - 1 );
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.01;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.left = - 30;
        directionalLight.shadow.camera.top	= 30;
        directionalLight.shadow.camera.bottom = - 30;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.bias = - 0.00006;
    }

    return directionalLight ;
}

export function initLight() {
    return initLightPrecise(5, 10, 7.5) ;
}

export function setControl_FirstPerson(setMovementSpeed = 1000, setLookSpeed = 0.125, setLookVertical =true) {
    controls = new FirstPersonControls( camera, renderer.domElement );

    controls.movementSpeed = setMovementSpeed;
    controls.lookSpeed = setLookSpeed;
    controls.lookVertical = setLookVertical;
}

/*export function setControl_kill() {
    controls = null ;
}*/

export function removeEventListeners() {
    window.removeEventListener('mousemove', onMouseMove, false);
    window.removeEventListener('resize', onWindowResize, false);
    window.removeEventListener('scroll', updateCanvasBounds, false);
    window.removeEventListener('mousedown', updateCanvasBounds, false);
}

function cleanUI() {
    let uiContainer = document.querySelector('#dynamic-container')
    uiElements.forEach(el => uiContainer.removeChild(el)) ;

    uiElements = [] ;
}

export function cleanupThreeJS() {
    cancelAnimationFrame(frameId);
    removeEventListeners() ;
    cleanUI() ;
}

export function lookAtCoord(x,y,z) {
    camera.lookAt(x,y,z) ;
}
export function setBackgroundColor(color) {
    scene.background = new THREE.Color( color );
}

/*------------------Fonctions ajoutées-------------------*/
function playerCollisions() {
    const result = worldOctree.capsuleIntersect( playerCollider );
    playerOnFloor = false;
    if ( result ) {
        playerOnFloor = result.normal.y > 0;
        if ( ! playerOnFloor ) {
            playerVelocity.addScaledVector( result.normal, - result.normal.dot( playerVelocity ) );
        }
        playerCollider.translate( result.normal.multiplyScalar( result.depth ) );
    }
}

function updatePlayer( deltaTime ) {
    let damping = Math.exp( - 4 * deltaTime ) - 1;
    if ( ! playerOnFloor ) {
        playerVelocity.y -= GRAVITY * deltaTime;
        // small air resistance
        damping *= 0.1;
    }
    playerVelocity.addScaledVector( playerVelocity, damping );
    const deltaPosition = playerVelocity.clone().multiplyScalar( deltaTime );
    playerCollider.translate( deltaPosition );
    playerCollisions();
    cameraFPS.position.copy( playerCollider.end );
}

function getForwardVector() {
    cameraFPS.getWorldDirection( playerDirection );
    playerDirection.y = 0;
    playerDirection.normalize();
    return playerDirection;
}

function getSideVector() {
    cameraFPS.getWorldDirection( playerDirection );
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross( cameraFPS.up );
    return playerDirection;
}

function keysControls( deltaTime ) {
    // gives a bit of air control
    const speedDelta = deltaTime * ( playerOnFloor ? 25 : 8 );

    if ( keyStates[ 'KeyW' ] ) {
        playerVelocity.add( getForwardVector().multiplyScalar( speedDelta ) );
    }
    if ( keyStates[ 'KeyS' ] ) {
        playerVelocity.add( getForwardVector().multiplyScalar( - speedDelta ) );
    }
    if ( keyStates[ 'KeyA' ] ) {
        playerVelocity.add( getSideVector().multiplyScalar( - speedDelta ) );
    }
    if ( keyStates[ 'KeyD' ] ) {
        playerVelocity.add( getSideVector().multiplyScalar( speedDelta ) );
    }
    if ( playerOnFloor ) {
        if ( keyStates[ 'Space' ] ) {
            playerVelocity.y = 15;
        }
    }
}

function teleportPlayerIfOob() {
    if ( cameraFPS.position.y <= - 25 ) {
        playerCollider.start.set( 0, 0.35, 0 );
        playerCollider.end.set( 0, 1, 0 );
        playerCollider.radius = 0.35;
        cameraFPS.position.copy( playerCollider.end );
        cameraFPS.rotation.set( 0, 0, 0 );
    }
}


function animate() {
    const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;
    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.
    for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {
        keysControls( deltaTime );
        updatePlayer( deltaTime );
        teleportPlayerIfOob();
    }
    renderer.render( scene, cameraFPS );
    requestAnimationFrame( animate );
}

function resetScene() {

}