import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function makeTube(points, radius, material, segments = 72) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, segments, radius, 8, false);
  return new THREE.Mesh(geometry, material);
}

function makeCylinder(radiusTop, radiusBottom, height, material, radialSegments = 64) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, 1, false),
    material
  );
}

function makeRing(radius, tube, material) {
  return new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 96), material);
}

function createPan(materials) {
  const group = new THREE.Group();

  const bowl = makeCylinder(0.62, 0.48, 0.075, materials.glass, 96);
  bowl.scale.z = 0.46;
  bowl.position.y = -0.025;
  group.add(bowl);

  const rim = makeRing(0.61, 0.018, materials.gold);
  rim.rotation.x = Math.PI / 2;
  rim.scale.z = 0.46;
  group.add(rim);

  const innerRim = makeRing(0.36, 0.006, materials.panGlow);
  innerRim.rotation.x = Math.PI / 2;
  innerRim.scale.z = 0.46;
  innerRim.position.y = 0.035;
  group.add(innerRim);

  const anchorPositions = [
    [-0.48, 0.06, 0],
    [0.48, 0.06, 0],
    [0, 0.06, 0.23],
  ];

  anchorPositions.forEach(([x, y, z]) => {
    const hook = makeRing(0.038, 0.005, materials.gold);
    hook.position.set(x, y, z);
    hook.rotation.x = Math.PI / 2;
    hook.scale.z = 0.72;
    group.add(hook);
  });

  return group;
}

function createScaleSide({ side, beamGroup, materials }) {
  const sideX = side * 1.42;
  const panY = -1.34;
  const hangerY = -0.24;

  const hanger = makeTube(
    [new THREE.Vector3(sideX, -0.02, 0), new THREE.Vector3(sideX, hangerY, 0)],
    0.009,
    materials.gold,
    36
  );
  beamGroup.add(hanger);

  const crownRing = makeRing(0.055, 0.006, materials.gold);
  crownRing.position.set(sideX, hangerY, 0);
  crownRing.rotation.x = Math.PI / 2;
  beamGroup.add(crownRing);

  const pan = createPan(materials);
  pan.position.set(sideX, panY, 0);
  pan.rotation.x = side < 0 ? 0.018 : -0.018;
  pan.rotation.z = side < 0 ? -0.015 : 0.015;
  beamGroup.add(pan);

  const chainTargets = [
    new THREE.Vector3(sideX - 0.48, panY + 0.06, 0),
    new THREE.Vector3(sideX + 0.48, panY + 0.06, 0),
    new THREE.Vector3(sideX, panY + 0.06, 0.23),
  ];

  const chains = chainTargets.map((target, index) => {
    const from = new THREE.Vector3(sideX, hangerY, 0);
    const mid = new THREE.Vector3(
      (from.x + target.x) / 2,
      (from.y + target.y) / 2 - 0.018,
      index === 2 ? 0.12 : 0
    );
    const chain = makeTube([from, mid, target], 0.0055, materials.gold, 48);
    beamGroup.add(chain);
    return chain;
  });

  return { pan, chains, hanger, crownRing };
}

