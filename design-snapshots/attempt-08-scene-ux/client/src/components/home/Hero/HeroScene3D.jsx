import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function roundedRectShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  return shape;
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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 8.4);

    const stage = new THREE.Group();
    scene.add(stage);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8fff0,
      metalness: 0.08,
      roughness: 0.18,
      transmission: 0.38,
      thickness: 0.9,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
    });

    const darkGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x162216,
      emissive: 0x1d3215,
      emissiveIntensity: 0.12,
      metalness: 0.18,
      roughness: 0.28,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });

    const accentMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8ee84,
      transparent: true,
      opacity: 0.76,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const softLineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const panelGeometry = new THREE.ShapeGeometry(roundedRectShape(1.9, 2.55, 0.18));
    const thinPanelGeometry = new THREE.ShapeGeometry(roundedRectShape(1.16, 1.72, 0.14));

    const panels = [
      { x: 1.38, y: 0.18, z: -0.32, ry: -0.28, s: 1.06, material: glassMaterial },
      { x: 2.18, y: 0.06, z: -0.84, ry: -0.5, s: 0.86, material: darkGlassMaterial },
      { x: 0.28, y: -0.2, z: -0.98, ry: 0.34, s: 0.78, material: glassMaterial },
      { x: 1.66, y: -1.58, z: -0.44, ry: -0.22, s: 0.62, material: glassMaterial },
    ].map((config, index) => {
      const mesh = new THREE.Mesh(index === 3 ? thinPanelGeometry : panelGeometry, config.material);
      mesh.position.set(config.x, config.y, config.z);
      mesh.rotation.set(-0.08, config.ry, index % 2 ? 0.04 : -0.035);
      mesh.scale.setScalar(config.s);
      stage.add(mesh);
      return mesh;
    });

    const pathCurves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.15, -1.45, 0.1),
        new THREE.Vector3(-0.18, -0.86, -0.2),
        new THREE.Vector3(1.12, -0.46, -0.44),
        new THREE.Vector3(2.58, -0.1, -0.7),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.82, 1.1, -0.22),
        new THREE.Vector3(0.28, 0.82, -0.34),
        new THREE.Vector3(1.42, 0.54, -0.54),
        new THREE.Vector3(2.52, 0.36, -0.8),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.46, -0.08, -0.16),
        new THREE.Vector3(0.42, 0.05, -0.28),
        new THREE.Vector3(1.18, 0.05, -0.44),
        new THREE.Vector3(2.18, 0.0, -0.62),
      ]),
    ];

    const paths = pathCurves.map((curve, index) => {
      const geometry = new THREE.TubeGeometry(curve, 80, index === 0 ? 0.012 : 0.008, 8, false);
      const mesh = new THREE.Mesh(geometry, index === 2 ? accentMaterial : softLineMaterial);
      stage.add(mesh);
      return mesh;
    });

    const nodeGeometry = new THREE.SphereGeometry(0.035, 16, 16);
    const nodes = [0.16, 0.38, 0.62, 0.84].map((point, index) => {
      const node = new THREE.Mesh(nodeGeometry, accentMaterial);
      const position = pathCurves[index % pathCurves.length].getPoint(point);
      node.position.copy(position);
      node.scale.setScalar(index === 2 ? 1.35 : 1);
      stage.add(node);
      return { node, point, curve: pathCurves[index % pathCurves.length] };
    });

    const baselineGeometry = new THREE.BoxGeometry(2.2, 0.018, 0.018);
    const baselines = Array.from({ length: 4 }, (_, index) => {
      const line = new THREE.Mesh(baselineGeometry, index === 1 ? accentMaterial : softLineMaterial);
      line.position.set(1.16, -1.18 + index * 0.28, -0.56 - index * 0.08);
      line.rotation.y = -0.26;
      line.scale.x = 0.42 + index * 0.16;
      stage.add(line);
      return line;
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.76));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(-2.6, 3.6, 4.8);
    scene.add(keyLight);

    const accentLight = new THREE.PointLight(0xd8ee84, 1.8, 9);
    accentLight.position.set(3.1, -1.4, 3);
    scene.add(accentLight);

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
      stage.position.set(narrow ? 0.05 : 1.06, narrow ? -0.18 : -0.05, 0);
      stage.scale.setScalar(narrow ? 0.74 : 1);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (time) => {
      const t = time * 0.001;

      stage.rotation.y = Math.sin(t * 0.28) * 0.1;
      stage.rotation.x = Math.sin(t * 0.22) * 0.025;

      panels.forEach((panel, index) => {
        panel.position.y += Math.sin(t * 0.72 + index) * 0.0009;
        panel.rotation.z = Math.sin(t * 0.28 + index) * 0.025;
        panel.material.opacity = (index === 1 ? 0.18 : 0.22) + Math.sin(t * 0.58 + index) * 0.035;
      });

      paths.forEach((path, index) => {
        path.material.opacity = (index === 2 ? 0.54 : 0.16) + Math.sin(t * 0.8 + index) * 0.055;
      });

      nodes.forEach((item, index) => {
        const nextPoint = (item.point + t * (0.025 + index * 0.006)) % 1;
        item.node.position.copy(item.curve.getPoint(nextPoint));
        item.node.scale.setScalar(1 + Math.sin(t * 1.3 + index) * 0.18);
      });

      baselines.forEach((line, index) => {
        line.scale.x = 0.48 + index * 0.15 + Math.sin(t * 0.8 + index) * 0.04;
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      panelGeometry.dispose();
      thinPanelGeometry.dispose();
      nodeGeometry.dispose();
      paths.forEach((path) => path.geometry.dispose());
      baselines.forEach((line) => line.geometry.dispose());
      glassMaterial.dispose();
      darkGlassMaterial.dispose();
      accentMaterial.dispose();
      softLineMaterial.dispose();
    };
  }, []);

  return <canvas className="hlHero3D" ref={canvasRef} aria-hidden="true" />;
}
