import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════
//  UTILITY — PRIMITIVE GEOMETRY BUILDERS
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a smooth tube along a set of 3D control points using
 * CatmullRom interpolation. Used for chains, glowing lines, etc.
 */
function makeTube(points, radius, material, segments = 96) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, segments, radius, 10, false);
  return new THREE.Mesh(geometry, material);
}

/**
 * Convenience wrapper around CylinderGeometry.
 */
function makeCylinder(radiusTop, radiusBottom, height, material, radialSegments = 80) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, 1, false),
    material
  );
}

/**
 * Torus — used for decorative rings and halos.
 */
function makeRing(radius, tube, material, tubularSegments = 128) {
  return new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 14, tubularSegments),
    material
  );
}

/**
 * Simple sphere — used for joints, fulcrums, floating accents.
 */
function makeJoint(radius, material) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), material);
}

/**
 * Flat disk (very thin cylinder) — used for inner pan floors, base details.
 */
function makeDisk(radius, height, material, segments = 96) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
    material
  );
}

/**
 * A cone frustum — used for decorative finials and tapered elements.
 */
function makeCone(radiusBottom, radiusTop, height, material, segments = 64) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, 1, false),
    material
  );
}

/**
 * A thin octagonal prism — used for the ornate column facets.
 */
function makeOctPrism(radius, height, material) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 8, 1, false),
    material
  );
}

// ═══════════════════════════════════════════════════════════════
//  PROCEDURAL ENVIRONMENT MAP
//  Generates a simple gradient cubemap so metals reflect something
//  meaningful even without an HDR texture.
// ═══════════════════════════════════════════════════════════════

function buildEnvMap(renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  // Create a 256×128 equirectangular gradient texture
  const w = 256;
  const h = 128;
  const data = new Uint8Array(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      // t = 0 at top, 1 at bottom
      const t = y / (h - 1);

      // Sky — warm ivory fading to deep charcoal
      const r = Math.round(THREE.MathUtils.lerp(248, 18, t));
      const g = Math.round(THREE.MathUtils.lerp(244, 22, t));
      const b = Math.round(THREE.MathUtils.lerp(224, 16, t));

      // Add a gold band near horizon
      const horizonBand = Math.exp(-Math.pow((t - 0.62) * 8, 2));
      data[idx + 0] = Math.min(255, r + Math.round(horizonBand * 90));
      data[idx + 1] = Math.min(255, g + Math.round(horizonBand * 72));
      data[idx + 2] = Math.min(255, b + Math.round(horizonBand * 14));
      data[idx + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;

  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  pmremGenerator.dispose();
  texture.dispose();
  return envMap;
}

// ═══════════════════════════════════════════════════════════════
//  COLUMN DETAIL — ENGRAVED RINGS & CAPITAL ORNAMENTS
// ═══════════════════════════════════════════════════════════════

function addColumnDetails(scales, materials) {
  // Engraved rings at regular intervals along the shaft
  const shaftRingPositions = [-2.08, -1.62, -1.14, -0.64, -0.16, 0.28, 0.66, 0.92];
  shaftRingPositions.forEach((y) => {
    const ring = makeRing(0.067, 0.006, materials.goldDetail, 80);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    scales.add(ring);
  });

  // Double-ring accents at the thirds
  [-1.14, 0.28].forEach((y) => {
    const r1 = makeRing(0.072, 0.008, materials.gold, 80);
    r1.rotation.x = Math.PI / 2;
    r1.position.y = y + 0.018;
    scales.add(r1);

    const r2 = makeRing(0.072, 0.008, materials.gold, 80);
    r2.rotation.x = Math.PI / 2;
    r2.position.y = y - 0.018;
    scales.add(r2);
  });

  // Capital — top section of the column just below fulcrum
  const capitalBase = makeCylinder(0.10, 0.07, 0.06, materials.gold, 64);
  capitalBase.position.y = 0.97;
  scales.add(capitalBase);

  const capitalMid = makeCylinder(0.112, 0.10, 0.04, materials.goldMirror, 64);
  capitalMid.position.y = 1.01;
  scales.add(capitalMid);

  const capitalTop = makeDisk(0.118, 0.012, materials.gold, 64);
  capitalTop.position.y = 1.03;
  scales.add(capitalTop);

  const capitalRing1 = makeRing(0.100, 0.010, materials.goldDetail, 80);
  capitalRing1.rotation.x = Math.PI / 2;
  capitalRing1.position.y = 0.99;
  scales.add(capitalRing1);

  const capitalRing2 = makeRing(0.116, 0.007, materials.goldGlow, 80);
  capitalRing2.rotation.x = Math.PI / 2;
  capitalRing2.position.y = 1.03;
  scales.add(capitalRing2);

  // Base transition — necking rings
  const neckRing1 = makeRing(0.082, 0.009, materials.gold, 80);
  neckRing1.rotation.x = Math.PI / 2;
  neckRing1.position.y = -2.38;
  scales.add(neckRing1);

  const neckRing2 = makeRing(0.096, 0.007, materials.goldDetail, 80);
  neckRing2.rotation.x = Math.PI / 2;
  neckRing2.position.y = -2.43;
  scales.add(neckRing2);

  // Finial on top of fulcrum
  const finial = makeCone(0.020, 0.006, 0.07, materials.goldMirror, 16);
  finial.position.y = 1.24;
  scales.add(finial);

  const finialBall = makeJoint(0.016, materials.goldMirror);
  finialBall.position.y = 1.29;
  scales.add(finialBall);
}

// ═══════════════════════════════════════════════════════════════
//  PEDESTAL — THREE-TIERED BASE WITH DECORATIVE MOULDINGS
// ═══════════════════════════════════════════════════════════════

function buildPedestal(scales, materials) {
  // Tier 3 — lowest, widest, darkest
  const t3 = makeCylinder(0.72, 0.98, 0.13, materials.dark, 96);
  t3.position.y = -2.76;
  t3.scale.z = 0.50;
  scales.add(t3);

  // Tier 3 top edge chamfer
  const t3Chamfer = makeCone(0.72, 0.64, 0.05, materials.goldDetail, 96);
  t3Chamfer.position.y = -2.64;
  t3Chamfer.scale.z = 0.50;
  scales.add(t3Chamfer);

  // Tier 2
  const t2 = makeCylinder(0.62, 0.76, 0.11, materials.goldDetail, 96);
  t2.position.y = -2.60;
  t2.scale.z = 0.52;
  scales.add(t2);

  // Tier 2 ovolo moulding
  const t2Ovolo = makeRing(0.68, 0.016, materials.gold, 96);
  t2Ovolo.rotation.x = Math.PI / 2;
  t2Ovolo.scale.z = 0.52;
  t2Ovolo.position.y = -2.56;
  scales.add(t2Ovolo);

  // Tier 1 — top, most ornate
  const t1 = makeCylinder(0.44, 0.60, 0.09, materials.gold, 96);
  t1.position.y = -2.52;
  t1.scale.z = 0.56;
  scales.add(t1);

  const t1Rim = makeRing(0.47, 0.012, materials.goldMirror, 96);
  t1Rim.rotation.x = Math.PI / 2;
  t1Rim.scale.z = 0.56;
  t1Rim.position.y = -2.48;
  scales.add(t1Rim);

  // Decorative ring mouldings around base tiers
  const pedestalRingData = [
    { y: -2.72, r: 0.88, s: 0.50, mat: materials.goldDetail },
    { y: -2.66, r: 0.80, s: 0.50, mat: materials.goldDetail },
    { y: -2.60, r: 0.70, s: 0.52, mat: materials.gold },
    { y: -2.54, r: 0.56, s: 0.54, mat: materials.goldMirror },
    { y: -2.49, r: 0.46, s: 0.56, mat: materials.goldDetail },
  ];
  pedestalRingData.forEach(({ y, r, s, mat }) => {
    const ring = makeRing(r, 0.007, mat, 96);
    ring.rotation.x = Math.PI / 2;
    ring.scale.z = s;
    ring.position.y = y;
    scales.add(ring);
  });

  // Glowing base lines
  const glowLine1 = makeRing(0.80, 0.012, materials.baseGlow, 100);
  glowLine1.rotation.x = Math.PI / 2;
  glowLine1.scale.z = 0.50;
  glowLine1.position.y = -2.68;
  scales.add(glowLine1);

  const glowLine2 = makeRing(0.56, 0.007, materials.panGlow, 100);
  glowLine2.rotation.x = Math.PI / 2;
  glowLine2.scale.z = 0.54;
  glowLine2.position.y = -2.52;
  scales.add(glowLine2);

  // Floor elliptical shadow
  const floorShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.22, 96),
    materials.floorShadow
  );
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.position.set(0.20, -2.84, 0.14);
  floorShadow.scale.set(1.0, 0.28, 1.0);
  scales.add(floorShadow);

  // Secondary softer shadow
  const floorShadow2 = new THREE.Mesh(
    new THREE.CircleGeometry(1.80, 96),
    materials.floorShadow2
  );
  floorShadow2.rotation.x = -Math.PI / 2;
  floorShadow2.position.set(0.28, -2.83, 0.20);
  floorShadow2.scale.set(1.0, 0.22, 1.0);
  scales.add(floorShadow2);

  return { glowLine1, glowLine2 };
}

