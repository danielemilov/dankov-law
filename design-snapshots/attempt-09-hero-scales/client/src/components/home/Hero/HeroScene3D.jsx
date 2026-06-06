import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function makeTube(points, radius, material, segments = 72) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, segments, radius, 8, false);
  return new THREE.Mesh(geometry, material);
}

function makeCylinder(radiusTop, radiusBottom, height, material, radialSegments = 48) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, 1, false),
    material
  );
}

function createChain(from, to, material) {
  const mid = new THREE.Vector3(
    (from.x + to.x) / 2,
    (from.y + to.y) / 2 - 0.05,
    (from.z + to.z) / 2
  );

  return makeTube([from, mid, to], 0.006, material, 46);
}

function createPan(x, y, z, materials) {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  const bowl = makeCylinder(0.62, 0.46, 0.08, materials.glass, 72);
  bowl.scale.z = 0.5;
  bowl.position.y = -0.02;
  group.add(bowl);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.018, 10, 96), materials.gold);
  rim.rotation.x = Math.PI / 2;
  rim.scale.z = 0.48;
  group.add(rim);

  const innerGlow = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.006, 8, 72), materials.glow);
  innerGlow.rotation.x = Math.PI / 2;
  innerGlow.scale.z = 0.5;
  innerGlow.position.y = 0.035;
  group.add(innerGlow);

  const anchorGeometry = new THREE.SphereGeometry(0.028, 16, 16);
  [
    [-0.5, 0.06, 0],
    [0.5, 0.06, 0],
    [0, 0.06, 0.25],
  ].forEach(([ax, ay, az]) => {
    const anchor = new THREE.Mesh(anchorGeometry, materials.gold);
    anchor.position.set(ax, ay, az);
    group.add(anchor);
  });

  return group;
}

