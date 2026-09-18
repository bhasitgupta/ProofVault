import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 220;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create cryptographic node particles
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Color palette: cyber-violet (#818cf8), deep indigo (#6366f1), electric cyan (#06b6d4)
    const colorChoices = [
      new THREE.Color(0x818cf8),
      new THREE.Color(0x6366f1),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xa855f7),
    ];

    const nodes: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 350;
      const y = (Math.random() - 0.5) * 260;
      const z = (Math.random() - 0.5) * 180;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const chosenColor = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      nodes.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        vz: (Math.random() - 0.5) * 0.15,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const pMaterial = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const pointCloud = new THREE.Points(geometry, pMaterial);
    scene.add(pointCloud);

    // Dynamic interconnect lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    const maxLineConnections = 250;
    const linePositions = new Float32Array(maxLineConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Mouse movement reactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      pointCloud.rotation.y += 0.0008;
      pointCloud.rotation.x = targetY * 0.005;
      pointCloud.rotation.y += targetX * 0.005;

      lineMesh.rotation.copy(pointCloud.rotation);

      // Drift nodes
      const pos = geometry.attributes.position.array as Float32Array;
      let lineIndex = 0;
      const lPos = lineGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        if (Math.abs(node.x) > 180) node.vx *= -1;
        if (Math.abs(node.y) > 130) node.vy *= -1;
        if (Math.abs(node.z) > 100) node.vz *= -1;

        pos[i * 3] = node.x;
        pos[i * 3 + 1] = node.y;
        pos[i * 3 + 2] = node.z;

        // Connect nearby nodes
        for (let j = i + 1; j < particleCount; j++) {
          if (lineIndex >= maxLineConnections) break;
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dz = node.z - other.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 48) {
            lPos[lineIndex * 6] = node.x;
            lPos[lineIndex * 6 + 1] = node.y;
            lPos[lineIndex * 6 + 2] = node.z;
            lPos[lineIndex * 6 + 3] = other.x;
            lPos[lineIndex * 6 + 4] = other.y;
            lPos[lineIndex * 6 + 5] = other.z;
            lineIndex++;
          }
        }
      }

      // Clear remaining line slots
      for (let k = lineIndex * 6; k < maxLineConnections * 6; k++) {
        lPos[k] = 0;
      }

      geometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      pMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-75"
    />
  );
};