// ═══════════════════════════════════════════════════════════════
//  PAN — DEEP DISH WITH ORNATE DETAILS
// ═══════════════════════════════════════════════════════════════

function createPan(materials) {
  const group = new THREE.Group();

  // Main dish body
  const bowl = makeCylinder(0.67, 0.51, 0.088, materials.glass, 112);
  bowl.scale.z = 0.43;
  bowl.position.y = -0.030;
  group.add(bowl);

  // Inner reflective floor
  const innerFloor = makeDisk(0.46, 0.009, materials.goldMirror, 80);
  innerFloor.position.y = -0.064;
  innerFloor.scale.z = 0.43;
  group.add(innerFloor);

  // Inner floor glow ring
  const floorGlow = makeRing(0.30, 0.006, materials.panGlow, 80);
  floorGlow.rotation.x = Math.PI / 2;
  floorGlow.scale.z = 0.43;
  floorGlow.position.y = -0.062;
  group.add(floorGlow);

  // Outer rim — principal moulding
  const rimOuter = makeRing(0.65, 0.024, materials.gold, 128);
  rimOuter.rotation.x = Math.PI / 2;
  rimOuter.scale.z = 0.43;
  group.add(rimOuter);

  // Rim undercut shadow
  const rimShadow = makeRing(0.63, 0.012, materials.goldDetail, 120);
  rimShadow.rotation.x = Math.PI / 2;
  rimShadow.scale.z = 0.43;
  rimShadow.position.y = -0.016;
  group.add(rimShadow);

  // Inner decorative rim glow
  const innerRim = makeRing(0.39, 0.0075, materials.panGlow, 100);
  innerRim.rotation.x = Math.PI / 2;
  innerRim.scale.z = 0.43;
  innerRim.position.y = 0.036;
  group.add(innerRim);

  // Secondary ornament band
  const outerAccent = makeRing(0.58, 0.0055, materials.goldDetail, 100);
  outerAccent.rotation.x = Math.PI / 2;
  outerAccent.scale.z = 0.43;
  outerAccent.position.y = 0.022;
  group.add(outerAccent);

  // Third inner hairline
  const hairline = makeRing(0.50, 0.003, materials.goldMirror, 100);
  hairline.rotation.x = Math.PI / 2;
  hairline.scale.z = 0.43;
  hairline.position.y = 0.030;
  group.add(hairline);

  // Three suspension hooks with ornamental detail
  const anchorPositions = [
    [-0.51, 0.066, 0],
    [0.51, 0.066, 0],
    [0, 0.066, 0.245],
  ];

  anchorPositions.forEach(([x, y, z]) => {
    // Main hook ring
    const hook = makeRing(0.044, 0.0065, materials.gold, 64);
    hook.position.set(x, y, z);
    hook.rotation.x = Math.PI / 2;
    hook.scale.z = 0.66;
    group.add(hook);

    // Hook accent ring
    const hookAccent = makeRing(0.051, 0.003, materials.goldDetail, 48);
    hookAccent.position.set(x, y - 0.010, z);
    hookAccent.rotation.x = Math.PI / 2;
    hookAccent.scale.z = 0.66;
    group.add(hookAccent);

    // Hook joint sphere
    const hookJoint = makeJoint(0.019, materials.gold);
    hookJoint.position.set(x, y, z);
    group.add(hookJoint);

    // Mirror cap on joint
    const hookCap = makeJoint(0.012, materials.goldMirror);
    hookCap.position.set(x, y + 0.014, z);
    group.add(hookCap);
  });

  return group;
}

