import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const BEAM = "#5cd8e6";
const PHASE = "#b28cf5";
const MEASURE = "#f0b357";

/** A rotating qubit state on an orbital shell, with a probability field around it. */
function Qubit() {
  const shell = useRef<THREE.Group>(null);
  const vector = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const theta = Math.PI / 2 + Math.sin(t * 0.42) * 0.85;
    const phi = t * 0.5;
    const v = new THREE.Vector3(
      Math.sin(theta) * Math.cos(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.sin(phi),
    );
    if (vector.current) vector.current.lookAt(v);
    if (tip.current) tip.current.position.copy(v.multiplyScalar(1.02));
    if (shell.current) shell.current.rotation.y = t * 0.08;
  });

  const equator = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2);
    const geo = new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(160).map((p) => new THREE.Vector3(p.x, 0, p.y)),
    );
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: BEAM, transparent: true, opacity: 0.35 }));
  }, []);

  const meridian = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2);
    const geo = new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(160).map((p) => new THREE.Vector3(p.x, p.y, 0)),
    );
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: PHASE, transparent: true, opacity: 0.22 }));
  }, []);

  return (
    <group ref={shell}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#14202a" transparent opacity={0.35} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.002, 36, 26]} />
        <meshBasicMaterial color={BEAM} wireframe transparent opacity={0.07} />
      </mesh>
      <primitive object={equator} />
      <primitive object={meridian} />
      <group ref={vector}>
        <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
          <meshBasicMaterial color={MEASURE} />
        </mesh>
      </group>
      <mesh ref={tip}>
        <sphereGeometry args={[0.05, 24, 24]} />
        <meshStandardMaterial color={MEASURE} emissive={MEASURE} emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

function Field() {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.35 + Math.random() * 1.9;
      const v = new THREE.Vector3().randomDirection().multiplyScalar(r);
      positions.set([v.x, v.y * 0.6, v.z], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);
  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = clock.getElapsedTime() * 0.03;
      points.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.08;
    }
  });
  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color={BEAM} size={0.012} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

export default function HeroFieldScene() {
  return (
    <Canvas camera={{ position: [0, 0.8, 3.6], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 3, 4]} intensity={20} color={BEAM} />
      <pointLight position={[-4, -2, -2]} intensity={10} color={PHASE} />
      <Field />
      <Qubit />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.35} />
    </Canvas>
  );
}
