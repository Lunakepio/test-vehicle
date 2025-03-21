import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { spawn } from "./Constants";
import { Physics, RigidBody } from "@react-three/rapier";
import {
  Environment,
  KeyboardControls,
  OrbitControls,
  Preload,
} from "@react-three/drei";
import { Vehicle } from "./Vehicle";
import { Chevreuse } from "./Chevreuse";
import { Lighting } from "./Lighting";
import { PCFSoftShadowMap } from "three";
import {
  Bloom,
  EffectComposer,
  LUT,
  SMAA,
  N8AO,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { LUTCubeLoader } from "postprocessing";

export const WorldCanvas = () => {
  const controls = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "back", keys: ["ArrowDown", "KeyS"] },
    { name: "left", keys: ["ArrowLeft", "KeyA"] },
    { name: "right", keys: ["ArrowRight", "KeyD"] },
    { name: "brake", keys: ["Space"] },
    { name: "reset", keys: ["KeyR"] },
  ];

  // const { scene } = useGLTF('./chevreuse-2.glb')

  return (
    <Canvas
      shadows
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Lighting />
      <color attach="background" args={["#005249"]} />
      <fog attach="fog" args={["#002523", 50, 150]} />
      <Suspense fallback={null}>
        <Physics timeStep={"vary"}>
          <KeyboardControls map={controls}>
            <Vehicle position={spawn.position} rotation={spawn.rotation} />
          </KeyboardControls>

          {/* <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]} userData={{ outOfBounds: true }}>
              <mesh>
                  <boxGeometry args={[600, 1, 600]} />
                  <meshStandardMaterial color="#ff5555" />
              </mesh>
          </RigidBody> */}
          <Chevreuse />
        </Physics>
        <Composer />

        {/* <Environment preset="night" background/> */}

        {/* <OrbitControls makeDefault /> */}
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export const Composer = () => {

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0}
        intensity={0.3}
        mipmapBlur
      />
      <BrightnessContrast brightness={0.001} contrast={-0.01} />
      <SMAA />
    </EffectComposer>
  );
};