// ═══════════════════════════════════════════════════════════════
//  ONE SIDE OF THE SCALE (PAN + CHAINS + HANGER)
// ═══════════════════════════════════════════════════════════════

function createScaleSide({ side, beamGroup, materials }) {
  const sideX = side * 1.44;
  const panY = -1.40;
  const hangerY = -0.27;

  // ── Primary hanger rod ────────────────────
  const hanger = makeTube(
    [
      new THREE.Vector3(sideX, -0.024, 0),
      new THREE.Vector3(sideX, hangerY * 0.48, 0),
      new THREE.Vector3(sideX, hangerY, 0),
    ],
    0.013,
    materials.gold,
    56
  );
  beamGroup.add(hanger);

  // Glow line on hanger
  const hangerGlow = makeTube(
    [
      new THREE.Vector3(sideX, -0.024, 0),
      new THREE.Vector3(sideX, hangerY * 0.48, 0),
      new THREE.Vector3(sideX, hangerY, 0),
    ],
    0.0045,
    materials.goldGlow,
    56
  );
  beamGroup.add(hangerGlow);

  // Decorative collar rings along the hanger
  [0.4, 0.65].forEach((frac) => {
    const collarY = THREE.MathUtils.lerp(-0.024, hangerY, frac);
    const collar = makeRing(0.020, 0.004, materials.goldDetail, 40);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(sideX, collarY, 0);
    beamGroup.add(collar);
  });

  // ── Crown assembly at hanger bottom ───────
  const crownRing = makeRing(0.070, 0.010, materials.gold, 80);
  crownRing.position.set(sideX, hangerY, 0);
  crownRing.rotation.x = Math.PI / 2;
  beamGroup.add(crownRing);

  const crownRing2 = makeRing(0.080, 0.005, materials.goldDetail, 80);
  crownRing2.position.set(sideX, hangerY - 0.012, 0);
  crownRing2.rotation.x = Math.PI / 2;
  beamGroup.add(crownRing2);

  const crownJoint = makeJoint(0.038, materials.gold);
  crownJoint.position.set(sideX, hangerY, 0);
  beamGroup.add(crownJoint);

  const crownMirror = makeJoint(0.026, materials.goldMirror);
  crownMirror.position.set(sideX, hangerY, 0);
  beamGroup.add(crownMirror);

  const crownDisk = makeDisk(0.028, 0.014, materials.goldMirror, 32);
  crownDisk.position.set(sideX, hangerY - 0.024, 0);
  beamGroup.add(crownDisk);

  const crownGlow = makeJoint(0.050, materials.goldGlow);
  crownGlow.position.set(sideX, hangerY, 0);
  beamGroup.add(crownGlow);

  // ── Pan ───────────────────────────────────
  const pan = createPan(materials);
  pan.position.set(sideX, panY, 0);
  pan.rotation.x = side < 0 ? 0.010 : -0.010;
  pan.rotation.z = side < 0 ? -0.006 : 0.006;
  beamGroup.add(pan);

  // ── Three chains ──────────────────────────
  const chainTargets = [
    new THREE.Vector3(sideX - 0.51, panY + 0.066, 0),
    new THREE.Vector3(sideX + 0.51, panY + 0.066, 0),
    new THREE.Vector3(sideX, panY + 0.066, 0.245),
  ];

  const chains = chainTargets.map((target, index) => {
    const from = new THREE.Vector3(sideX, hangerY, 0);

    // Catenary-like control points
    const c1 = new THREE.Vector3(
      from.x + (target.x - from.x) * 0.32,
      from.y + (target.y - from.y) * 0.26,
      index === 2 ? 0.055 : 0
    );
    const c2 = new THREE.Vector3(
      from.x + (target.x - from.x) * 0.68,
      from.y + (target.y - from.y) * 0.74,
      index === 2 ? 0.15 : 0
    );

    const chain = makeTube([from, c1, c2, target], 0.0085, materials.gold, 80);
    beamGroup.add(chain);

    // Glow trace on each chain
    const chainGlow = makeTube([from, c1, c2, target], 0.003, materials.goldGlow, 80);
    beamGroup.add(chainGlow);

    // Evenly spaced link rings along chain for realism
    const chainCurve = new THREE.CatmullRomCurve3([from, c1, c2, target]);
    const linkCount = 7;
    for (let li = 1; li < linkCount; li++) {
      const pt = chainCurve.getPoint(li / linkCount);
      const linkRing = makeRing(0.014, 0.0032, materials.goldDetail, 20);
      linkRing.position.copy(pt);
      linkRing.rotation.x = Math.PI / 2;
      beamGroup.add(linkRing);
    }

    // Lower attachment joint
    const lowerJoint = makeJoint(0.026, materials.gold);
    lowerJoint.position.copy(target);
    beamGroup.add(lowerJoint);

    const lowerRing = makeRing(0.030, 0.0045, materials.goldDetail, 40);
    lowerRing.position.copy(target);
    lowerRing.rotation.x = Math.PI / 2;
    beamGroup.add(lowerRing);

    const lowerGlow = makeJoint(0.034, materials.goldGlow);
    lowerGlow.position.copy(target);
    beamGroup.add(lowerGlow);

    return chain;
  });

  return { pan, chains, hanger, hangerGlow, crownRing, crownJoint };
}

