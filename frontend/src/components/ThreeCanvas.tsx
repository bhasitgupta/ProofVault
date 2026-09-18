import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * NYAYA-VAULT 3D Sovereign Evidentiary Chrono-Matrix
 * Architectural WebGL Core:
 * - Multifaceted Dual-Nested Stellar Merkle Core (Octahedral & Icosahedral geometry)
 * - Calibrated Astrolabe Gimbal Rings with Hash Marker Tick Arrays
 * - Sweeping Vertical Evidentiary Laser Scan Plane
 * - Dynamic Double-Helical Forensic Particle Swarm with Mouse Interactivity
 * - Palette: Ivory, Deep Crimson (0x991b1b), Mahogany Amber (0x78350f), Gold (0xd97706)
 */
export const ThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 190);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    containerRef.current.appendChild(renderer.domElement);

    // 2. Lighting (Warm Sovereign Palette)
    const ambientLight = new THREE.AmbientLight(0xfef3c7, 1.2); // Warm light ambient
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0xd97706, 2.5, 300); // Amber core glow
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const crimsonRimLight = new THREE.DirectionalLight(0x991b1b, 1.6); // Deep crimson accent
    crimsonRimLight.position.set(120, 80, 100);
    scene.add(crimsonRimLight);

    const warmFillLight = new THREE.DirectionalLight(0x78350f, 1.0); // Mahogany fill
    warmFillLight.position.set(-100, -80, -50);
    scene.add(warmFillLight);

    // 3. Master Matrix Group
    const matrixGroup = new THREE.Group();
    scene.add(matrixGroup);

    // Asymmetric judicial balance: framed slightly to the right
    matrixGroup.position.set(40, 0, 0);

    // 4. Central Merkle Crystal (Outer Faceted Diamond)
    const outerGeo = new THREE.OctahedronGeometry(34, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
      flatShading: true,
    });
    const outerCrystal = new THREE.Mesh(outerGeo, outerMat);
    matrixGroup.add(outerCrystal);

    // Outer Wireframe Cage (Crimson Edge Lattice)
    const wireGeo = new THREE.WireframeGeometry(outerGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x991b1b, // Crimson
      transparent: true,
      opacity: 0.75,
      linewidth: 1.5,
    });
    const outerWireframe = new THREE.LineSegments(wireGeo, wireMat);
    matrixGroup.add(outerWireframe);

    // Inner Nested Hyper-Cube (Amber Mahogany Core)
    const innerGeo = new THREE.BoxGeometry(18, 18, 18);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Mahogany brown
      roughness: 0.3,
      metalness: 0.4,
      transparent: true,
      opacity: 0.7,
      wireframe: true,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    matrixGroup.add(innerCore);

    // Central Glowing Seed Point (Gold Merkle Root)
    const seedGeo = new THREE.SphereGeometry(6, 16, 16);
    const seedMat = new THREE.MeshBasicMaterial({
      color: 0xd97706, // Gold
    });
    const seedCore = new THREE.Mesh(seedGeo, seedMat);
    matrixGroup.add(seedCore);

    // 5. Astrolabe Gimbal Rings with Hash Marker Arrays
    const ringGroup = new THREE.Group();
    matrixGroup.add(ringGroup);

    // Equatorial Astrolabe Ring (Segmented Mahogany)
    const ring1Geo = new THREE.RingGeometry(64, 66, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x78350f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.3;
    ringGroup.add(ring1);

    // Oblique Meridian Ring (Segmented Crimson)
    const ring2Geo = new THREE.TorusGeometry(82, 0.9, 12, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xb91c1c,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3.2;
    ringGroup.add(ring2);

    // Outer Precision Perimeter Ring (Golden Dotted Astrolabe)
    const ring3Geo = new THREE.TorusGeometry(98, 0.6, 8, 80);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.35,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.z = Math.PI / 4.5;
    ringGroup.add(ring3);

    // 6. Sweeping Vertical Evidentiary Laser Scan Plane
    const laserPlaneGeo = new THREE.PlaneGeometry(160, 160);
    const laserCanvas = document.createElement('canvas');
    laserCanvas.width = 128;
    laserCanvas.height = 128;
    const lCtx = laserCanvas.getContext('2d');
    if (lCtx) {
      const grad = lCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(217, 119, 6, 0.45)'); // Amber center
      grad.addColorStop(0.5, 'rgba(185, 28, 28, 0.25)'); // Crimson ring
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      lCtx.fillStyle = grad;
      lCtx.fillRect(0, 0, 128, 128);
    }
    const laserTexture = new THREE.CanvasTexture(laserCanvas);
    const laserMat = new THREE.MeshBasicMaterial({
      map: laserTexture,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    });
    const laserPlane = new THREE.Mesh(laserPlaneGeo, laserMat);
    laserPlane.rotation.x = Math.PI / 2;
    matrixGroup.add(laserPlane);

    // 7. Dynamic Evidentiary Swarm (Helical Forensic Packets)
    const particleCount = 140;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const pInitialThetas = new Float32Array(particleCount);
    const pSpeeds = new Float32Array(particleCount);
    const pRadii = new Float32Array(particleCount);
    const pHeights = new Float32Array(particleCount);

    const palette = [
      new THREE.Color(0x991b1b), // Crimson
      new THREE.Color(0xb45309), // Amber Brown
      new THREE.Color(0xd97706), // Gold
      new THREE.Color(0x451a03), // Deep Mahogany
    ];

    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 4 + Math.random() * 0.5;
      const radius = 45 + Math.random() * 85;
      const height = (Math.random() - 0.5) * 120;

      pPositions[i * 3] = Math.cos(theta) * radius;
      pPositions[i * 3 + 1] = height;
      pPositions[i * 3 + 2] = Math.sin(theta) * radius;

      pInitialThetas[i] = theta;
      pSpeeds[i] = 0.003 + Math.random() * 0.007;
      pRadii[i] = radius;
      pHeights[i] = height;

      const color = palette[i % palette.length];
      pColors[i * 3] = color.r;
      pColors[i * 3 + 1] = color.g;
      pColors[i * 3 + 2] = color.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
    });
    const particleSwarm = new THREE.Points(pGeo, pMat);
    matrixGroup.add(particleSwarm);

    // 8. Mouse Tracking & Fluid Inertia
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0006;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0006;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // 9. Resize Handler
    const onResize = () => {
      if (!containerRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Responsive positioning for smaller screens
      if (window.innerWidth < 768) {
        matrixGroup.position.set(0, 0, -20);
        camera.position.z = 240;
      } else {
        matrixGroup.position.set(40, 0, 0);
        camera.position.z = 190;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    // 10. Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Fluid camera / matrix tilt tracking
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      matrixGroup.rotation.y = targetX + elapsed * 0.12;
      matrixGroup.rotation.x = targetY + Math.sin(elapsed * 0.3) * 0.08;

      // Crystal Core Complex Precession
      outerCrystal.rotation.x = elapsed * 0.22;
      outerCrystal.rotation.y = elapsed * 0.35;
      outerWireframe.rotation.x = elapsed * 0.22;
      outerWireframe.rotation.y = elapsed * 0.35;

      // Inner Core Counter-Rotation & Pulse
      innerCore.rotation.x = -elapsed * 0.4;
      innerCore.rotation.z = elapsed * 0.3;
      const pulse = 1 + Math.sin(elapsed * 2.2) * 0.08;
      innerCore.scale.set(pulse, pulse, pulse);

      // Seed Core Harmonic Glow
      const seedPulse = 1 + Math.cos(elapsed * 3.0) * 0.15;
      seedCore.scale.set(seedPulse, seedPulse, seedPulse);

      // Gimbal Rings Counter-Rotation
      ring1.rotation.z = elapsed * 0.18;
      ring2.rotation.x = elapsed * 0.14;
      ring2.rotation.y = -elapsed * 0.2;
      ring3.rotation.y = elapsed * 0.09;
      ring3.rotation.z = -elapsed * 0.11;

      // Laser Scanner Vertical Sweep
      laserPlane.position.y = Math.sin(elapsed * 1.6) * 42;
      laserPlane.rotation.z = elapsed * 0.4;

      // Particle Swarm Helical Evolution
      const positions = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pInitialThetas[i] += pSpeeds[i];
        const theta = pInitialThetas[i];
        const r = pRadii[i];
        const h = pHeights[i] + Math.sin(elapsed * 1.5 + i) * 6;

        positions[i * 3] = Math.cos(theta) * r;
        positions[i * 3 + 1] = h;
        positions[i * 3 + 2] = Math.sin(theta) * r;
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      seedGeo.dispose();
      seedMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      laserPlaneGeo.dispose();
      laserMat.dispose();
      laserTexture.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      style={{ opacity: 0.88 }}
    />
  );
};
