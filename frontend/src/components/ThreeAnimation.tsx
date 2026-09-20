import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Proof Vault 3D Sovereign Law, Judiciary & Forensic Crime Dossier Scene
 * 
 * Features:
 * 1. The Sovereign Scales of Justice (Nyaya Tula):
 *    - Fluted judicial brass & obsidian central pillar with court pedestal
 *    - Balanced horizontal beam dynamically oscillating on fulcrum
 *    - Suspended balance pans holding Crime Evidence & Statutory Law Docket
 * 2. Floating Governmental Crime Investigation Folios & Judicial Reports:
 *    - Hardbound official case dossiers with embossed gold national emblem seals
 *    - "CONFIDENTIAL // CRIME INVESTIGATION // BSA §63" stamped folios
 * 3. Forensic Investigation Grid & Radar:
 *    - Radial forensic coordinate grid and crime evidence telemetry particles
 * 4. Palette: Sovereign Gold, Obsidian Navy, Judicial Crimson, Deep Bronze
 */
export const ThreeAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 185);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    containerRef.current.appendChild(renderer.domElement);

    // 2. Lighting — Authoritative Sovereign Courtroom Mood
    const ambientLight = new THREE.AmbientLight(0xfef3c7, 1.4); // Warm ivory ambient
    scene.add(ambientLight);

    const keyGoldLight = new THREE.DirectionalLight(0xf59e0b, 2.2); // Warm judicial gold
    keyGoldLight.position.set(90, 110, 80);
    scene.add(keyGoldLight);

    const forensicRimLight = new THREE.DirectionalLight(0xbe123c, 1.5); // Crimson forensic rim
    forensicRimLight.position.set(-100, 60, -40);
    scene.add(forensicRimLight);

    const fillObsidian = new THREE.DirectionalLight(0x38bdf8, 0.6); // Subtle cool law-and-order fill
    fillObsidian.position.set(0, -80, 50);
    scene.add(fillObsidian);

    // 3. Master Root Group (Positioned gracefully to the right for clear content readability)
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    masterGroup.position.set(42, -5, 0);

    // =========================================================================
    // 4. THE SOVEREIGN SCALES OF JUSTICE (Nyaya Tula)
    // =========================================================================
    const scalesGroup = new THREE.Group();
    masterGroup.add(scalesGroup);

    // Courtroom Pedestal (Stepped Octagonal Base)
    const baseGeo1 = new THREE.CylinderGeometry(28, 32, 5, 8);
    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark slate obsidian bronze
      roughness: 0.35,
      metalness: 0.8,
      flatShading: true,
    });
    const base1 = new THREE.Mesh(baseGeo1, bronzeMat);
    base1.position.y = -52;
    scalesGroup.add(base1);

    const baseGeo2 = new THREE.CylinderGeometry(20, 24, 4, 8);
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Sovereign gold
      roughness: 0.25,
      metalness: 0.9,
    });
    const base2 = new THREE.Mesh(baseGeo2, goldTrimMat);
    base2.position.y = -48;
    scalesGroup.add(base2);

    // Central Law Column / Pillar
    const columnGeo = new THREE.CylinderGeometry(3.5, 4.8, 70, 16);
    const column = new THREE.Mesh(columnGeo, bronzeMat);
    column.position.y = -12;
    scalesGroup.add(column);

    // Capital & Fulcrum Pivot Sphere
    const fulcrumCapGeo = new THREE.CylinderGeometry(6, 4, 4, 16);
    const fulcrumCap = new THREE.Mesh(fulcrumCapGeo, goldTrimMat);
    fulcrumCap.position.y = 24;
    scalesGroup.add(fulcrumCap);

    const fulcrumSphereGeo = new THREE.SphereGeometry(4.5, 24, 24);
    const fulcrumSphere = new THREE.Mesh(fulcrumSphereGeo, goldTrimMat);
    fulcrumSphere.position.y = 28;
    scalesGroup.add(fulcrumSphere);

    // Dynamic Balance Beam (Pivots at Y = 28)
    const beamAssembly = new THREE.Group();
    beamAssembly.position.set(0, 28, 0);
    scalesGroup.add(beamAssembly);

    const beamArmGeo = new THREE.BoxGeometry(78, 2.2, 2.2);
    const beamArm = new THREE.Mesh(beamArmGeo, goldTrimMat);
    beamAssembly.add(beamArm);

    // Fulcrum Finial (National Court Spire)
    const spireGeo = new THREE.ConeGeometry(2.5, 10, 16);
    const spire = new THREE.Mesh(spireGeo, goldTrimMat);
    spire.position.y = 6;
    beamAssembly.add(spire);

    // Left Scale Pan Assembly (Holding Crime Evidence Docket)
    const leftPanAssembly = new THREE.Group();
    leftPanAssembly.position.set(-36, 0, 0);
    beamAssembly.add(leftPanAssembly);

    // Left Suspension Struts / Chains
    const chainMat = new THREE.LineBasicMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.85,
    });
    const chainPointsL = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-8, -26, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(8, -26, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -26, 8),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -26, -8),
    ];
    const chainGeoL = new THREE.BufferGeometry().setFromPoints(chainPointsL);
    const chainsL = new THREE.LineSegments(chainGeoL, chainMat);
    leftPanAssembly.add(chainsL);

    // Left Pan (Dish)
    const panGeo = new THREE.CylinderGeometry(11, 8, 2.5, 24);
    const panMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.3,
      metalness: 0.85,
    });
    const panL = new THREE.Mesh(panGeo, panMat);
    panL.position.y = -27;
    leftPanAssembly.add(panL);

    // Right Scale Pan Assembly (Holding Law Code / Penal Statute)
    const rightPanAssembly = new THREE.Group();
    rightPanAssembly.position.set(36, 0, 0);
    beamAssembly.add(rightPanAssembly);

    const chainPointsR = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-8, -26, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(8, -26, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -26, 8),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -26, -8),
    ];
    const chainGeoR = new THREE.BufferGeometry().setFromPoints(chainPointsR);
    const chainsR = new THREE.LineSegments(chainGeoR, chainMat);
    rightPanAssembly.add(chainsR);

    const panR = new THREE.Mesh(panGeo, panMat);
    panR.position.y = -27;
    rightPanAssembly.add(panR);

    // =========================================================================
    // 5. GOVERNMENTAL CRIME REPORT & LAW DOSSIER FOLIOS (Interactive 3D Books)
    // =========================================================================
    const foliosGroup = new THREE.Group();
    masterGroup.add(foliosGroup);

    // Helper: Create Realistic Government Case File Docket Texture
    const createDossierTexture = (title: string, subtitle: string, sealColor: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Deep parchment / leather bound background
        ctx.fillStyle = '#1e1b18';
        ctx.fillRect(0, 0, 512, 512);

        // Ornate Gold Border Line
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 6;
        ctx.strokeRect(24, 24, 464, 464);
        ctx.lineWidth = 2;
        ctx.strokeRect(34, 34, 444, 444);

        // Header
        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 22px serif';
        ctx.textAlign = 'center';
        ctx.fillText('GOVERNMENT OF INDIA', 256, 80);

        ctx.font = '16px monospace';
        ctx.fillStyle = '#d97706';
        ctx.fillText('MINISTRY OF LAW & JUSTICE', 256, 110);

        // Central Judicial Seal Emblem
        ctx.beginPath();
        ctx.arc(256, 210, 60, 0, Math.PI * 2);
        ctx.fillStyle = sealColor;
        ctx.fill();
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px serif';
        ctx.fillText('SATYAMEVA', 256, 205);
        ctx.fillText('JAYATE', 256, 225);

        // Document Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px serif';
        ctx.fillText(title, 256, 330);

        // Subtitle / Law section
        ctx.fillStyle = '#f59e0b';
        ctx.font = '15px monospace';
        ctx.fillText(subtitle, 256, 365);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px monospace';
        ctx.fillText('CRIME & EVIDENTIARY AUDIT DOSSIER', 256, 400);
        ctx.fillText('CRYPTOGRAPHICALLY SEALED // BSA §63', 256, 425);
      }
      return new THREE.CanvasTexture(canvas);
    };

    // Docket 1: "SPECIAL CRIME INVESTIGATION // FIR DOCKET" (Floats on Left Pan)
    const dossierGeo = new THREE.BoxGeometry(14, 18, 2.5);
    const textureCrime = createDossierTexture('CRIME REPORT', 'STATE VS CYBER SYNDICATE', '#991b1b');
    const matCrime = [
      new THREE.MeshStandardMaterial({ color: 0x451a03 }),
      new THREE.MeshStandardMaterial({ color: 0x451a03 }),
      new THREE.MeshStandardMaterial({ color: 0x451a03 }),
      new THREE.MeshStandardMaterial({ color: 0x451a03 }),
      new THREE.MeshStandardMaterial({ map: textureCrime }), // Front cover
      new THREE.MeshStandardMaterial({ color: 0x1e1b18 }), // Back cover
    ];
    const dossierCrime = new THREE.Mesh(dossierGeo, matCrime);
    dossierCrime.position.set(0, -22, 0);
    dossierCrime.rotation.x = -Math.PI / 2.8;
    leftPanAssembly.add(dossierCrime);

    // Docket 2: "BHARATIYA SAKSHYA ADHINIYAM // STATUTORY CODE" (Floats on Right Pan)
    const textureLaw = createDossierTexture('EVIDENCE ACT', 'BHARATIYA SAKSHYA §63', '#1e3a8a');
    const matLaw = [
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
      new THREE.MeshStandardMaterial({ map: textureLaw }),
      new THREE.MeshStandardMaterial({ color: 0x0f172a }),
    ];
    const dossierLaw = new THREE.Mesh(dossierGeo, matLaw);
    dossierLaw.position.set(0, -22, 0);
    dossierLaw.rotation.x = -Math.PI / 2.8;
    rightPanAssembly.add(dossierLaw);

    // Floating Case Intelligence Folios (Orbiting around the Scales of Justice)
    const orbitingDossiers: THREE.Mesh[] = [];
    const folioConfigs = [
      { title: 'FORENSIC AUDIT', sub: 'CENTRAL BANK RANSOMWARE', color: '#be123c', r: 72, y: 15, speed: 0.18 },
      { title: 'BALLISTICS LAB', sub: 'FIREARM & STRIATION MEMO', color: '#7c2d12', r: 88, y: -18, speed: -0.14 },
      { title: 'JUDICIAL INQUIRY', sub: 'ANTI-CORRUPTION BUREAU', color: '#1e3a8a', r: 80, y: 35, speed: 0.12 },
    ];

    folioConfigs.forEach((cfg) => {
      const tex = createDossierTexture(cfg.title, cfg.sub, cfg.color);
      const mat = [
        new THREE.MeshStandardMaterial({ color: 0x334155 }),
        new THREE.MeshStandardMaterial({ color: 0x334155 }),
        new THREE.MeshStandardMaterial({ color: 0x334155 }),
        new THREE.MeshStandardMaterial({ color: 0x334155 }),
        new THREE.MeshStandardMaterial({ map: tex }),
        new THREE.MeshStandardMaterial({ color: 0x1e293b }),
      ];
      const folio = new THREE.Mesh(dossierGeo, mat);
      folio.userData = { radius: cfg.r, yBase: cfg.y, speed: cfg.speed, angle: Math.random() * Math.PI * 2 };
      foliosGroup.add(folio);
      orbitingDossiers.push(folio);
    });

    // =========================================================================
    // 6. FORENSIC RADAR RINGS & CRIME INVESTIGATION GRID
    // =========================================================================
    const radarGroup = new THREE.Group();
    masterGroup.add(radarGroup);
    radarGroup.position.set(0, -52, 0);

    // Concentric Radar Rings
    const ringMatGold = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(48, 49, 48), ringMatGold);
    ring1.rotation.x = Math.PI / 2;
    radarGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.RingGeometry(82, 83, 64), ringMatGold);
    ring2.rotation.x = Math.PI / 2;
    radarGroup.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.RingGeometry(110, 111, 72), new THREE.MeshBasicMaterial({
      color: 0xbe123c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    }));
    ring3.rotation.x = Math.PI / 2;
    radarGroup.add(ring3);

    // Sweeping Radar Beam Line
    const radarLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(110, 0, 0),
    ]);
    const radarLineMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.65,
    });
    const radarBeam = new THREE.Line(radarLineGeo, radarLineMat);
    radarGroup.add(radarBeam);

    // =========================================================================
    // 7. PARTICLES: SOVEREIGN EVIDENCE & HASH TELEMETRY
    // =========================================================================
    const pCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const pSpeeds = new Float32Array(pCount);

    const palette = [
      new THREE.Color(0xd97706), // Gold
      new THREE.Color(0xbe123c), // Crimson forensic
      new THREE.Color(0x38bdf8), // Cyan digital
      new THREE.Color(0x10b981), // Emerald verified
    ];

    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 200;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const c = palette[i % palette.length];
      pCol[i * 3] = c.r;
      pCol[i * 3 + 1] = c.g;
      pCol[i * 3 + 2] = c.b;

      pSpeeds[i] = 0.15 + Math.random() * 0.35;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));

    const pMat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const particlePoints = new THREE.Points(pGeo, pMat);
    masterGroup.add(particlePoints);

    // =========================================================================
    // 8. MOUSE PARALLAX & RESPONSIVE HANDLING
    // =========================================================================
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      if (!containerRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      if (window.innerWidth < 1024) {
        masterGroup.position.set(0, -10, -25);
        camera.position.z = 220;
      } else {
        masterGroup.position.set(46, -5, 0);
        camera.position.z = 185;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    // =========================================================================
    // 9. ANIMATION LOOP
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Fluid tilt towards mouse cursor
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      masterGroup.rotation.y = targetX + Math.sin(elapsed * 0.15) * 0.08;
      masterGroup.rotation.x = targetY + Math.cos(elapsed * 0.2) * 0.04;

      // Dynamic Judicial Balance Scale Oscillation (Tipping between Evidence & Law)
      const balanceTilt = Math.sin(elapsed * 0.8) * 0.12 + Math.cos(elapsed * 1.4) * 0.04;
      beamAssembly.rotation.z = balanceTilt;

      // Keep scale pans vertical as beam tilts
      leftPanAssembly.rotation.z = -balanceTilt;
      rightPanAssembly.rotation.z = -balanceTilt;

      // Radar Sweep Rotation
      radarBeam.rotation.y = elapsed * 1.2;

      // Orbiting Crime Dossiers
      orbitingDossiers.forEach((dossier) => {
        const u = dossier.userData;
        u.angle += u.speed * 0.015;
        dossier.position.x = Math.cos(u.angle) * u.radius;
        dossier.position.z = Math.sin(u.angle) * u.radius;
        dossier.position.y = u.yBase + Math.sin(elapsed * 1.5 + u.radius) * 4;
        dossier.rotation.y = -u.angle + Math.PI / 2;
        dossier.rotation.x = Math.sin(elapsed * 0.8) * 0.15;
      });

      // Floating Evidence Particle Drifts
      const positions = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        positions[i * 3 + 1] += pSpeeds[i] * 0.2;
        if (positions[i * 3 + 1] > 70) {
          positions[i * 3 + 1] = -70;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      baseGeo1.dispose();
      baseGeo2.dispose();
      columnGeo.dispose();
      fulcrumCapGeo.dispose();
      fulcrumSphereGeo.dispose();
      beamArmGeo.dispose();
      spireGeo.dispose();
      chainGeoL.dispose();
      chainGeoR.dispose();
      panGeo.dispose();
      dossierGeo.dispose();
      radarLineGeo.dispose();
      pGeo.dispose();
      pMat.dispose();
      bronzeMat.dispose();
      goldTrimMat.dispose();
      panMat.dispose();
      ringMatGold.dispose();
      radarLineMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      style={{ opacity: 0.38 }}
    />
  );
};

export default ThreeAnimation;
