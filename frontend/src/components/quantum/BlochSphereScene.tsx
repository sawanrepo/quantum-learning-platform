import { OrbitControls, Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { BlochVector } from "@/lib/quantum-api";

const BEAM = "#5cd8e6";
const MEASURE = "#f0b357";
const PHASE = "#b28cf5";

function Ring({
  rotation,
  color,
  opacity,
}: {
  rotation: [number, number, number];
  color: string;
  opacity: number;
}) {
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2);
    return new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(128).map((p) => new THREE.Vector3(p.x, p.y, 0)),
    );
  }, []);
  return (
    <primitive object={new THREE.Line(points, new THREE.LineBasicMaterial({ color, transparent: true, opacity }))} rotation={rotation} />
  );
}

function Axis({
  dir,
  label,
  color,
}: {
  dir: [number, number, number];
  label: string;
  color: string;
}) {
  const end = new THREE.Vector3(...dir).multiplyScalar(1.32);
  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), end]),
    [end.x, end.y, end.z],
  );
  return (
    <group>
      <primitive
        object={new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 }),
        )}
      />
      <Html position={end.toArray()} center>
        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
            color,
            opacity: 0.85,
            userSelect: "none",
          }}
        >
          {label}
        </span>
      </Html>
    </group>
  );
}

function StateVector({ vector }: { vector: BlochVector }) {
  const group = useRef<THREE.Group>(null);
  const target = useMemo(
    /* Bloch (x, y, z) -> three.js (x, z, y) so +z points up on screen */
    () => new THREE.Vector3(vector.x, vector.z, vector.y),
    [vector.x, vector.y, vector.z],
  );
  const current = useRef(new THREE.Vector3(0, 1, 0));
  const tip = useRef<THREE.Mesh>(null);
  const line = useRef<THREE.Line>(null);

  useFrame(() => {
    current.current.lerp(target, 0.12);
    const v = current.current;
    if (tip.current) tip.current.position.copy(v);
    if (line.current) {
      const geo = line.current.geometry as THREE.BufferGeometry;
      geo.setFromPoints([new THREE.Vector3(0, 0, 0), v.clone()]);
    }
    if (group.current) group.current.rotation.y += 0.0004;
  });

  const lineObject = useMemo(
    () =>
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 1, 0)]),
        new THREE.LineBasicMaterial({ color: MEASURE, linewidth: 2 }),
      ),
    [],
  );

  return (
    <group ref={group}>
      <primitive object={lineObject} ref={line} />
      <mesh ref={tip}>
        <sphereGeometry args={[0.055, 24, 24]} />
        <meshStandardMaterial color={MEASURE} emissive={MEASURE} emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

function ProbabilityCloud() {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(1.02 + Math.random() * 0.14);
      positions.set([v.x, v.y, v.z], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);
  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.045;
  });
  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color={BEAM} size={0.014} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export default function BlochSphereScene({ vector }: { vector: BlochVector }) {
  return (
    <Canvas camera={{ position: [2.1, 1.5, 2.3], fov: 42 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 4, 3]} intensity={18} color={BEAM} />
      <pointLight position={[-3, -2, -3]} intensity={8} color={PHASE} />

      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color="#16222b"
          transparent
          opacity={0.42}
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.001, 32, 24]} />
        <meshBasicMaterial color={BEAM} wireframe transparent opacity={0.09} />
      </mesh>

      <Ring rotation={[Math.PI / 2, 0, 0]} color={BEAM} opacity={0.4} />
      <Ring rotation={[0, 0, 0]} color={PHASE} opacity={0.22} />
      <Ring rotation={[0, Math.PI / 2, 0]} color={PHASE} opacity={0.22} />

      <Axis dir={[1, 0, 0]} label="X" color={BEAM} />
      <Axis dir={[0, 0, 1]} label="Y" color={BEAM} />
      <Axis dir={[0, 1, 0]} label="Z |0⟩" color={MEASURE} />
      <Axis dir={[0, -1, 0]} label="|1⟩" color={MEASURE} />

      <ProbabilityCloud />
      <StateVector vector={vector} />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        autoRotate={false}
        dampingFactor={0.1}
      />
    </Canvas>
  );
}
