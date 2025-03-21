import { Vector3 } from 'three';
import { max } from 'three/tsl';

export const wheelInfo = {
    axleCs: new Vector3(0, 0, -1),
    suspensionRestLength: 0.125,
    suspensionStiffness: 24,
    maxSuspensionTravel: 0.2,
    rollInfluence: 0.01,
    radius: 0.15,
    frictionSlip: 0.8,
    sideFrictionStiffness: 1,
    // dampingRelaxation: 2.3,
    // dampingCompression: 4.4,
    maxSuspensionForce: 100000

    
}
// suspensionStiffness: 30,
// suspensionRestLength: 0.3,
// maxSuspensionForce: 100000,
// maxSuspensionTravel: 0.3,

// sideFrictionStiffness: 1,
// frictionSlip: 1.4,
// dampingRelaxation: 2.3,
// dampingCompression: 4.4,

// rollInfluence: 0.01,

export const spawn = {
    position: [-7, 2, -130],
    rotation: [0, Math.PI / 2, 0],
}

export const wheels = [
    // front
    { position: new Vector3(-1, -0.15, -0.6), ...wheelInfo },
    { position: new Vector3(-1, -0.15, 0.6), ...wheelInfo },
    // rear
    { position: new Vector3(0.65, -0.15, -0.6), ...wheelInfo },
    { position: new Vector3(0.65, -0.15, 0.6), ...wheelInfo },
]

export const cameraOffset = new Vector3(7, 3, 0)
export const cameraTargetOffset = new Vector3(0, 1.5, 0)

export const _bodyPosition = new Vector3()
export const _airControlAngVel = new Vector3()
export const _cameraPosition = new Vector3()
export const _cameraTarget = new Vector3()