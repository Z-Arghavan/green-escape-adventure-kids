
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Torus, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const FloatingObject = ({ position, color, type = 'sphere' }: { position: [number, number, number], color: string, type?: 'sphere' | 'box' | 'torus' }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const renderShape = () => {
    switch (type) {
      case 'box':
        return <Box ref={meshRef} args={[0.5, 0.5, 0.5]} material-color={color} />;
      case 'torus':
        return <Torus ref={meshRef} args={[0.3, 0.15, 16, 100]} material-color={color} />;
      default:
        return <Sphere ref={meshRef} args={[0.3]} material-color={color} />;
    }
  };

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={position}>
        {renderShape()}
        <meshStandardMaterial color={color} />
      </mesh>
    </Float>
  );
};

const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        
        {/* Floating objects */}
        <FloatingObject position={[-4, 3, -2]} color="#22c55e" type="sphere" />
        <FloatingObject position={[4, -2, -3]} color="#3b82f6" type="box" />
        <FloatingObject position={[-3, -3, -1]} color="#a855f7" type="torus" />
        <FloatingObject position={[3, 4, -4]} color="#f59e0b" type="sphere" />
        <FloatingObject position={[-5, 0, -5]} color="#ef4444" type="box" />
        <FloatingObject position={[5, 1, -2]} color="#06b6d4" type="torus" />
        <FloatingObject position={[0, -4, -3]} color="#ec4899" type="sphere" />
        <FloatingObject position={[-2, 2, -6]} color="#84cc16" type="box" />
        <FloatingObject position={[2, -1, -4]} color="#f97316" type="torus" />
        <FloatingObject position={[-1, 4, -5]} color="#8b5cf6" type="sphere" />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