// ═══════════════════════════════════════════════════════════════
//  BEAM ASSEMBLY — HORIZONTAL BAR WITH ORNAMENTAL DETAIL
// ═══════════════════════════════════════════════════════════════

function buildBeam(beamGroup, materials) {
  // Main rod
  const beam = makeCylinder(0.031, 0.031, 3.60, materials.gold, 56);
  beam.rotation.z = Math.PI / 2;
  beamGroup.add(beam);

  // Engraved rings along the beam at regular spacing
  const beamRingPositions = [-1.50, -1.00, -0.50, 0.00, 0.50, 1.00, 1.50];
  beamRingPositions.forEach((x) => {
    const r = makeRing(0.040, 0.0055, materials.goldDetail, 48);
    r.rotation.z = Math.PI / 2;
    r.position.x = x;
    beamGroup.add(r);
  });

  // Double-accent rings at quarter points
  [-1.00, 0.00, 1.00].forEach((x) => {
    const ra = makeRing(0.044, 0.0070, materials.gold, 48);
    ra.rotation.z = Math.PI / 2;
    ra.position.x = x + 0.022;
    beamGroup.add(ra);

    const rb = makeRing(0.044, 0.0070, materials.gold, 48);
    rb.rotation.z = Math.PI / 2;
    rb.position.x = x - 0.022;
    beamGroup.add(rb);
  });

  // Central sleeve — thicker section over fulcrum
  const beamSleeve = makeCylinder(0.050, 0.050, 0.30, materials.goldMirror, 56);
  beamSleeve.rotation.z = Math.PI / 2;
  beamGroup.add(beamSleeve);

  const sleeveRing1 = makeRing(0.060, 0.008, materials.gold, 56);
  sleeveRing1.rotation.z = Math.PI / 2;
  sleeveRing1.position.x = 0.14;
  beamGroup.add(sleeveRing1);

  const sleeveRing2 = makeRing(0.060, 0.008, materials.gold, 56);
  sleeveRing2.rotation.z = Math.PI / 2;
  sleeveRing2.position.x = -0.14;
  beamGroup.add(sleeveRing2);

  // End joints
  const leftJoint = makeJoint(0.052, materials.goldMirror);
  leftJoint.position.x = -1.44;
  beamGroup.add(leftJoint);

  const rightJoint = makeJoint(0.052, materials.goldMirror);
  rightJoint.position.x = 1.44;
  beamGroup.add(rightJoint);

  const leftGlow = makeJoint(0.064, materials.goldGlow);
  leftGlow.position.x = -1.44;
  beamGroup.add(leftGlow);

  const rightGlow = makeJoint(0.064, materials.goldGlow);
  rightGlow.position.x = 1.44;
  beamGroup.add(rightGlow);

  // End decorative rings
  [-1.44, 1.44].forEach((x) => {
    const er = makeRing(0.064, 0.008, materials.goldDetail, 48);
    er.rotation.z = Math.PI / 2;
    er.position.x = x;
    beamGroup.add(er);
  });

  const centerJoint = makeJoint(0.064, materials.goldMirror);
  beamGroup.add(centerJoint);

  const centerGlow = makeJoint(0.080, materials.goldGlow);
  beamGroup.add(centerGlow);

  // Top glowing arc along beam
  const beamGlow = makeTube(
    [
      new THREE.Vector3(-1.74, 0.023, 0.040),
      new THREE.Vector3(-0.87, 0.036, 0.070),
      new THREE.Vector3(0, 0.040, 0.078),
      new THREE.Vector3(0.87, 0.036, 0.070),
      new THREE.Vector3(1.74, 0.023, 0.040),
    ],
    0.0072,
    materials.beamGlow,
    130
  );
  beamGroup.add(beamGlow);

  // Bottom subtle glow arc
  const beamGlow2 = makeTube(
    [
      new THREE.Vector3(-1.74, -0.020, 0.040),
      new THREE.Vector3(0, -0.028, 0.078),
      new THREE.Vector3(1.74, -0.020, 0.040),
    ],
    0.004,
    materials.beamGlow2,
    110
  );
  beamGroup.add(beamGlow2);

  return { beamGlow, beamGlow2, leftJoint, rightJoint, centerJoint };
}

// ═══════════════════════════════════════════════════════════════
//  HALO SYSTEM — CONCENTRIC GLOWING RINGS BEHIND SCALES
// ═══════════════════════════════════════════════════════════════

