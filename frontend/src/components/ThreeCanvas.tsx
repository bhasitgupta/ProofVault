import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 210;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Group for the entire 3D Armillary Mechanism
    const armillaryGroup = new THREE.Group();
    scene.add(armillaryGroup);

    // Outer Ring 1 (Crimson Red Metallic Torus)
    const ring1Geo = new THREE.TorusGeometry(85, 0.9, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xb91c1c, // Crimson red
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    armillaryGroup.add(ring1);

    // Middle Ring 2 (Warm Mahogany Brown Torus)
    const ring2Geo = new THREE.TorusGeometry(72, 0.8, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x78350f, // Amber brown
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    armillaryGroup.add(ring2);

    // Inner Ring 3 (Polished Gold/Brass Torus)
    const ring3Geo = new THREE.TorusGeometry(58, 0.7, 16, 80);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0xd97706, // Brass gold
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 4;
    armillaryGroup.add(ring3);

    // Core Cryptographic Polyhedron (Icosahedron jewel cage)
    const coreGeo = new THREE.IcosahedronGeometry(36, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x991b1b,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    armillaryGroup.add(coreMesh);

    // Central Floating Jewel (Solid translucent dodecahedron)
    const jewelGeo = new THREE.DodecahedronGeometry(18, 0);
    const jewelMat = new THREE.MeshBasicMaterial({
      color: 0x78350f,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const jewelMesh = new THREE.Mesh(jewelGeo, jewelMat);
    armillaryGroup.add(jewelMesh);

    // Ambient floating golden embers & parchment dust particles
    const particleCount = 90;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);

    const emberColors = [
      new THREE.Color(0xb91c1c), // Crimson
      new THREE.Color(0xd97706), // Gold
      new THREE.Color(0x92400e), // Amber brown
    ];

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 360;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 280;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const c = emberColors[Math.floor(Math.random() * emberColors.length)];
      pColors[i * 3] = c.r;
      pColors[i * 3 + 1] = c.g;
      pColors[i * 3 + 2] = c.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Position armillary slightly off-center for elegant asymmetric framing
    armillaryGroup.position.set(45, 0, 0);

    // Mouse tilt interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationFrameId: number;

    const animate = () => {
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Armillary rotations
      ring1.rotation.z += 0.003;
      ring1.rotation.x += 0.0015;

      ring2.rotation.y -= 0.004;
      ring2.rotation.z += 0.002;

      ring3.rotation.x += 0.005;
      ring3.rotation.y += 0.003;

      coreMesh.rotation.y += 0.002;
      coreMesh.rotation.x -= 0.001;

      jewelMesh.rotation.y -= 0.006;
      jewelMesh.rotation.z += 0.004;

      armillaryGroup.rotation.x = targetY * 1.8;
      armillaryGroup.rotation.y = targetX * 1.8;

      particles.rotation.y += 0.0004;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      jewelGeo.dispose();
      jewelMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60"
    />
  );
};
