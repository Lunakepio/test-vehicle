import { useRapier, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useRef} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useVehicleController } from "./useVehicleController";
import { useKeyboardControls } from "@react-three/drei";
import { useControls } from "leva";
import {
  wheels,
  _airControlAngVel,
  _cameraTarget,
  _cameraPosition,
  _bodyPosition,
} from "./Constants";

export const Vehicle = ({ position, rotation }) => {
  const { world, rapier } = useRapier();
  const threeControls = useThree((s) => s.controls);
  const [, get] = useKeyboardControls();

  const chasisMeshRef = useRef(null);
  const chasisBodyRef = useRef(null);
  const wheelsRef = useRef([]);
  const cameraPositionRef = useRef(null);
  const cameraTargetRef = useRef(null);
  const leftLightTargetRef = useRef(null);
  const rightLightTargetRef = useRef(null);
  const leftLightRef = useRef(null);
  const rightLightRef = useRef(null);

  const { vehicleController } = useVehicleController(
    chasisBodyRef,
    wheelsRef,
    wheels,
  );

  const { accelerateForce, brakeForce, steerAngle, slip } = useControls(
    "rapier-dynamic-raycast-vehicle-controller",
    {
      accelerateForce: { value: 1.5, min: 0, max: 10 },
      brakeForce: { value: 0.001, min: 0, max: 0.5, step: 0.01 },
      steerAngle: { value: Math.PI / 8, min: 0, max: Math.PI },
      slip: { value: 50, min: 0, max: 2, step: 0.01 },
    },{
      collapsed: true
    }
  );

  const ground = useRef(null);

  useFrame((state, delta) => {
    if (!chasisMeshRef.current || !vehicleController.current || !!threeControls)
      return;

    const t = 1.0 - Math.pow(0.01, delta);

    const controller = vehicleController.current;
    const chassisRigidBody = controller.chassis();
    const { forward, back, left, right, brake } = get();


    const ray = new rapier.Ray(chassisRigidBody.translation(), {
      x: 0,
      y: -1,
      z: 0,
    });
    const raycastResult = world.castRay(
      ray,
      1,
      false,
      undefined,
      undefined,
      undefined,
      chassisRigidBody,
    );

    ground.current = null;

    if (raycastResult) {
      const collider = raycastResult.collider;
      // const userData = collider.parent()?.userData;
      // outOfBounds = userData?.outOfBounds;
      ground.current = collider;
    }

    const engineForce = Number(forward) * accelerateForce - Number(back) * 2;
    controller.setWheelEngineForce(0, engineForce);
    controller.setWheelEngineForce(1, engineForce);

    // controller.setWheelFrictionSlip(0, slip / 3);
    // controller.setWheelFrictionSlip(1, slip / 3);
    // controller.setWheelFrictionSlip(2, slip);
    // controller.setWheelFrictionSlip(3, slip);

    const wheelBrake = brakeForce;
    // controller.setWheelBrake(0, wheelBrake);
    // controller.setWheelBrake(1, wheelBrake);
    controller.setWheelBrake(2, wheelBrake * Number(!forward));
    controller.setWheelBrake(3, wheelBrake * Number(!forward));

    const suspensionLength = Number(brake) + 0.3;

    controller.setWheelSuspensionRestLength(0, suspensionLength);
    controller.setWheelSuspensionRestLength(1, suspensionLength);
    controller.setWheelSuspensionRestLength(2, suspensionLength);
    controller.setWheelSuspensionRestLength(3, suspensionLength);

    const currentSteering = controller.wheelSteering(0) || 0;
    const steerDirection = Number(left) - Number(right);
    const steering = THREE.MathUtils.lerp(
      currentSteering,
      steerAngle * steerDirection,
      0.02,
    );

    controller.setWheelSteering(0, steering);
    controller.setWheelSteering(1, steering);

    // console.log(controller.wheelEngineForce(0), controller.currentVehicleSpeed(0));

    if (!ground.current) {
      const forwardAngVel = Number(forward) - Number(back);
      const sideAngVel = Number(left) - Number(right);

      const angvel = _airControlAngVel.set(
        0,
        sideAngVel * t,
        forwardAngVel * t,
      );
      angvel.applyQuaternion(chassisRigidBody.rotation());
      angvel.add(chassisRigidBody.angvel());

      chassisRigidBody.setAngvel(
        new rapier.Vector3(angvel.x, angvel.y, angvel.z),
        true,
      );
    }

    state.camera.position.lerp(
      cameraPositionRef.current.getWorldPosition(new THREE.Vector3()),
      0.12,
    );
    state.camera.lookAt(
      cameraTargetRef.current.getWorldPosition(new THREE.Vector3()),
    );

    // if (controls.reset || outOfBounds) {
    //     const chassis = controller.chassis();
    //     chassis.setTranslation(new rapier.Vector3(...spawn.position), true);
    //     const spawnRot = new THREE.Euler(...spawn.rotation);
    //     const spawnQuat = new THREE.Quaternion().setFromEuler(spawnRot);
    //     chassis.setRotation(spawnQuat, true);
    //     chassis.setLinvel(new rapier.Vector3(0, 0, 0), true);
    //     chassis.setAngvel(new rapier.Vector3(0, 0, 0), true);
    // }

    // const cameraPosition = _cameraPosition;

    // if (!ground.current) {
    //     cameraPosition.copy(cameraOffset);
    //     const bodyWorldMatrix = chasisMeshRef.current.matrixWorld;
    //     cameraPosition.applyMatrix4(bodyWorldMatrix);
    // } else {
    //     const velocity = chassisRigidBody.linvel();
    //     cameraPosition.copy(velocity);
    //     cameraPosition.normalize();
    //     cameraPosition.multiplyScalar(-10);
    //     cameraPosition.add(chassisRigidBody.translation());
    // }

    // cameraPosition.y = Math.max(cameraPosition.y, (vehicleController.current?.chassis().translation().y ?? 0) + 1);

    // smoothedCameraPosition.lerp(cameraPosition, t);
    // state.camera.position.copy(smoothedCameraPosition);

    // const bodyPosition = chasisMeshRef.current.getWorldPosition(_bodyPosition);
    // const cameraTarget = _cameraTarget;

    // cameraTarget.copy(bodyPosition);
    // cameraTarget.add(cameraTargetOffset);
    // smoothedCameraTarget.lerp(cameraTarget, t);

    // state.camera.lookAt(smoothedCameraTarget);
    //

    if (leftLightRef.current && leftLightTargetRef.current) {
      leftLightRef.current.target = leftLightTargetRef.current;
      rightLightRef.current.target = rightLightTargetRef.current;
    }
    
    state.camera.updateProjectionMatrix();
    state.camera.updateMatrixWorld();
  });

  const spotLightControls = useControls("SpotLight", {
    // position: { value: [-2, -0.2, -0.3], step: 0.1 },
    angle: { value: 1.1, min: 0, max: Math.PI / 2, step: 0.01 },
    decay: { value: 0.1, min: 0, max: 2, step: 0.1 },
    distance: { value: 100, min: 0, max: 150, step: 1 },
    penumbra: { value: 0.1, min: 0, max: 1, step: 0.1 },
    intensity: { value: 65, min: 0, max: 1000, step: 1 },
    color: { value: "#ffa200" },
  },{
    collapsed: true
  });
  const cameraPositionControls = useControls("Camera Position", {
    position: { value: [7, 16, 0], step: 0.1 },
    fov: { value: 44, min: 1, max: 180, step: 1 },
  },{
    collapsed: true
  })
  
  const cameraLookAtControls = useControls("Camera Look At", {
    position: { value: [-15, 1, 0], step: 0.1 },
  },{
    collapsed: true
  })
  
  return (
    <>
      <RigidBody
        position={position}
        rotation={rotation}
        canSleep={false}
        ref={chasisBodyRef}
        colliders={false}
        type="dynamic"
      >
        <CuboidCollider args={[0.8, 0.2, 0.4]} />

        <mesh ref={chasisMeshRef}>
          <mesh ref={leftLightTargetRef} position={[-10, -10, -0.4]}></mesh>
          <mesh ref={rightLightTargetRef} position={[-10, -10, 0.4]}></mesh>
          <spotLight
            position={[-2, 1.2, -0.3]}
            ref={leftLightRef}
            {...spotLightControls}
            // shadow-normalBias={-0.1}
            shadow-mapSize-height={4096}
              shadow-mapSize-width={4096}
              shadow-bias={-0.001}
              castShadow={true}
          />
          <spotLight
            position={[-2, 1.2, 0.3]}
            ref={rightLightRef}
            {...spotLightControls}
            shadow-mapSize-height={4096}
              shadow-mapSize-width={4096}
              shadow-bias={-0.001}
              castShadow={false}
          />
          <boxGeometry args={[1.6, 0.4, 0.8]} />
        </mesh>

        <group ref={cameraPositionRef} {...cameraPositionControls}>
          {/* <boxGeometry args={[1, 1, 1]} /> */}
        </group>

        <group ref={cameraTargetRef} {...cameraLookAtControls}>
          {/* <boxGeometry args={[1, 1, 1]} /> */}
        </group>

        {/* <PerspectiveCamera position={[-5, 2, 10]} makeDefault={true} /> */}
        {wheels.map((wheel, index) => (
          <group
            key={index}
            ref={(ref) => (wheelsRef.current[index] = ref)}
            position={wheel.position}
          >
            <group rotation-x={-Math.PI / 2}>
              <mesh>
                <cylinderGeometry args={[0.15, 0.15, 0.25, 16]} />
                <meshStandardMaterial color="#222" />
              </mesh>
              <mesh scale={1.01}>
                <cylinderGeometry args={[0.15, 0.15, 0.25, 6]} />
                <meshStandardMaterial color="#fff" wireframe />
              </mesh>
            </group>
          </group>
        ))}
      </RigidBody>
    </>
  );
};