function buildHalos(scales, materials) {
  const haloGroup = new THREE.Group();
  haloGroup.position.set(0.14, -0.20, -0.26);
  scales.add(haloGroup);

  const haloConfigs = [
    { r: 1.34, tube: 0.0055, mat: materials.halo,        scaleZ: 0.62, rot: 0.00 },
    { r: 1.58, tube: 0.0065, mat: materials.haloAccent,  scaleZ: 0.60, rot: 0.19 },
    { r: 1.84, tube: 0.0055, mat: materials.halo2,       scaleZ: 0.58, rot: 0.38 },
    { r: 2.12, tube: 0.0045, mat: materials.haloDeep,    scaleZ: 0.56, rot: 0.56 },
    { r: 2.42, tube: 0.0035, mat: materials.haloDeep2,   scaleZ: 0.54, rot: 0.74 },
    { r: 2.76, tube: 0.0025, mat: materials.haloDeep2,   scaleZ: 0.52, rot: 0.92 },
  ];

  const halos = haloConfigs.map(({ r, tube, mat, scaleZ, rot }) => {
    const halo = makeRing(r, tube, mat, 144);
    halo.rotation.x = Math.PI / 2;
    halo.rotation.z = rot;
    halo.scale.z = scaleZ;
    haloGroup.add(halo);
    return halo;
  });

  // Tilted vertical accent halo
  const vertHalo1 = makeRing(1.76, 0.0045, materials.haloAccent.clone(), 120);
  vertHalo1.position.set(0.10, -0.08, -0.30);
  vertHalo1.rotation.set(0.14, 0.06, 0.24);
  vertHalo1.scale.z = 0.72;
  scales.add(vertHalo1);

  // Second tilted halo at different angle
  const vertHalo2 = makeRing(1.30, 0.0035, materials.halo.clone(), 100);
  vertHalo2.position.set(-0.06, 0.10, -0.22);
  vertHalo2.rotation.set(0.60, 0.12, -0.18);
  vertHalo2.scale.z = 0.68;
  scales.add(vertHalo2);

  return { haloGroup, halos, vertHalo1, vertHalo2 };
}

// ═══════════════════════════════════════════════════════════════
//  DECORATIVE ARCS
// ═══════════════════════════════════════════════════════════════

function buildArcs(scales, materials) {
  // Lower verdict arc
  const verdictArc = makeTube(
    [
      new THREE.Vector3(-1.64, -1.20, -0.09),
      new THREE.Vector3(-0.82, -1.00, 0.06),
      new THREE.Vector3(0, -0.96, 0.10),
      new THREE.Vector3(0.82, -1.00, 0.06),
      new THREE.Vector3(1.64, -1.20, -0.09),
    ],
    0.0072,
    materials.verdictArc,
    140
  );
  scales.add(verdictArc);

  // Secondary thinner arc below
  const verdictArc2 = makeTube(
    [
      new THREE.Vector3(-1.48, -1.40, -0.06),
      new THREE.Vector3(-0.74, -1.18, 0.04),
      new THREE.Vector3(0, -1.14, 0.08),
      new THREE.Vector3(0.74, -1.18, 0.04),
      new THREE.Vector3(1.48, -1.40, -0.06),
    ],
    0.004,
    materials.verdictArc2,
    120
  );
  scales.add(verdictArc2);

  // Top arc above beam
  const topArc = makeTube(
    [
      new THREE.Vector3(-1.62, 1.26, -0.05),
      new THREE.Vector3(-0.81, 1.39, 0.042),
      new THREE.Vector3(0, 1.44, 0.064),
      new THREE.Vector3(0.81, 1.39, 0.042),
      new THREE.Vector3(1.62, 1.26, -0.05),
    ],
    0.005,
    materials.topArc,
    130
  );
  scales.add(topArc);

  // Tertiary micro arc
  const topArc2 = makeTube(
    [
      new THREE.Vector3(-1.44, 1.34, -0.03),
      new THREE.Vector3(0, 1.50, 0.052),
      new THREE.Vector3(1.44, 1.34, -0.03),
    ],
    0.003,
    materials.topArc2,
    110
  );
  scales.add(topArc2);

  return { verdictArc, verdictArc2, topArc, topArc2 };
}

// ═══════════════════════════════════════════════════════════════
//  GLASS PANELS — SEMI-TRANSPARENT BACKDROP
// ═══════════════════════════════════════════════════════════════

function buildGlassPanels(stage, materials) {
  // Main large rear panel
  const rearGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(3.10, 4.10, 1, 1),
    materials.glassBg
  );
  rearGlass.position.set(0.64, -0.10, -0.52);
  rearGlass.rotation.set(-0.06, -0.20, 0.042);
  stage.add(rearGlass);

  // Side angled accent panel
  const sideGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(1.50, 3.80, 1, 1),
    materials.glassBg2
  );
  sideGlass.position.set(1.90, -0.16, -0.34);
  sideGlass.rotation.set(-0.04, -0.70, 0.020);
  stage.add(sideGlass);

  // Smaller lower panel
  const lowerGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(2.40, 1.60, 1, 1),
    materials.glassBg3
  );
  lowerGlass.position.set(0.50, -1.80, -0.40);
  lowerGlass.rotation.set(-0.08, -0.16, 0.06);
  stage.add(lowerGlass);

  return { rearGlass, sideGlass, lowerGlass };
}

// ═══════════════════════════════════════════════════════════════
//  FLOATING ORNAMENTAL SPHERES
// ═══════════════════════════════════════════════════════════════

function buildFloatingSpheres(scales, materials) {
  const configs = [
    { pos: [-2.0, 0.42, 0.32],  size: 0.020, phase: 0.0, opacity: 0.32 },
    { pos: [2.2, -0.58, 0.22],  size: 0.026, phase: 1.1, opacity: 0.28 },
    { pos: [-2.3, -0.98, -0.10], size: 0.018, phase: 2.0, opacity: 0.24 },
    { pos: [1.9, 0.86, -0.18],  size: 0.022, phase: 3.1, opacity: 0.30 },
    { pos: [-0.9, 1.88, 0.12],  size: 0.015, phase: 4.2, opacity: 0.22 },
    { pos: [0.8, -1.96, 0.16],  size: 0.019, phase: 5.3, opacity: 0.26 },
    { pos: [-1.6, -1.68, 0.22], size: 0.014, phase: 0.7, opacity: 0.20 },
    { pos: [2.5, 0.20, -0.08],  size: 0.016, phase: 1.8, opacity: 0.22 },
    { pos: [-0.4, 2.10, -0.06], size: 0.012, phase: 2.9, opacity: 0.18 },
    { pos: [1.2, 1.60, 0.28],   size: 0.013, phase: 3.5, opacity: 0.20 },
  ];

  const spheres = configs.map(({ pos: [x, y, z], size, phase, opacity }) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0xd4b95a,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    mesh.position.set(x, y, z);
    scales.add(mesh);
    return { mesh, baseY: y, phase };
  });

  return spheres;
}