export default function HeroScene3D({ mode = 'desktop' }) {
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
      roughness: 0.2,
      clearcoat: 0.7,
      clearcoatRoughness: 0.22,
      transparent: true,
      opacity: 0.84,
      emissive: 0x52621f,
      emissiveIntensity: 0.045,
    });

    const darkGoldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x556044,
      metalness: 0.74,
      roughness: 0.36,
      transparent: true,
      opacity: 0.56,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8fff1,
      metalness: 0.08,
      roughness: 0.14,
      transmission: 0.44,
      thickness: 0.7,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });

    const panGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8ee84,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const beamGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8ee84,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const accentHaloMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8ee84,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const floorShadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x071008,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });

    const materials = {
      gold: goldMaterial,
      glass: glassMaterial,
      panGlow: panGlowMaterial,
    };

    const column = makeCylinder(0.055, 0.086, 3.82, goldMaterial, 72);
    column.position.y = -0.76;
    scales.add(column);

    const base = makeCylinder(0.58, 0.82, 0.13, darkGoldMaterial, 96);
    base.position.y = -2.58;
    base.scale.z = 0.56;
    scales.add(base);

    const foot = makeCylinder(0.36, 0.5, 0.08, goldMaterial, 96);
    foot.position.y = -2.42;
    foot.scale.z = 0.58;
    scales.add(foot);

    const baseLine = makeRing(0.74, 0.01, beamGlowMaterial);
    baseLine.rotation.x = Math.PI / 2;
    baseLine.scale.z = 0.56;
    baseLine.position.y = -2.45;
    scales.add(baseLine);

    const floorShadow = new THREE.Mesh(new THREE.CircleGeometry(1.08, 96), floorShadowMaterial);
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.set(0.16, -2.66, 0.12);
    floorShadow.scale.set(1, 0.34, 1);
    scales.add(floorShadow);

    const fulcrum = new THREE.Mesh(new THREE.SphereGeometry(0.095, 36, 36), goldMaterial);
    fulcrum.position.y = 1.05;
    scales.add(fulcrum);

    const beamGroup = new THREE.Group();
    beamGroup.position.y = 1.08;
    scales.add(beamGroup);

    const beam = makeCylinder(0.032, 0.032, 3.48, goldMaterial, 48);
    beam.rotation.z = Math.PI / 2;
    beamGroup.add(beam);

    const beamSleeve = makeCylinder(0.05, 0.05, 0.22, goldMaterial, 48);
    beamSleeve.rotation.z = Math.PI / 2;
    beamGroup.add(beamSleeve);

    const beamGlow = makeTube(
      [
        new THREE.Vector3(-1.68, 0.018, 0.035),
        new THREE.Vector3(0, 0.03, 0.06),
        new THREE.Vector3(1.68, 0.018, 0.035),
      ],
      0.006,
      beamGlowMaterial,
      100
    );
    beamGroup.add(beamGlow);

    const leftSide = createScaleSide({ side: -1, beamGroup, materials });
    const rightSide = createScaleSide({ side: 1, beamGroup, materials });

    const haloGroup = new THREE.Group();
    haloGroup.position.set(0.12, -0.26, -0.2);
    scales.add(haloGroup);

    const halos = Array.from({ length: 4 }, (_, index) => {
      const material = index === 1 ? accentHaloMaterial : haloMaterial.clone();
      const halo = makeRing(1.42 + index * 0.24, 0.005, material);
      halo.rotation.x = Math.PI / 2;
      halo.rotation.z = index * 0.16;
      halo.scale.z = 0.68;
      haloGroup.add(halo);
      return halo;
    });

    const verdictArcMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8ee84,
      transparent: true,
      opacity: 0.26,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const verdictArc = makeTube(
      [
        new THREE.Vector3(-1.55, -1.2, -0.06),
        new THREE.Vector3(-0.55, -1.02, 0.08),
        new THREE.Vector3(0.55, -1.02, 0.08),
        new THREE.Vector3(1.55, -1.2, -0.06),
      ],
      0.006,
      verdictArcMaterial,
      110
    );
    scales.add(verdictArc);

    const glassPlaneGeometry = new THREE.PlaneGeometry(2.75, 3.58, 1, 1);
    const glassPlaneMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.02,
      roughness: 0.12,
      transmission: 0.52,
      thickness: 0.62,
      transparent: true,
      opacity: 0.066,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const rearGlass = new THREE.Mesh(glassPlaneGeometry, glassPlaneMaterial);
    rearGlass.position.set(0.58, -0.15, -0.42);
    rearGlass.rotation.set(-0.08, -0.24, 0.05);
    stage.add(rearGlass);

    scene.add(new THREE.AmbientLight(0xffffff, 0.68));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.75);
    keyLight.position.set(-2.8, 3.6, 4.8);
    scene.add(keyLight);

    const goldLight = new THREE.PointLight(0xd8ee84, 1.9, 8.5);
    goldLight.position.set(2.2, 0.7, 2.8);
    scene.add(goldLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.85, 7);
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

      if (mode === 'mobileCard') {
        const compact = width < 430;

        if (compact) {
          stage.position.set(-0.04, 0.24, 0);
          stage.scale.setScalar(0.76);
          scales.rotation.set(-0.042, -0.16, 0);
        } else {
          stage.position.set(0.02, 0.18, 0);
          stage.scale.setScalar(0.9);
          scales.rotation.set(-0.038, -0.2, 0);
        }
        return;
      }

      const narrow = width < 720;
      const tablet = width < 980;

      if (narrow) {
        stage.position.set(0.18, 1.16, 0);
        stage.scale.setScalar(0.43);
        scales.rotation.set(-0.045, -0.2, 0);
      } else if (tablet) {
        stage.position.set(0.6, 0.56, 0);
        stage.scale.setScalar(0.68);
        scales.rotation.set(-0.04, -0.22, 0);
      } else {
        stage.position.set(1.65, 0.12, 0);
        stage.scale.setScalar(0.98);
        scales.rotation.set(-0.035, -0.34, 0);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (time) => {
      const t = time * 0.001;
      const balance = Math.sin(t * 0.45) * 0.024 + Math.sin(t * 0.17) * 0.012;

      stage.rotation.y = Math.sin(t * 0.2) * 0.028;
      stage.rotation.x = Math.sin(t * 0.16) * 0.014;
      beamGroup.rotation.z = balance;

      leftSide.pan.rotation.z = -0.015 - balance * 0.12;
      rightSide.pan.rotation.z = 0.015 - balance * 0.12;
      leftSide.pan.rotation.x = 0.018 + Math.sin(t * 0.34) * 0.005;
      rightSide.pan.rotation.x = -0.018 - Math.sin(t * 0.34) * 0.005;

      haloGroup.rotation.z = t * 0.035;
      halos.forEach((halo, index) => {
        halo.rotation.z += 0.0005 * (index + 1);
        halo.material.opacity = (index === 1 ? 0.18 : 0.09) + Math.sin(t * 0.62 + index) * 0.026;
      });

      beamGlow.material.opacity = 0.26 + Math.sin(t * 0.9) * 0.06;
      baseLine.material.opacity = 0.22 + Math.sin(t * 0.72) * 0.045;
      verdictArc.material.opacity = 0.23 + Math.sin(t * 0.85) * 0.055;
      rearGlass.rotation.z = 0.05 + Math.sin(t * 0.18) * 0.012;

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
  }, [mode]);

  return <canvas className={`hlHero3D hlHero3D--${mode}`} ref={canvasRef} aria-hidden="true" />;
}
