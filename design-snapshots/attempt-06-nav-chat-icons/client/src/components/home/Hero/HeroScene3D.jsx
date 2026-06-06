import { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const group = new THREE.Group();
    group.position.set(1.2, -0.2, 0);
    scene.add(group);

    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdfe8bf,
      emissive: 0x6f7f2f,
      emissiveIntensity: 0.08,
      metalness: 0.18,
      roughness: 0.22,
      transmission: 0.18,
      thickness: 0.45,
      transparent: true,
      opacity: 0.42,
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b130d,
      emissive: 0x111a10,
      emissiveIntensity: 0.2,
      metalness: 0.28,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.04,
      roughness: 0.12,
      transmission: 0.45,
      thickness: 0.8,
      transparent: true,
      opacity: 0.22,
    });

    const rings = [
      new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.012, 16, 180), ringMaterial),
      new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.01, 16, 180), ringMaterial.clone()),
      new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.009, 16, 180), ringMaterial.clone()),
    ];

    rings.forEach((ring, index) => {
      ring.rotation.x = Math.PI / 2.7;
      ring.rotation.y = index * 0.18;
      ring.position.z = -index * 0.12;
      group.add(ring);
    });

    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.25);
    shieldShape.bezierCurveTo(0.82, 0.98, 1.14, 0.68, 1.08, 0.02);
    shieldShape.bezierCurveTo(1.02, -0.78, 0.52, -1.22, 0, -1.48);
    shieldShape.bezierCurveTo(-0.52, -1.22, -1.02, -0.78, -1.08, 0.02);
    shieldShape.bezierCurveTo(-1.14, 0.68, -0.82, 0.98, 0, 1.25);

    const shield = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shieldShape, {
        bevelEnabled: true,
        bevelSegments: 8,
        bevelSize: 0.035,
        bevelThickness: 0.035,
        depth: 0.035,
      }),
      glassMaterial
    );
    shield.scale.set(0.72, 0.72, 0.72);
    shield.position.set(-1.6, 0.15, 0.2);
    shield.rotation.z = -0.08;
    group.add(shield);

    const barGeometry = new THREE.BoxGeometry(0.86, 0.055, 0.055);
    const bars = Array.from({ length: 3 }, (_, index) => {
      const bar = new THREE.Mesh(barGeometry, darkMaterial);
      bar.position.set(-1.6, 0.32 - index * 0.22, 0.3);
      bar.rotation.z = -0.08;
      group.add(bar);
      return bar;
    });

    const nodes = Array.from({ length: 26 }, (_, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: index % 3 === 0 ? 0xc9dd72 : 0xffffff,
        transparent: true,
        opacity: index % 3 === 0 ? 0.72 : 0.34,
      });
      const node = new THREE.Mesh(new THREE.SphereGeometry(index % 3 === 0 ? 0.028 : 0.018, 12, 12), material);
      const angle = (index / 26) * Math.PI * 2;
      const radius = 1.2 + (index % 5) * 0.28;
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.62, -0.45 + (index % 4) * 0.08);
      group.add(node);
      return { angle, node, radius };
    });

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);

    const accentLight = new THREE.PointLight(0xc9dd72, 2.2, 10);
    accentLight.position.set(3.2, -2.4, 3);
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
      group.position.set(narrow ? 0.25 : 1.28, narrow ? -0.48 : -0.1, 0);
      group.scale.setScalar(narrow ? 0.74 : 1);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (time) => {
      const t = time * 0.001;

      group.rotation.y = Math.sin(t * 0.32) * 0.16;
      group.rotation.x = Math.sin(t * 0.24) * 0.04;

      rings.forEach((ring, index) => {
        ring.rotation.z = t * (0.08 + index * 0.024) * (index % 2 ? -1 : 1);
        ring.material.opacity = 0.28 + Math.sin(t * 0.8 + index) * 0.05;
      });

      shield.rotation.y = Math.sin(t * 0.55) * 0.08;
      shield.position.y = 0.14 + Math.sin(t * 0.9) * 0.035;

      bars.forEach((bar, index) => {
        bar.scale.x = 0.82 + Math.sin(t * 1.2 + index) * 0.08;
      });

      nodes.forEach((item, index) => {
        const angle = item.angle + t * (0.08 + (index % 4) * 0.012);
        item.node.position.x = Math.cos(angle) * item.radius;
        item.node.position.y = Math.sin(angle) * item.radius * 0.62;
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      rings.forEach((ring) => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
      shield.geometry.dispose();
      bars.forEach((bar) => bar.geometry.dispose());
      nodes.forEach(({ node }) => {
        node.geometry.dispose();
        node.material.dispose();
      });
      darkMaterial.dispose();
      glassMaterial.dispose();
    };
  }, []);

  return <canvas className="hlHero3D" ref={canvasRef} aria-hidden="true" />;
}