// ═══════════════════════════════════════════════════════════════
//  PARTICLE FIELD
// ═══════════════════════════════════════════════════════════════

function buildParticleField(scene) {
  const count = 220;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4.0 - 0.6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xcca830,
    size: 0.030,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  return { particles, posAttr: geometry.getAttribute('position') };
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function HeroScene3D({ mode = 'desktop' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    // ────────────────────────────────────────
    //  RENDERER
    // ────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ────────────────────────────────────────
    //  SCENE & CAMERA
    // ────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 120);
    camera.position.set(0, 0, 9.2);

    const stage = new THREE.Group();
    scene.add(stage);

    const scales = new THREE.Group();
    stage.add(scales);

    // ────────────────────────────────────────
    //  ENVIRONMENT MAP
    // ────────────────────────────────────────
    let envMap = null;
    try {
      envMap = buildEnvMap(renderer);
      scene.environment = envMap;
    } catch (_) {
      // Graceful fallback — no env map
    }

    // ────────────────────────────────────────
    //  MATERIAL DEFINITIONS
    // ────────────────────────────────────────

    // Rich warm gold — primary surfaces
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xc8a448),
      metalness: 0.94,
      roughness: 0.12,
      clearcoat: 0.92,
      clearcoatRoughness: 0.10,
      transparent: true,
      opacity: 0.93,
      emissive: new THREE.Color(0x6b4808),
      emissiveIntensity: 0.055,
      envMapIntensity: envMap ? 1.5 : 0.0,
    });

    // Slightly darker engraved detail gold
    const goldDetailMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xa88438),
      metalness: 0.90,
      roughness: 0.20,
      clearcoat: 0.65,
      clearcoatRoughness: 0.16,
      transparent: true,
      opacity: 0.82,
      emissive: new THREE.Color(0x3c2004),
      emissiveIntensity: 0.038,
      envMapIntensity: envMap ? 1.1 : 0.0,
    });

    // Mirror-polish gold for highlights
    const goldMirrorMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xead87c),
      metalness: 0.99,
      roughness: 0.03,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      transparent: true,
      opacity: 0.90,
      emissive: new THREE.Color(0x806010),
      emissiveIntensity: 0.082,
      envMapIntensity: envMap ? 2.0 : 0.0,
    });

    // Dark oxidised bronze for base
    const darkMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x2e3820),
      metalness: 0.80,
      roughness: 0.46,
      transparent: true,
      opacity: 0.68,
    });

    // Crystal glass pans
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xeef8e4),
      metalness: 0.03,
      roughness: 0.07,
      transmission: 0.76,
      thickness: 1.0,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      ior: 1.55,
      reflectivity: 0.30,
      envMapIntensity: envMap ? 0.9 : 0.0,
    });

    // ── Additive glow materials ───────────────
    const panGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xecd060,
      transparent: true,
      opacity: 0.44,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const goldGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xf0c83c,
      transparent: true,
      opacity: 0.26,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const beamGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xecd060,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const beamGlow2Material = new THREE.MeshBasicMaterial({
      color: 0xd4a830,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const baseGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xe8cc54,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xfff4e0,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const haloAccentMaterial = new THREE.MeshBasicMaterial({
      color: 0xe8d060,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const halo2Material = new THREE.MeshBasicMaterial({
      color: 0xfff0c0,
      transparent: true,
      opacity: 0.07,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const haloDeepMaterial = new THREE.MeshBasicMaterial({
      color: 0xc8a028,
      transparent: true,
      opacity: 0.055,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const haloDeep2Material = new THREE.MeshBasicMaterial({
      color: 0xa07818,
      transparent: true,
      opacity: 0.036,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const verdictArcMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8cc58,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const verdictArc2Material = new THREE.MeshBasicMaterial({
      color: 0xb8a840,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const topArcMaterial = new THREE.MeshBasicMaterial({
      color: 0xdcd058,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const topArc2Material = new THREE.MeshBasicMaterial({
      color: 0xc0b040,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const glassBgMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.01,
      roughness: 0.07,
      transmission: 0.70,
      thickness: 0.85,
      transparent: true,
      opacity: 0.052,
      side: THREE.DoubleSide,
      depthWrite: false,
      ior: 1.48,
    });

    const glassBg2Material = new THREE.MeshPhysicalMaterial({
      color: 0xfff8e8,
      metalness: 0.02,
      roughness: 0.10,
      transmission: 0.65,
      thickness: 0.70,
      transparent: true,
      opacity: 0.038,
      side: THREE.DoubleSide,
      depthWrite: false,
      ior: 1.46,
    });

    const glassBg3Material = new THREE.MeshPhysicalMaterial({
      color: 0xfffff0,
      metalness: 0.01,
      roughness: 0.12,
      transmission: 0.60,
      thickness: 0.60,
      transparent: true,
      opacity: 0.030,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const floorShadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x040a04,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    });

    const floorShadow2Material = new THREE.MeshBasicMaterial({
      color: 0x060e06,
      transparent: true,
      opacity: 0.10,
      depthWrite: false,
    });

    // Consolidated materials map passed to builder functions
    const mats = {
      gold: goldMaterial,
      goldDetail: goldDetailMaterial,
      goldMirror: goldMirrorMaterial,
      dark: darkMaterial,
      glass: glassMaterial,
      panGlow: panGlowMaterial,
      goldGlow: goldGlowMaterial,
      beamGlow: beamGlowMaterial,
      beamGlow2: beamGlow2Material,
      baseGlow: baseGlowMaterial,
      halo: haloMaterial,
      haloAccent: haloAccentMaterial,
      halo2: halo2Material,
      haloDeep: haloDeepMaterial,
      haloDeep2: haloDeep2Material,
      verdictArc: verdictArcMaterial,
      verdictArc2: verdictArc2Material,
      topArc: topArcMaterial,
      topArc2: topArc2Material,
      glassBg: glassBgMaterial,
      glassBg2: glassBg2Material,
      glassBg3: glassBg3Material,
      floorShadow: floorShadowMaterial,
      floorShadow2: floorShadow2Material,
    };

    // ────────────────────────────────────────
    //  PEDESTAL
    // ────────────────────────────────────────
    const { glowLine1, glowLine2 } = buildPedestal(scales, mats);

    // ────────────────────────────────────────
    //  MAIN COLUMN
    // ────────────────────────────────────────
    const column = makeCylinder(0.052, 0.082, 3.92, goldMaterial, 80);
    column.position.y = -0.78;
    scales.add(column);

    addColumnDetails(scales, mats);

    // ────────────────────────────────────────
    //  FULCRUM
    // ────────────────────────────────────────
    const fulcrum = makeJoint(0.100, goldMirrorMaterial);
    fulcrum.position.y = 1.05;
    scales.add(fulcrum);

    const fulcrumRing = makeRing(0.124, 0.011, goldDetailMaterial, 64);
    fulcrumRing.rotation.x = Math.PI / 2;
    fulcrumRing.position.y = 1.05;
    scales.add(fulcrumRing);

    const fulcrumRing2 = makeRing(0.138, 0.007, goldGlowMaterial, 64);
    fulcrumRing2.rotation.x = Math.PI / 2;
    fulcrumRing2.position.y = 1.05;
    scales.add(fulcrumRing2);

    const fulcrumGlow = makeJoint(0.118, goldGlowMaterial);
    fulcrumGlow.position.y = 1.05;
    scales.add(fulcrumGlow);

    // ────────────────────────────────────────
    //  BEAM
    // ────────────────────────────────────────
    const beamGroup = new THREE.Group();
    beamGroup.position.y = 1.08;
    scales.add(beamGroup);

    const beamParts = buildBeam(beamGroup, mats);

    // ────────────────────────────────────────
    //  SCALE SIDES
    // ────────────────────────────────────────
    const leftSide = createScaleSide({ side: -1, beamGroup, materials: mats });
    const rightSide = createScaleSide({ side: 1, beamGroup, materials: mats });

    // ────────────────────────────────────────
    //  HALOS
    // ────────────────────────────────────────
    const { haloGroup, halos, vertHalo1, vertHalo2 } = buildHalos(scales, mats);

    // ────────────────────────────────────────
    //  ARCS
    // ────────────────────────────────────────
    const arcs = buildArcs(scales, mats);

    // ────────────────────────────────────────
    //  GLASS PANELS
    // ────────────────────────────────────────
    const glassPanels = buildGlassPanels(stage, mats);

    // ────────────────────────────────────────
    //  FLOATING SPHERES
    // ────────────────────────────────────────
    const floatingSpheres = buildFloatingSpheres(scales, mats);

    // ────────────────────────────────────────
    //  PARTICLES
    // ────────────────────────────────────────
    const { particles, posAttr } = buildParticleField(scene);

    // ────────────────────────────────────────
    //  LIGHTS
    // ────────────────────────────────────────

    // Warm ambient fill
    const ambient = new THREE.AmbientLight(0xfff4e0, 0.74);
    scene.add(ambient);

    // Primary key light — top left, neutral warm white
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.95);
    keyLight.position.set(-3.4, 4.4, 5.6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 32;
    keyLight.shadow.bias = -0.0012;
    scene.add(keyLight);

    // Gold warm point light — right side
    const goldLight = new THREE.PointLight(0xd4a820, 2.30, 9.5);
    goldLight.position.set(2.5, 0.9, 3.4);
    scene.add(goldLight);

    // Cool blue rim light — left side for metallic contrast
    const rimLight = new THREE.PointLight(0xbcd4ff, 0.98, 7.8);
    rimLight.position.set(-2.8, -1.6, 2.8);
    scene.add(rimLight);

    // Warm fill from below — bounce light simulation
    const fillLight = new THREE.PointLight(0xf0cc58, 0.68, 6.5);
    fillLight.position.set(0.4, -2.2, 2.2);
    scene.add(fillLight);

    // Spot light focused on the beam pivot
    const beamSpot = new THREE.SpotLight(0xffe090, 1.50, 8.5, Math.PI * 0.13, 0.48, 1.3);
    beamSpot.position.set(0.2, 3.8, 3.2);
    beamSpot.target.position.set(0, 1.08, 0);
    scene.add(beamSpot);
    scene.add(beamSpot.target);

    // Subtle upper back light to separate column from background
    const backLight = new THREE.PointLight(0xfff0d0, 0.44, 6.0);
    backLight.position.set(-0.5, 2.0, -1.5);
    scene.add(backLight);

    // ────────────────────────────────────────
    //  RESIZE HANDLER
    // ────────────────────────────────────────
    let width = 0;
    let height = 0;

    const applyLayout = (w) => {
      if (mode === 'mobileCard') {
        if (w < 430) {
          stage.position.set(0, 0.92, 0);
          stage.scale.setScalar(0.82);
          scales.rotation.set(-0.020, -0.055, 0);
        } else {
          stage.position.set(0.02, 0.78, 0);
          stage.scale.setScalar(0.90);
          scales.rotation.set(-0.022, -0.065, 0);
        }
        return;
      }
      if (w < 720) {
        stage.position.set(0.20, 1.20, 0);
        stage.scale.setScalar(0.41);
        scales.rotation.set(-0.045, -0.20, 0);
      } else if (w < 980) {
        stage.position.set(0.64, 0.60, 0);
        stage.scale.setScalar(0.64);
        scales.rotation.set(-0.040, -0.22, 0);
      } else {
        stage.position.set(1.24, -0.04, 0);
        stage.scale.setScalar(0.92);
        scales.rotation.set(-0.025, -0.18, 0);
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      applyLayout(width);
    };

    // Apply default desktop layout immediately
    stage.position.set(1.24, -0.04, 0);
    stage.scale.setScalar(0.92);
    scales.rotation.set(-0.025, -0.18, 0);

    resize();
    window.addEventListener('resize', resize);

    // ────────────────────────────────────────
    //  ANIMATION LOOP
    // ────────────────────────────────────────
    let frameId = 0;
    let lastTime = 0;

    const animate = (time) => {
      const t = time * 0.001;
      const dt = Math.min(time - lastTime, 50) * 0.001;
      lastTime = time;

      // ── Scale balance — multi-frequency sway ─
      const balance =
        Math.sin(t * 0.430) * 0.020 +
        Math.sin(t * 0.178) * 0.009 +
        Math.sin(t * 0.083) * 0.004;

      // ── Stage breathing ─────────────────────
      stage.rotation.y = Math.sin(t * 0.192) * 0.025;
      stage.rotation.x = Math.sin(t * 0.152) * 0.011;

      // ── Beam tilt ───────────────────────────
      beamGroup.rotation.z = balance;

      // ── Pan counter-rotation (stay level) ───
      leftSide.pan.rotation.z  = -0.007 - balance * 0.030;
      rightSide.pan.rotation.z =  0.007 - balance * 0.030;
      leftSide.pan.rotation.x  =  0.010 + Math.sin(t * 0.330) * 0.0020;
      rightSide.pan.rotation.x = -0.010 - Math.sin(t * 0.330) * 0.0020;

      // ── Halos slow rotation ──────────────────
      haloGroup.rotation.z = t * 0.030;
      halos.forEach((halo, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        halo.rotation.z += dir * (0.00030 + i * 0.000110);
        const base = i === 1 ? 0.17 : i === 3 ? 0.06 : 0.08;
        halo.material.opacity = base + Math.sin(t * 0.57 + i * 0.78) * 0.026;
      });

      vertHalo1.rotation.z = t * 0.052;
      vertHalo1.material.opacity = 0.14 + Math.sin(t * 0.71) * 0.050;

      vertHalo2.rotation.z = -t * 0.038;
      vertHalo2.material.opacity = 0.08 + Math.sin(t * 0.58) * 0.032;

      // ── Beam glow pulses ────────────────────
      beamParts.beamGlow.material.opacity  = 0.30 + Math.sin(t * 0.86) * 0.068;
      beamParts.beamGlow2.material.opacity = 0.18 + Math.sin(t * 1.08) * 0.042;

      // ── Base glow pulses ────────────────────
      glowLine1.material.opacity = 0.26 + Math.sin(t * 0.68) * 0.050;
      glowLine2.material.opacity = 0.18 + Math.sin(t * 0.82) * 0.036;

      // ── Arcs pulses ─────────────────────────
      arcs.verdictArc.material.opacity  = 0.26 + Math.sin(t * 0.80) * 0.058;
      arcs.verdictArc2.material.opacity = 0.16 + Math.sin(t * 0.94) * 0.040;
      arcs.topArc.material.opacity      = 0.22 + Math.sin(t * 0.76) * 0.048;
      arcs.topArc2.material.opacity     = 0.14 + Math.sin(t * 0.88) * 0.034;

      // ── Glass panels sway ───────────────────
      glassPanels.rearGlass.rotation.z  = 0.042  + Math.sin(t * 0.172) * 0.013;
      glassPanels.sideGlass.rotation.y  = -0.700 + Math.sin(t * 0.198) * 0.016;
      glassPanels.lowerGlass.rotation.z = 0.060  + Math.sin(t * 0.215) * 0.010;

      // ── Floating spheres bobbing ────────────
      floatingSpheres.forEach(({ mesh, baseY, phase }) => {
        mesh.position.y = baseY + Math.sin(t * 0.50 + phase) * 0.092;
        mesh.material.opacity = 0.20 + Math.sin(t * 0.72 + phase) * 0.100;
      });

      // ── Particles drift upward ──────────────
      for (let i = 0; i < posAttr.count; i++) {
        const speed = 0.038 + (i % 7) * 0.012;
        posAttr.setY(i, posAttr.getY(i) + dt * speed);
        if (posAttr.getY(i) > 4.2) {
          posAttr.setY(i, -4.2);
        }
      }
      posAttr.needsUpdate = true;
      particles.material.opacity = 0.26 + Math.sin(t * 0.40) * 0.064;

      // ── Dynamic gold light ──────────────────
      goldLight.intensity  = 2.15 + Math.sin(t * 1.08) * 0.20;
      goldLight.position.x = 2.5  + Math.sin(t * 0.31) * 0.24;
      goldLight.position.y = 0.9  + Math.sin(t * 0.43) * 0.16;

      // ── Spot light gentle sweep ─────────────
      beamSpot.position.x = 0.2 + Math.sin(t * 0.24) * 0.30;
      beamSpot.intensity  = 1.42 + Math.sin(t * 0.67) * 0.14;

      // ── Fulcrum glow breathe ────────────────
      fulcrumGlow.material.opacity = 0.22 + Math.sin(t * 0.95) * 0.06;
      fulcrumRing2.material.opacity = 0.28 + Math.sin(t * 0.78) * 0.08;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    // ────────────────────────────────────────
    //  CLEANUP
    // ────────────────────────────────────────
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      if (envMap) envMap.dispose();
      renderer.dispose();
    };
  }, [mode]);

  return (
    <canvas
      className={`hlHero3D hlHero3D--${mode}`}
      ref={canvasRef}
      aria-hidden="true"
    />
  );
}