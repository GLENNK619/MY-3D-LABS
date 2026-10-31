import * as THREE from 'three';

export interface GeneratedMeshGroup {
  group: THREE.Group;
  parts: THREE.Mesh[];
  boundingBox: THREE.Box3;
  triangles: number;
  vertices: number;
}

// Helper to count faces and vertices in an Object3D hierarchy
export function calculateGeometryStats(object: THREE.Object3D): { vertices: number; faces: number } {
  let vertices = 0;
  let faces = 0;

  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geo = child.geometry;
      if (geo.index) {
        faces += geo.index.count / 3;
      } else if (geo.attributes.position) {
        faces += geo.attributes.position.count / 3;
      }
      if (geo.attributes.position) {
        vertices += geo.attributes.position.count;
      }
    }
  });

  return { vertices: Math.round(vertices), faces: Math.round(faces) };
}

// Helper to attach explode offsets
function markPart(mesh: THREE.Mesh, offsetX: number, offsetY: number, offsetZ: number, parts: THREE.Mesh[]) {
  mesh.userData.basePosition = mesh.position.clone();
  mesh.userData.explodeVector = new THREE.Vector3(offsetX, offsetY, offsetZ);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parts.push(mesh);
  return mesh;
}

export function buildProceduralModel(generatorKey: string, customConfig?: any): GeneratedMeshGroup {
  const group = new THREE.Group();
  const parts: THREE.Mesh[] = [];

  switch (generatorKey) {
    case 'aegis_mech': {
      // 1. Central Spherical Core Chassis
      const coreGeo = new THREE.SphereGeometry(1.2, 32, 24);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.25,
      });
      const core = markPart(new THREE.Mesh(coreGeo, coreMat), 0, 0, 0, parts);
      core.position.set(0, 2.5, 0);
      group.add(core);

      // 2. Optical Eye Visor Ring
      const eyeRingGeo = new THREE.TorusGeometry(0.55, 0.12, 16, 32);
      const eyeRingMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.2,
      });
      const eyeRing = markPart(new THREE.Mesh(eyeRingGeo, eyeRingMat), 0, 0, 1.2, parts);
      eyeRing.position.set(0, 2.5, 1.05);
      group.add(eyeRing);

      // 3. Glowing Sensor Pupil
      const pupilGeo = new THREE.SphereGeometry(0.35, 24, 16);
      const pupilMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.5,
        roughness: 0.1,
      });
      const pupil = markPart(new THREE.Mesh(pupilGeo, pupilMat), 0, 0, 1.6, parts);
      pupil.position.set(0, 2.5, 1.1);
      group.add(pupil);

      // 4 & 5. Left & Right Heavy Aerodynamic Shoulder Armor
      const shoulderGeo = new THREE.BoxGeometry(0.6, 1.4, 1.8);
      const armorMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.7,
        roughness: 0.35,
      });
      const leftShoulder = markPart(new THREE.Mesh(shoulderGeo, armorMat), -1.8, 0.4, 0, parts);
      leftShoulder.position.set(-1.6, 2.6, 0);
      leftShoulder.rotation.z = 0.2;
      group.add(leftShoulder);

      const rightShoulder = markPart(new THREE.Mesh(shoulderGeo, armorMat.clone()), 1.8, 0.4, 0, parts);
      rightShoulder.position.set(1.6, 2.6, 0);
      rightShoulder.rotation.z = -0.2;
      group.add(rightShoulder);

      // 6 & 7. Left & Right Ducted Jet Thrusters
      const thrusterGeo = new THREE.CylinderGeometry(0.4, 0.55, 1.2, 24, 1, true);
      const thrusterMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.95,
        roughness: 0.15,
        side: THREE.DoubleSide,
      });
      const leftThruster = markPart(new THREE.Mesh(thrusterGeo, thrusterMat), -1.5, -1.2, -0.8, parts);
      leftThruster.position.set(-1.2, 1.6, -0.6);
      leftThruster.rotation.x = -0.3;
      group.add(leftThruster);

      const rightThruster = markPart(new THREE.Mesh(thrusterGeo, thrusterMat.clone()), 1.5, -1.2, -0.8, parts);
      rightThruster.position.set(1.2, 1.6, -0.6);
      rightThruster.rotation.x = -0.3;
      group.add(rightThruster);

      // 8 & 9. Thruster Glow Plasma Cores
      const glowGeo = new THREE.CylinderGeometry(0.25, 0.1, 0.6, 16);
      const glowMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 2.0,
        roughness: 0.2,
      });
      const leftGlow = markPart(new THREE.Mesh(glowGeo, glowMat), -1.5, -1.8, -1.2, parts);
      leftGlow.position.set(-1.2, 1.1, -0.75);
      leftGlow.rotation.x = -0.3;
      group.add(leftGlow);

      const rightGlow = markPart(new THREE.Mesh(glowGeo, glowMat.clone()), 1.5, -1.8, -1.2, parts);
      rightGlow.position.set(1.2, 1.1, -0.75);
      rightGlow.rotation.x = -0.3;
      group.add(rightGlow);

      // 10. Sensor Antenna Array
      const antGeo = new THREE.CylinderGeometry(0.04, 0.08, 1.4, 12);
      const antMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
      const antenna = markPart(new THREE.Mesh(antGeo, antMat), 0, 1.5, -0.4, parts);
      antenna.position.set(0.4, 3.8, -0.4);
      antenna.rotation.z = -0.25;
      group.add(antenna);

      // 11. Stabilizer Lower Fin
      const finGeo = new THREE.ConeGeometry(0.4, 1.1, 4);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });
      const lowerFin = markPart(new THREE.Mesh(finGeo, finMat), 0, -1.4, 0, parts);
      lowerFin.position.set(0, 1.0, 0);
      lowerFin.rotation.x = Math.PI;
      group.add(lowerFin);
      break;
    }

    case 'cyber_katana': {
      // 1. Blade Spine & Edge
      const bladeGeo = new THREE.BoxGeometry(0.08, 4.2, 0.35);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.98,
        roughness: 0.12,
      });
      const blade = markPart(new THREE.Mesh(bladeGeo, bladeMat), 0, 1.2, 0, parts);
      blade.position.set(0, 3.2, 0);
      blade.rotation.z = 0.04;
      group.add(blade);

      // 2. Emissive Plasma Cutting Edge Strip
      const edgeGeo = new THREE.BoxGeometry(0.02, 4.0, 0.06);
      const edgeMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 2.5,
      });
      const edge = markPart(new THREE.Mesh(edgeGeo, edgeMat), 0, 1.4, 0.25, parts);
      edge.position.set(0, 3.2, 0.18);
      edge.rotation.z = 0.04;
      group.add(edge);

      // 3. Tsuba (Guard)
      const tsubaGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.12, 8);
      const tsubaMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.3,
      });
      const tsuba = markPart(new THREE.Mesh(tsubaGeo, tsubaMat), 0, 0.5, 0, parts);
      tsuba.position.set(0, 1.05, 0);
      group.add(tsuba);

      // 4. Tsuka (Wrapped Hilt)
      const hiltGeo = new THREE.CylinderGeometry(0.18, 0.2, 1.8, 16);
      const hiltMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.3,
        roughness: 0.7,
      });
      const hilt = markPart(new THREE.Mesh(hiltGeo, hiltMat), 0, 0, 0, parts);
      hilt.position.set(0, 0.1, 0);
      group.add(hilt);

      // 5. Kashira (Pommel Cap)
      const pommelGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.25, 8);
      const pommelMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        metalness: 0.9,
        roughness: 0.2,
      });
      const pommel = markPart(new THREE.Mesh(pommelGeo, pommelMat), 0, -0.6, 0, parts);
      pommel.position.set(0, -0.9, 0);
      group.add(pommel);

      // 6. Magnetic Sheath Mount Ring
      const ringGeo = new THREE.TorusGeometry(0.24, 0.04, 8, 16);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
      const ring = markPart(new THREE.Mesh(ringGeo, ringMat), 0, 0.2, 0, parts);
      ring.position.set(0, 0.8, 0);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      break;
    }

    case 'cyber_fox': {
      // 1. Faceted Head
      const headGeo = new THREE.ConeGeometry(0.8, 1.4, 5);
      const foxMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        roughness: 0.45,
        metalness: 0.1,
        flatShading: true,
      });
      const head = markPart(new THREE.Mesh(headGeo, foxMat), 0, 0.8, 0.8, parts);
      head.position.set(0, 2.2, 0.8);
      head.rotation.x = -Math.PI / 2.3;
      group.add(head);

      // 2 & 3. Left & Right Triangular Ears
      const earGeo = new THREE.ConeGeometry(0.3, 0.9, 3);
      const earMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        flatShading: true,
      });
      const leftEar = markPart(new THREE.Mesh(earGeo, earMat), -0.5, 0.9, 0.2, parts);
      leftEar.position.set(-0.45, 2.8, 0.4);
      leftEar.rotation.z = 0.3;
      group.add(leftEar);

      const rightEar = markPart(new THREE.Mesh(earGeo, earMat.clone()), 0.5, 0.9, 0.2, parts);
      rightEar.position.set(0.45, 2.8, 0.4);
      rightEar.rotation.z = -0.3;
      group.add(rightEar);

      // 4. White Snout Tip
      const snoutGeo = new THREE.ConeGeometry(0.22, 0.5, 4);
      const snoutMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, flatShading: true });
      const snout = markPart(new THREE.Mesh(snoutGeo, snoutMat), 0, 0.5, 1.6, parts);
      snout.position.set(0, 2.0, 1.55);
      snout.rotation.x = -Math.PI / 2.3;
      group.add(snout);

      // 5. Stylized Faceted Torso
      const bodyGeo = new THREE.CylinderGeometry(0.65, 0.9, 1.8, 6);
      const body = markPart(new THREE.Mesh(bodyGeo, foxMat), 0, 0, 0, parts);
      body.position.set(0, 1.5, 0);
      body.rotation.x = 0.3;
      group.add(body);

      // 6. Fluffy Segmented Tail
      const tailGeo = new THREE.ConeGeometry(0.7, 2.0, 6);
      const tail = markPart(new THREE.Mesh(tailGeo, foxMat), 0, 0.4, -1.5, parts);
      tail.position.set(0, 1.6, -1.1);
      tail.rotation.x = -2.2;
      group.add(tail);

      // 7. White Tail Tip
      const tailTipGeo = new THREE.ConeGeometry(0.4, 0.8, 6);
      const tailTip = markPart(new THREE.Mesh(tailTipGeo, snoutMat), 0, 0.8, -2.4, parts);
      tailTip.position.set(0, 2.4, -1.8);
      tailTip.rotation.x = -2.2;
      group.add(tailTip);

      // 8 & 9. Front Paws
      const pawGeo = new THREE.CylinderGeometry(0.18, 0.15, 1.3, 5);
      const pawMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const frontLeft = markPart(new THREE.Mesh(pawGeo, pawMat), -0.6, -0.6, 0.5, parts);
      frontLeft.position.set(-0.4, 0.65, 0.4);
      group.add(frontLeft);

      const frontRight = markPart(new THREE.Mesh(pawGeo, pawMat), 0.6, -0.6, 0.5, parts);
      frontRight.position.set(0.4, 0.65, 0.4);
      group.add(frontRight);
      break;
    }

    case 'tourbillon_watch': {
      // 1. Main Watch Casing
      const caseGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.45, 48);
      const caseMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.92,
        roughness: 0.18,
      });
      const mainCase = markPart(new THREE.Mesh(caseGeo, caseMat), 0, 0, 0, parts);
      mainCase.position.set(0, 1.2, 0);
      mainCase.rotation.x = Math.PI / 2;
      group.add(mainCase);

      // 2. Sapphire Crystal Ring Bezel
      const bezelGeo = new THREE.TorusGeometry(1.85, 0.1, 16, 48);
      const bezelMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // Gold accent bezel
        metalness: 0.95,
        roughness: 0.12,
      });
      const bezel = markPart(new THREE.Mesh(bezelGeo, bezelMat), 0, 0, 0.6, parts);
      bezel.position.set(0, 1.2, 0.25);
      group.add(bezel);

      // 3. Dial Plate with Skeleton Cutout
      const dialGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.05, 36);
      const dialMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.7,
        roughness: 0.35,
      });
      const dial = markPart(new THREE.Mesh(dialGeo, dialMat), 0, 0, 0.3, parts);
      dial.position.set(0, 1.2, 0.15);
      dial.rotation.x = Math.PI / 2;
      group.add(dial);

      // 4. Tourbillon Rotating Balance Wheel Cage
      const cageGeo = new THREE.TorusGeometry(0.55, 0.06, 12, 24);
      const cageMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.1,
      });
      const cage = markPart(new THREE.Mesh(cageGeo, cageMat), 0, -0.6, 0.7, parts);
      cage.position.set(0, 0.8, 0.2);
      group.add(cage);

      // 5. Crown Winder
      const crownGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 24);
      const crown = markPart(new THREE.Mesh(crownGeo, bezelMat), 1.0, 0, 0, parts);
      crown.position.set(2.05, 1.2, 0);
      crown.rotation.z = Math.PI / 2;
      group.add(crown);

      // 6 & 7. Leather / Composite Strap Segments
      const strapGeo = new THREE.BoxGeometry(1.5, 2.2, 0.18);
      const strapMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        metalness: 0.1,
        roughness: 0.65,
      });
      const topStrap = markPart(new THREE.Mesh(strapGeo, strapMat), 0, 1.5, -0.2, parts);
      topStrap.position.set(0, 3.1, -0.05);
      group.add(topStrap);

      const btmStrap = markPart(new THREE.Mesh(strapGeo, strapMat), 0, -1.5, -0.2, parts);
      btmStrap.position.set(0, -0.7, -0.05);
      group.add(btmStrap);
      break;
    }

    case 'vtol_dropship': {
      // 1. Main Aerospace Fuselage
      const fuseGeo = new THREE.ConeGeometry(1.2, 4.5, 6);
      const fuseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.25,
      });
      const fuse = markPart(new THREE.Mesh(fuseGeo, fuseMat), 0, 0, 0, parts);
      fuse.position.set(0, 1.8, 0);
      fuse.rotation.x = Math.PI / 2;
      group.add(fuse);

      // 2. Cockpit Canopy Glass
      const glassGeo = new THREE.SphereGeometry(0.7, 16, 16, 0, Math.PI);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        roughness: 0.1,
        metalness: 0.3,
        transmission: 0.7,
        transparent: true,
        opacity: 0.85,
      });
      const glass = markPart(new THREE.Mesh(glassGeo, glassMat), 0, 0.8, 0.6, parts);
      glass.position.set(0, 2.2, 0.8);
      glass.rotation.x = -Math.PI / 2.5;
      group.add(glass);

      // 3. Main Swept Wings
      const wingGeo = new THREE.BoxGeometry(5.2, 0.15, 1.4);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.75,
        roughness: 0.3,
      });
      const wings = markPart(new THREE.Mesh(wingGeo, wingMat), 0, 0.6, -0.4, parts);
      wings.position.set(0, 1.9, -0.4);
      group.add(wings);

      // 4 & 5. Left & Right Rotatable Tilt-Rotors
      const podGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.8, 24);
      const podMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.85,
        roughness: 0.2,
      });
      const leftPod = markPart(new THREE.Mesh(podGeo, podMat), -1.8, 0.5, 0, parts);
      leftPod.position.set(-2.6, 1.9, -0.4);
      leftPod.rotation.x = 0.4;
      group.add(leftPod);

      const rightPod = markPart(new THREE.Mesh(podGeo, podMat), 1.8, 0.5, 0, parts);
      rightPod.position.set(2.6, 1.9, -0.4);
      rightPod.rotation.x = 0.4;
      group.add(rightPod);

      // 6 & 7. Dual Twin Tail Fins
      const finGeo = new THREE.BoxGeometry(0.12, 1.2, 0.9);
      const leftFin = markPart(new THREE.Mesh(finGeo, wingMat), -0.8, 0.8, -1.2, parts);
      leftFin.position.set(-0.7, 2.4, -1.8);
      leftFin.rotation.z = -0.3;
      group.add(leftFin);

      const rightFin = markPart(new THREE.Mesh(finGeo, wingMat), 0.8, 0.8, -1.2, parts);
      rightFin.position.set(0.7, 2.4, -1.8);
      rightFin.rotation.z = 0.3;
      group.add(rightFin);
      break;
    }

    case 'voxel_castle': {
      // 1. Central Keep
      const keepGeo = new THREE.BoxGeometry(2.0, 3.0, 2.0);
      const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.7,
        metalness: 0.05,
      });
      const keep = markPart(new THREE.Mesh(keepGeo, stoneMat), 0, 0, 0, parts);
      keep.position.set(0, 1.5, 0);
      group.add(keep);

      // 2. Keep Roof Spire
      const roofGeo = new THREE.ConeGeometry(1.6, 1.6, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 });
      const roof = markPart(new THREE.Mesh(roofGeo, roofMat), 0, 1.6, 0, parts);
      roof.position.set(0, 3.8, 0);
      roof.rotation.y = Math.PI / 4;
      group.add(roof);

      // 3–6. Corner Defense Towers
      const towerGeo = new THREE.CylinderGeometry(0.55, 0.55, 2.8, 12);
      const positions = [
        [-1.4, -1.4],
        [1.4, -1.4],
        [-1.4, 1.4],
        [1.4, 1.4],
      ];
      positions.forEach(([tx, tz], i) => {
        const tower = markPart(new THREE.Mesh(towerGeo, stoneMat), tx * 0.8, 0, tz * 0.8, parts);
        tower.position.set(tx, 1.4, tz);
        group.add(tower);

        const capGeo = new THREE.ConeGeometry(0.65, 0.9, 8);
        const cap = markPart(new THREE.Mesh(capGeo, roofMat), tx * 0.8, 1.0, tz * 0.8, parts);
        cap.position.set(tx, 3.2, tz);
        group.add(cap);
      });

      // 7. Gateway Arch
      const gateGeo = new THREE.BoxGeometry(0.9, 1.2, 0.4);
      const gateMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.8 });
      const gate = markPart(new THREE.Mesh(gateGeo, gateMat), 0, -0.4, 1.2, parts);
      gate.position.set(0, 0.6, 1.02);
      group.add(gate);
      break;
    }

    case 'bionic_hand': {
      // 1. Palm Base Frame
      const palmGeo = new THREE.BoxGeometry(1.6, 1.8, 0.6);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.85,
        roughness: 0.25,
      });
      const palm = markPart(new THREE.Mesh(palmGeo, frameMat), 0, 0, 0, parts);
      palm.position.set(0, 1.5, 0);
      group.add(palm);

      // 2. Wrist Connector Joint
      const wristGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.8, 24);
      const jointMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.15,
      });
      const wrist = markPart(new THREE.Mesh(wristGeo, jointMat), 0, -0.9, 0, parts);
      wrist.position.set(0, 0.4, 0);
      group.add(wrist);

      // 3-6. 4 Articulated Fingers
      const fingerOffsets = [-0.6, -0.2, 0.2, 0.6];
      fingerOffsets.forEach((fx) => {
        // Knuckle Joint
        const knuckleGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const knuckle = markPart(new THREE.Mesh(knuckleGeo, jointMat), fx * 0.5, 0.6, 0, parts);
        knuckle.position.set(fx, 2.45, 0);
        group.add(knuckle);

        // Proximal Phalanx
        const fGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.9, 12);
        const fingerMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          metalness: 0.7,
          roughness: 0.3,
        });
        const finger = markPart(new THREE.Mesh(fGeo, fingerMat), fx * 0.8, 1.2, 0, parts);
        finger.position.set(fx, 3.0, 0);
        group.add(finger);

        // Distal Phalanx
        const tipGeo = new THREE.ConeGeometry(0.14, 0.7, 12);
        const tip = markPart(new THREE.Mesh(tipGeo, jointMat), fx * 1.0, 1.8, 0, parts);
        tip.position.set(fx, 3.75, 0);
        group.add(tip);
      });

      // 7. Articulated Opposable Thumb
      const thumbJointGeo = new THREE.SphereGeometry(0.22, 12, 12);
      const thumbJoint = markPart(new THREE.Mesh(thumbJointGeo, jointMat), -1.1, 0, 0.3, parts);
      thumbJoint.position.set(-0.9, 1.2, 0.2);
      group.add(thumbJoint);

      const thumbGeo = new THREE.CylinderGeometry(0.16, 0.18, 1.0, 12);
      const thumb = markPart(new THREE.Mesh(thumbGeo, frameMat), -1.6, 0.5, 0.6, parts);
      thumb.position.set(-1.3, 1.7, 0.3);
      thumb.rotation.z = 0.7;
      group.add(thumb);
      break;
    }

    case 'art_deco_spire': {
      // 1. Lower Stepped Tier
      const tier1Geo = new THREE.BoxGeometry(2.4, 1.5, 2.4);
      const decoMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.5,
        roughness: 0.4,
      });
      const tier1 = markPart(new THREE.Mesh(tier1Geo, decoMat), 0, 0, 0, parts);
      tier1.position.set(0, 0.75, 0);
      group.add(tier1);

      // 2. Middle Stepped Tier
      const tier2Geo = new THREE.BoxGeometry(1.8, 1.6, 1.8);
      const tier2 = markPart(new THREE.Mesh(tier2Geo, decoMat), 0, 0.8, 0, parts);
      tier2.position.set(0, 2.3, 0);
      group.add(tier2);

      // 3. Upper Stepped Tier
      const tier3Geo = new THREE.BoxGeometry(1.2, 1.4, 1.2);
      const tier3 = markPart(new THREE.Mesh(tier3Geo, decoMat), 0, 1.6, 0, parts);
      tier3.position.set(0, 3.8, 0);
      group.add(tier3);

      // 4. Brass Sunburst Spire Needle
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.15,
      });
      const spireGeo = new THREE.ConeGeometry(0.5, 2.2, 8);
      const spire = markPart(new THREE.Mesh(spireGeo, brassMat), 0, 2.5, 0, parts);
      spire.position.set(0, 5.6, 0);
      group.add(spire);

      // 5. Crown Radiating Fins
      const finGeo = new THREE.BoxGeometry(2.6, 0.1, 0.1);
      const crownFin = markPart(new THREE.Mesh(finGeo, brassMat), 0, 1.4, 0, parts);
      crownFin.position.set(0, 3.1, 0);
      group.add(crownFin);
      break;
    }

    case 'quantum_core': {
      // 1. Glowing Crystal Core
      const coreGeo = new THREE.DodecahedronGeometry(0.9, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 2.2,
        roughness: 0.1,
        metalness: 0.2,
      });
      const crystal = markPart(new THREE.Mesh(coreGeo, coreMat), 0, 0, 0, parts);
      crystal.position.set(0, 2.2, 0);
      group.add(crystal);

      // 2. Inner Gyroscopic Ring
      const ring1Geo = new THREE.TorusGeometry(1.4, 0.08, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.15,
      });
      const ring1 = markPart(new THREE.Mesh(ring1Geo, ringMat), 0, 0.6, 0, parts);
      ring1.position.set(0, 2.2, 0);
      ring1.rotation.x = 0.8;
      group.add(ring1);

      // 3. Middle Gyroscopic Ring
      const ring2Geo = new THREE.TorusGeometry(1.8, 0.1, 16, 48);
      const ring2 = markPart(new THREE.Mesh(ring2Geo, ringMat), 0, -0.6, 0, parts);
      ring2.position.set(0, 2.2, 0);
      ring2.rotation.y = 0.8;
      group.add(ring2);

      // 4. Outer Stabilizing Frame
      const outerRingGeo = new THREE.TorusGeometry(2.2, 0.12, 16, 48);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.3,
      });
      const ring3 = markPart(new THREE.Mesh(outerRingGeo, frameMat), 0, 0, 1.0, parts);
      ring3.position.set(0, 2.2, 0);
      group.add(ring3);

      // 5. Pedestal Base
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.6, 0.5, 32);
      const base = markPart(new THREE.Mesh(baseGeo, frameMat), 0, -1.2, 0, parts);
      base.position.set(0, 0.25, 0);
      group.add(base);
      break;
    }

    case 'arcade_cabinet': {
      // 1. Main Cabinet Body
      const cabGeo = new THREE.BoxGeometry(1.6, 3.4, 1.4);
      const cabMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.5,
      });
      const cab = markPart(new THREE.Mesh(cabGeo, cabMat), 0, 0, 0, parts);
      cab.position.set(0, 1.7, 0);
      group.add(cab);

      // 2. Glowing Slanted Screen
      const screenGeo = new THREE.PlaneGeometry(1.2, 0.9);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0369a1,
        emissiveIntensity: 1.5,
      });
      const screen = markPart(new THREE.Mesh(screenGeo, screenMat), 0, 0.5, 0.6, parts);
      screen.position.set(0, 2.1, 0.71);
      screen.rotation.x = -0.25;
      group.add(screen);

      // 3. Control Panel Slant
      const panelGeo = new THREE.BoxGeometry(1.4, 0.15, 0.6);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
      const panel = markPart(new THREE.Mesh(panelGeo, panelMat), 0, 0, 0.8, parts);
      panel.position.set(0, 1.4, 0.85);
      panel.rotation.x = 0.2;
      group.add(panel);

      // 4. Joystick
      const joyStickGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
      const joyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
      const joystick = markPart(new THREE.Mesh(joyStickGeo, joyMat), -0.3, 0.4, 0.9, parts);
      joystick.position.set(-0.35, 1.6, 0.85);
      group.add(joystick);

      const ballGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const joyBall = markPart(new THREE.Mesh(ballGeo, joyMat), -0.3, 0.6, 0.9, parts);
      joyBall.position.set(-0.35, 1.8, 0.85);
      group.add(joyBall);

      // 5. Illuminated Marquee Banner
      const marqGeo = new THREE.BoxGeometry(1.4, 0.4, 0.2);
      const marqMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 2.0,
      });
      const marquee = markPart(new THREE.Mesh(marqGeo, marqMat), 0, 1.4, 0.4, parts);
      marquee.position.set(0, 3.2, 0.71);
      group.add(marquee);
      break;
    }

    case 'voronoi_vase': {
      // Procedural Parametric Spiraling Vase
      const vaseGroup = new THREE.Group();
      const points: THREE.Vector2[] = [];
      for (let deg = 0; deg <= 180; deg += 10) {
        const rad = (Math.PI / 180) * deg;
        const x = 0.8 + 0.45 * Math.sin(rad * 2.5) + 0.2 * Math.cos(rad);
        const y = (deg / 180) * 3.5;
        points.push(new THREE.Vector2(x, y));
      }
      const latheGeo = new THREE.LatheGeometry(points, 32);
      const vaseMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.15,
        metalness: 0.8,
        wireframe: false,
      });
      const vase = markPart(new THREE.Mesh(latheGeo, vaseMat), 0, 0, 0, parts);
      vase.position.set(0, 0, 0);
      group.add(vase);

      // Internal Core Glow / Accent Column
      const coreColGeo = new THREE.CylinderGeometry(0.3, 0.3, 3.2, 16);
      const coreColMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.8,
      });
      const coreCol = markPart(new THREE.Mesh(coreColGeo, coreColMat), 0, 1.2, 0, parts);
      coreCol.position.set(0, 1.7, 0);
      group.add(coreCol);
      break;
    }

    case 'custom_user':
    default: {
      // Dynamic user customizable generator or fallback
      const baseType = customConfig?.baseType || 'scifi_drone';
      const userColor = customConfig?.color ? parseInt(customConfig.color.replace('#', '0x'), 16) : 0x06b6d4;
      const complexity = customConfig?.complexity || 1.0;

      if (baseType === 'scifi_drone') {
        // Base drone core
        const bodyGeo = new THREE.SphereGeometry(1.0 * complexity, 24, 24);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.9,
          roughness: 0.2,
        });
        const body = markPart(new THREE.Mesh(bodyGeo, bodyMat), 0, 0, 0, parts);
        body.position.set(0, 2.0, 0);
        group.add(body);

        // Core eye
        const eyeGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 24);
        const eyeMat = new THREE.MeshStandardMaterial({
          color: userColor,
          emissive: userColor,
          emissiveIntensity: 2.0,
        });
        const eye = markPart(new THREE.Mesh(eyeGeo, eyeMat), 0, 0, 1.0, parts);
        eye.position.set(0, 2.0, 0.9);
        eye.rotation.x = Math.PI / 2;
        group.add(eye);

        // 4 Rotor Arms
        const armGeo = new THREE.BoxGeometry(0.18, 0.18, 2.8 * complexity);
        const arm1 = markPart(new THREE.Mesh(armGeo, bodyMat), 0, 0.4, 0, parts);
        arm1.position.set(0, 2.0, 0);
        arm1.rotation.y = Math.PI / 4;
        group.add(arm1);

        const arm2 = markPart(new THREE.Mesh(armGeo, bodyMat.clone()), 0, -0.4, 0, parts);
        arm2.position.set(0, 2.0, 0);
        arm2.rotation.y = -Math.PI / 4;
        group.add(arm2);

        // 4 Motor Rings
        const ringGeo = new THREE.TorusGeometry(0.4, 0.06, 12, 24);
        const ringMat = new THREE.MeshStandardMaterial({ color: userColor, metalness: 0.8 });
        const ringPositions = [
          [-1.0 * complexity, 1.0 * complexity],
          [1.0 * complexity, 1.0 * complexity],
          [-1.0 * complexity, -1.0 * complexity],
          [1.0 * complexity, -1.0 * complexity],
        ];
        ringPositions.forEach(([rx, rz]) => {
          const r = markPart(new THREE.Mesh(ringGeo, ringMat), rx * 0.6, 0.5, rz * 0.6, parts);
          r.position.set(rx, 2.1, rz);
          r.rotation.x = Math.PI / 2;
          group.add(r);
        });
      } else if (baseType === 'parametric_sculpture') {
        const geom = new THREE.TorusKnotGeometry(1.2 * complexity, 0.35, 64, 16, 2, 3);
        const mat = new THREE.MeshStandardMaterial({
          color: userColor,
          metalness: 0.85,
          roughness: 0.2,
        });
        const sculpture = markPart(new THREE.Mesh(geom, mat), 0, 0, 0, parts);
        sculpture.position.set(0, 2.0, 0);
        group.add(sculpture);

        // Pedestal
        const pedGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.4, 32);
        const pedMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
        const ped = markPart(new THREE.Mesh(pedGeo, pedMat), 0, -1.0, 0, parts);
        ped.position.set(0, 0.2, 0);
        group.add(ped);
      } else {
        // Generic crystal artifact
        const crystalGeo = new THREE.OctahedronGeometry(1.5 * complexity, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: userColor,
          metalness: 0.9,
          roughness: 0.15,
          wireframe: false,
        });
        const artifact = markPart(new THREE.Mesh(crystalGeo, mat), 0, 0, 0, parts);
        artifact.position.set(0, 2.2, 0);
        group.add(artifact);
      }
      break;
    }
  }

  // Ground pivot so bottom sits at y = 0
  const box = new THREE.Box3().setFromObject(group);
  const minY = box.min.y;
  group.position.y -= minY;

  // Recompute bounding box after grounding
  const finalBox = new THREE.Box3().setFromObject(group);
  const stats = calculateGeometryStats(group);

  return {
    group,
    parts,
    boundingBox: finalBox,
    triangles: stats.faces,
    vertices: stats.vertices,
  };
}
