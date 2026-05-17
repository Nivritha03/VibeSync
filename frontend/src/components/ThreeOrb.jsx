import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Environment } from '@react-three/drei';

function AnimatedOrb({ currentEmotion }) {
  const meshRef = useRef();

  // Dynamic colors based on emotion
  let orbColor = '#b145ff'; // Default Purple
  let emissiveColor = '#5a3dff';
  let distort = 0.4;
  let speed = 2;

  if (currentEmotion === 'Happy') {
    orbColor = '#facc15';
    emissiveColor = '#fb923c';
    distort = 0.3;
    speed = 3;
  } else if (currentEmotion === 'Sad') {
    orbColor = '#3b82f6';
    emissiveColor = '#1d4ed8';
    distort = 0.2;
    speed = 1;
  } else if (currentEmotion === 'Angry') {
    orbColor = '#ef4444';
    emissiveColor = '#b91c1c';
    distort = 0.7;
    speed = 5;
  } else if (currentEmotion) {
    // any other emotion
    orbColor = '#00f0ff';
    emissiveColor = '#b145ff';
  }

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.5}>
        <MeshDistortMaterial
          color={orbColor}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
          attach="material"
          distort={distort}
          speed={speed}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

const ThreeOrb = ({ currentEmotion }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f0ff" />
        <AnimatedOrb currentEmotion={currentEmotion} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default ThreeOrb;
