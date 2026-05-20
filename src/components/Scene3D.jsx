import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';

/* ── Floating garbage bag ── */
function GarbageBag({ position, scale = 1, speed = 1 }) {
  const meshRef = useRef();
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003 * speed;
      meshRef.current.rotation.x = Math.sin(timeRef.current * 0.5 * speed) * 0.1;
    }
  });

  return (
    <Float speed={1.5 * speed} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <dodecahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color="#065f46"
          speed={2}
          distort={0.3}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

/* ── Recycling truck (simplified box) ── */
function Truck({ position, scale = 1 }) {
  const groupRef = useRef();
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (groupRef.current) {
      groupRef.current.position.x = position[0] + Math.sin(timeRef.current * 0.3) * 2;
      groupRef.current.rotation.y = Math.sin(timeRef.current * 0.2) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Truck body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.8, 1.4, 1.4]} />
        <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Truck cabin */}
      <mesh position={[1.8, 0.2, 0]}>
        <boxGeometry args={[1.0, 1.0, 1.3]} />
        <meshStandardMaterial color="#059669" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Windshield */}
      <mesh position={[2.31, 0.35, 0]}>
        <boxGeometry args={[0.05, 0.5, 1.0]} />
        <meshStandardMaterial color="#a7f3d0" roughness={0.1} metalness={0.8} transparent opacity={0.6} />
      </mesh>
      {/* Wheels */}
      {[[-0.8, -0.4, 0.75], [-0.8, -0.4, -0.75], [1.6, -0.4, 0.75], [1.6, -0.4, -0.75]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
      ))}
      {/* Recycling symbol on truck body */}
      <mesh position={[-0.2, 0.8, 0.71]}>
        <torusGeometry args={[0.25, 0.05, 8, 3]} />
        <meshStandardMaterial color="#d1fae5" emissive="#6ee7b7" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ── Floating compost / organic spheres ── */
function OrganicSphere({ position, color, size = 0.5, speed = 1 }) {
  const meshRef = useRef();
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(timeRef.current * speed) * 0.3;
    }
  });

  return (
    <Float speed={speed * 2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <MeshWobbleMaterial
          color={color}
          factor={0.4}
          speed={1.5}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

/* ── Leaf particles ── */
function LeafParticles({ count = 40 }) {
  const meshRef = useRef();
  const timeRef = useRef(0);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y = timeRef.current * 0.02;
      meshRef.current.rotation.x = Math.sin(timeRef.current * 0.05) * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#6ee7b7"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Main Scene ── */
const Scene3D = () => {
  return (
    <div className="scene3d-container" id="hero-3d-scene">
      <Canvas
        camera={{ position: [0, 1, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#6ee7b7" />
        <pointLight position={[0, 3, 0]} intensity={0.5} color="#10b981" />

        {/* Truck */}
        <Truck position={[-1, -1.5, 0]} scale={0.8} />

        {/* Garbage / waste items */}
        <GarbageBag position={[-3.5, 1.5, -1]} scale={0.6} speed={0.8} />
        <GarbageBag position={[3, 2, -2]} scale={0.45} speed={1.2} />
        <GarbageBag position={[4, -0.5, 1]} scale={0.35} speed={0.6} />

        {/* Organic composting spheres */}
        <OrganicSphere position={[-4, 0, 1]} color="#34d399" size={0.35} speed={0.7} />
        <OrganicSphere position={[2.5, -1, 2]} color="#a7f3d0" size={0.25} speed={1.1} />
        <OrganicSphere position={[-2, 2.5, -1.5]} color="#059669" size={0.4} speed={0.5} />
        <OrganicSphere position={[4.5, 1.5, -0.5]} color="#6ee7b7" size={0.3} speed={0.9} />

        {/* Leaf particles */}
        <LeafParticles count={50} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