export default function HeroScene3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: 'high-performance',
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 8.6);

    const stage = new THREE.Group();
    scene.add(stage);

    const scales = new THREE.Group();
    stage.add(scales);

    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd8c878,
      metalness: 0.86,
      roughness: 0.23,
      clearcoat: 0.55,
      clearcoatRoughness: 0.24,
      transparent: true,
      opacity: 0.78,
      emissive: 0x6f8131,
      emissiveIntensity: 0.055,
    });

    const darkGoldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x5b6445,
      metalness: 0.74,
      roughness: 0.34,
      transparent: true,
      opacity: 0.56,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8fff1,
      metalness: 0.08,
      roughness: 0.14,
      transmission: 0.42,
      thickness: 0.65,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8ee84,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const whiteLineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const column = makeCylinder(0.055, 0.075, 2.95, goldMaterial, 64);
    column.position.y = -0.12;
    scales.add(column);

    const base = makeCylinder(0.58, 0.76, 0.12, darkGoldMaterial, 72);
    base.position.y = -1.66;
    scales.add(base);

    const baseGlow = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.012, 8, 120), glowMaterial);
    baseGlow.rotation.x = Math.PI / 2;
    baseGlow.position.y = -1.58;
    scales.add(baseGlow);

    const fulcrum = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 32), goldMaterial);
    fulcrum.position.y = 1.08;
    scales.add(fulcrum);

    const beamGroup = new THREE.Group();
    beamGroup.position.y = 1.12;
    scales.add(beamGroup);

    const beam = makeCylinder(0.032, 0.032, 3.6, goldMaterial, 36);
    beam.rotation.z = Math.PI / 2;
    beamGroup.add(beam);

    const beamGlow = makeTube(
      [
        new THREE.Vector3(-1.78, 0.015, 0.035),
        new THREE.Vector3(0, 0.03, 0.06),
        new THREE.Vector3(1.78, 0.015, 0.035),
      ],
      0.007,
      glowMaterial,
      96
    );
    beamGroup.add(beamGlow);

    const leftPan = createPan(-1.32, -0.63, 0.02, {
      gold: goldMaterial,
      glass: glassMaterial,
      glow: glowMaterial,
    });
    const rightPan = createPan(1.32, -0.67, 0.02, {
      gold: goldMaterial,
      glass: glassMaterial,
      glow: glowMaterial,
    });
    scales.add(leftPan, rightPan);

    const chains = [];
    [
      { pan: leftPan, x: -1.32, top: -1.48, tilt: -0.5 },
      { pan: rightPan, x: 1.32, top: 1.48, tilt: 0.5 },
    ].forEach(({ pan, x, top, tilt }) => {
      [
        new THREE.Vector3(top, 1.07, 0.02),
        new THREE.Vector3(top + tilt * 0.12, 1.03, 0.18),
        new THREE.Vector3(top - tilt * 0.12, 1.03, -0.16),
      ].forEach((from, index) => {
        const target = [
          new THREE.Vector3(x - 0.5, -0.55, 0.02),
          new THREE.Vector3(x + 0.5, -0.55, 0.02),
          new THREE.Vector3(x, -0.55, 0.25),
        ][index];
        const chain = createChain(from, target, goldMaterial);
        scales.add(chain);
        chains.push(chain);
      });

      pan.rotation.z = x < 0 ? -0.035 : 0.028;
      pan.rotation.x = x < 0 ? 0.025 : -0.018;
    });

    const haloGroup = new THREE.Group();
    haloGroup.position.set(0, -0.22, -0.18);
    scales.add(haloGroup);

    const haloGeometry = new THREE.TorusGeometry(1.82, 0.006, 8, 160);
    const halos = Array.from({ length: 4 }, (_, index) => {
      const halo = new THREE.Mesh(haloGeometry, index === 1 ? glowMaterial : whiteLineMaterial);
      halo.rotation.x = Math.PI / 2;
      halo.rotation.z = index * 0.18;
      halo.scale.setScalar(0.76 + index * 0.16);
      halo.material.opacity = index === 1 ? 0.36 : 0.13;
      haloGroup.add(halo);
      return halo;
    });

    const verdictArc = makeTube(
      [
        new THREE.Vector3(-1.95, -1.22, -0.05),
        new THREE.Vector3(-0.8, -1.0, 0.08),
        new THREE.Vector3(0.5, -1.02, 0.16),
        new THREE.Vector3(1.9, -1.24, -0.02),
      ],
      0.008,
      glowMaterial,
      110
    );
    verdictArc.position.z = 0.1;
    scales.add(verdictArc);

    const particleGeometry = new THREE.SphereGeometry(0.018, 12, 12);
    const particles = Array.from({ length: 18 }, (_, index) => {
      const particle = new THREE.Mesh(particleGeometry, index % 3 === 0 ? glowMaterial : whiteLineMaterial);
      const angle = index * 0.72;
      const radius = 1.2 + (index % 5) * 0.15;
      particle.position.set(Math.cos(angle) * radius, -0.2 + Math.sin(index) * 0.72, -0.34 + Math.sin(angle) * 0.18);
      particle.scale.setScalar(0.7 + (index % 4) * 0.12);
      scales.add(particle);
      return { particle, angle, radius, speed: 0.12 + index * 0.004 };
    });

    const glassPlaneGeometry = new THREE.PlaneGeometry(2.9, 3.7, 1, 1);
    const glassPlaneMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.02,
      roughness: 0.12,
      transmission: 0.55,
      thickness: 0.6,
      transparent: true,
      opacity: 0.075,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const rearGlass = new THREE.Mesh(glassPlaneGeometry, glassPlaneMaterial);
    rearGlass.position.set(0.62, -0.16, -0.42);
    rearGlass.rotation.set(-0.08, -0.24, 0.05);
    stage.add(rearGlass);

    scene.add(new THREE.AmbientLight(0xffffff, 0.68));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.75);
    keyLight.position.set(-2.8, 3.6, 4.8);
    scene.add(keyLight);

    const goldLight = new THREE.PointLight(0xd8ee84, 2.1, 8.5);
    goldLight.position.set(2.2, 0.7, 2.8);
    scene.add(goldLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.9, 7);
    rimLight.position.set(-2.4, -1.2, 2.5);
    scene.add(rimLight);

    let frameId = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const narrow = width < 720;
      const tablet = width < 980;

      if (narrow) {
        stage.position.set(0.52, 0.9, 0);
        stage.scale.setScalar(0.68);
        scales.rotation.set(-0.05, -0.18, 0);
      } else if (tablet) {
        stage.position.set(0.72, 0.58, 0);
        stage.scale.setScalar(0.78);
        scales.rotation.set(-0.04, -0.2, 0);
      } else {
        stage.position.set(1.74, 0.14, 0);
        stage.scale.setScalar(1.08);
        scales.rotation.set(-0.035, -0.34, 0);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (time) => {
      const t = time * 0.001;
      const balance = Math.sin(t * 0.48) * 0.034 + Math.sin(t * 0.17) * 0.018;

      stage.rotation.y = Math.sin(t * 0.22) * 0.035;
      stage.rotation.x = Math.sin(t * 0.18) * 0.018;

      beamGroup.rotation.z = balance;
      leftPan.position.y = -0.63 - balance * 1.55;
      rightPan.position.y = -0.67 + balance * 1.55;
      leftPan.rotation.z = -0.035 + balance * 0.32;
      rightPan.rotation.z = 0.028 + balance * 0.32;

      haloGroup.rotation.z = t * 0.045;
      halos.forEach((halo, index) => {
        halo.rotation.z += 0.0008 * (index + 1);
        halo.material.opacity = (index === 1 ? 0.28 : 0.1) + Math.sin(t * 0.72 + index) * 0.045;
      });

      particles.forEach(({ particle, angle, radius, speed }, index) => {
        const next = angle + t * speed;
        particle.position.x = Math.cos(next) * radius;
        particle.position.z = -0.34 + Math.sin(next) * 0.22;
        particle.position.y += Math.sin(t * 0.9 + index) * 0.0009;
        particle.material.opacity = (index % 3 === 0 ? 0.36 : 0.16) + Math.sin(t * 1.15 + index) * 0.06;
      });

      verdictArc.material.opacity = 0.4 + Math.sin(t * 0.95) * 0.12;
      beamGlow.material.opacity = 0.42 + Math.sin(t * 1.1) * 0.1;
      baseGlow.material.opacity = 0.32 + Math.sin(t * 0.82) * 0.08;
      rearGlass.rotation.z = 0.05 + Math.sin(t * 0.2) * 0.015;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  return <canvas className="hlHero3D" ref={canvasRef} aria-hidden="true" />;
}
