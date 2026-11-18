/**
 * Tiered Systems · 3D Interactive 4-Tier Architecture & Event Emblem
 * Directly models the 4 progressive tiers of the CURSOR event:
 * Tier 01: Prepare (Foundation Slab)
 * Tier 02: Level Up (Execution Platform)
 * Tier 03: Discover (Orientation Stage)
 * Tier 04: Connect (Summit Platform + Official Golden Armillary Emblem)
 *
 * Background: Recreates the iconic matrix of rounded-rect tiles from the official event poster.
 */

(function () {
  const container = document.getElementById("emblem-3d-canvas");
  if (!container || !window.THREE) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 1.2, 7.8);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.appendChild(renderer.domElement);

  // Main group that responds to drag/tilt
  const rootGroup = new THREE.Group();
  // Slight isometric angle to clearly see the 4 stepped tiers
  rootGroup.rotation.x = 0.22;
  rootGroup.rotation.y = -0.35;
  scene.add(rootGroup);

  // Lighting Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  // Warm Solar Orange Core Light
  const coreLight = new THREE.PointLight(0xff7700, 4.0, 14, 1.4);
  coreLight.position.set(0, 1.55, 0);
  rootGroup.add(coreLight);

  // Specular key light for metallic reflections
  const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.5);
  keyLight.position.set(5, 7, 6);
  scene.add(keyLight);

  // Rim light in Solar Orange
  const rimLight = new THREE.DirectionalLight(0xff6b00, 3.2);
  rimLight.position.set(-6, -2, -4);
  scene.add(rimLight);

  // Materials
  const slabMaterial = new THREE.MeshStandardMaterial({
    color: 0x14161f,
    metalness: 0.88,
    roughness: 0.28
  });

  const goldMetallicMaterial = new THREE.MeshStandardMaterial({
    color: 0xdf8a28,
    metalness: 0.94,
    roughness: 0.18
  });

  const solarCoreMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6b00,
    emissive: 0xff4400,
    emissiveIntensity: 0.85,
    metalness: 0.5,
    roughness: 0.2
  });

  // Helper to create rounded rectangular shapes
  function createRoundedRectShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }

  // Helper to create a 3D isometric tiered platform slab
  function createPlatformMesh(w, d, h, r) {
    const shape = createRoundedRectShape(w, d, r);
    const extrudeSettings = {
      depth: h,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04
    };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Orient horizontally (XZ plane)
    geo.rotateX(Math.PI / 2);
    // Center vertically
    geo.center();
    return geo;
  }

  // 1. Build the Poster's Iconic Matrix Backdrop (Grid of rounded-rect dark tiles)
  const backdropGroup = new THREE.Group();
  backdropGroup.position.set(0, 0, -2.6);
  rootGroup.add(backdropGroup);

  const tileShape = createRoundedRectShape(1.15, 1.15, 0.2);
  const tileGeo = new THREE.ExtrudeGeometry(tileShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.02,
    bevelThickness: 0.02
  });
  tileGeo.center();

  const tileMaterial = new THREE.MeshStandardMaterial({
    color: 0x0c0d12,
    metalness: 0.7,
    roughness: 0.5
  });

  // 4 columns x 3 rows of tiles matching the poster
  for (let col = -1.5; col <= 1.5; col += 1.0) {
    for (let row = -1; row <= 1; row += 1.0) {
      const tileMesh = new THREE.Mesh(tileGeo, tileMaterial);
      tileMesh.position.set(col * 1.35, row * 1.35 + 0.1, 0);
      backdropGroup.add(tileMesh);
    }
  }

  // Warm backlight shining from behind the tiles
  const backSunLight = new THREE.PointLight(0xff6b00, 3.5, 9, 1.2);
  backSunLight.position.set(0, 0.2, -2.4);
  rootGroup.add(backSunLight);

  // 2. Build the 4 Physical Tiers of Tiered System
  const tiers = [];
  const tierConfigs = [
    {
      tier: 1,
      name: "Tier 01: Prepare",
      desc: "Resume & Git Proof",
      w: 3.4,
      d: 3.4,
      h: 0.22,
      r: 0.35,
      baseY: -1.35
    },
    {
      tier: 2,
      name: "Tier 02: Level Up",
      desc: "LinkedIn & Technical Pitch",
      w: 2.7,
      d: 2.7,
      h: 0.22,
      r: 0.3,
      baseY: -0.72
    },
    {
      tier: 3,
      name: "Tier 03: Discover",
      desc: "Industry Plenary & Pathways",
      w: 2.05,
      d: 2.05,
      h: 0.22,
      r: 0.25,
      baseY: -0.09
    },
    {
      tier: 4,
      name: "Tier 04: Connect",
      desc: "MOA Opportunity Board",
      w: 1.45,
      d: 1.45,
      h: 0.22,
      r: 0.2,
      baseY: 0.54
    }
  ];

  tierConfigs.forEach(cfg => {
    const tierGroup = new THREE.Group();
    tierGroup.position.set(0, cfg.baseY, 0);

    // Platform Slab
    const geo = createPlatformMesh(cfg.w, cfg.d, cfg.h, cfg.r);
    const mat = slabMaterial.clone();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { isTierPlatform: true, tier: cfg.tier };
    tierGroup.add(mesh);

    // Glowing Edge Accent Trim
    const edgeTrimGeo = new THREE.BoxGeometry(cfg.w + 0.04, 0.035, cfg.d + 0.04);
    const edgeTrimMat = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      emissive: 0xff5500,
      emissiveIntensity: cfg.tier === 1 ? 0.9 : 0.25,
      roughness: 0.2
    });
    const edgeTrim = new THREE.Mesh(edgeTrimGeo, edgeTrimMat);
    edgeTrim.position.y = cfg.h / 2 + 0.02;
    tierGroup.add(edgeTrim);

    // Corner Status Nodes
    const cornerOffset = (cfg.w / 2) - 0.15;
    const nodeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffaa33,
      emissive: 0xff6b00,
      emissiveIntensity: 0.7
    });
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([cx, cz]) => {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(cx * cornerOffset, cfg.h / 2 + 0.04, cz * cornerOffset);
      tierGroup.add(node);
    });

    rootGroup.add(tierGroup);

    tiers.push({
      tier: cfg.tier,
      name: cfg.name,
      group: tierGroup,
      baseY: cfg.baseY,
      currentY: cfg.baseY,
      targetY: cfg.baseY,
      slabMesh: mesh,
      edgeTrimMat: edgeTrimMat
    });
  });

  // 3. The Official Tiered System Golden Armillary Crest at the Summit
  // (Directly modeled from the official event poster: intersecting bronze-gold rings + glowing solar core)
  const crestGroup = new THREE.Group();
  crestGroup.position.set(0, 1.45, 0);
  rootGroup.add(crestGroup);

  // Outer Golden Ring
  const outerRingGeo = new THREE.TorusGeometry(0.72, 0.045, 20, 80);
  const outerRingMesh = new THREE.Mesh(outerRingGeo, goldMetallicMaterial);
  crestGroup.add(outerRingMesh);

  // Intersecting Diagonal Golden Rings (forming the 4-petal insignia from the poster)
  const diagRing1Geo = new THREE.TorusGeometry(0.68, 0.036, 18, 70);
  const diagRing1 = new THREE.Mesh(diagRing1Geo, goldMetallicMaterial);
  diagRing1.rotation.set(Math.PI / 3, Math.PI / 4, 0);
  crestGroup.add(diagRing1);

  const diagRing2Geo = new THREE.TorusGeometry(0.68, 0.036, 18, 70);
  const diagRing2 = new THREE.Mesh(diagRing2Geo, goldMetallicMaterial);
  diagRing2.rotation.set(-Math.PI / 3, -Math.PI / 4, 0);
  crestGroup.add(diagRing2);

  const equatorRingGeo = new THREE.TorusGeometry(0.66, 0.032, 16, 60);
  const equatorRing = new THREE.Mesh(equatorRingGeo, goldMetallicMaterial);
  equatorRing.rotation.x = Math.PI / 2;
  crestGroup.add(equatorRing);

  // Radiant Solar Core
  const coreGeo = new THREE.SphereGeometry(0.28, 32, 32);
  const coreMesh = new THREE.Mesh(coreGeo, solarCoreMaterial);
  crestGroup.add(coreMesh);

  // Ambient Ember Nodes
  const particleCount = reduceMotion ? 15 : 45;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i] = (Math.random() - 0.5) * 4.5;
    particlePos[i + 1] = (Math.random() - 0.5) * 3.5;
    particlePos[i + 2] = (Math.random() - 0.5) * 2.5;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffaa44,
    size: 0.05,
    transparent: true,
    opacity: 0.7
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  rootGroup.add(particles);

  // Raycasting for direct 3D platform clicks
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onPointerClick(event) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(rootGroup.children, true);

    for (let hit of intersects) {
      let cur = hit.object;
      while (cur && !cur.userData?.isTierPlatform && cur.parent !== rootGroup && cur.parent !== scene) {
        cur = cur.parent;
      }
      if (cur && cur.userData?.isTierPlatform) {
        window.set3DActiveTier(cur.userData.tier);
        // Sync with left buttons & roadmap tabs
        const btn = document.querySelector(`[data-stack-tier="${cur.userData.tier}"]`);
        if (btn) btn.click();
        break;
      }
    }
  }

  container.addEventListener("click", onPointerClick);

  // Active Tier State Manager (Elevates the selected physical 3D tier slab!)
  let activeTierNum = 1;
  const tierStatusLabel = document.getElementById("canvas-active-tier-label");

  window.set3DActiveTier = function (tierNum) {
    activeTierNum = tierNum;

    tiers.forEach(t => {
      const isActive = t.tier === tierNum;
      // Mechanically elevate the selected tier upward in 3D space
      t.targetY = isActive ? t.baseY + 0.42 : t.baseY;
      // Illuminate edge trim
      t.edgeTrimMat.emissiveIntensity = isActive ? 1.4 : 0.25;
      t.edgeTrimMat.color.setHex(isActive ? 0xff7700 : 0xaa4400);
      // Highlight slab
      t.slabMesh.material.color.setHex(isActive ? 0x222533 : 0x14161f);
    });

    // Intensify crest when Tier 4 (Connect) is active
    if (tierNum === 4) {
      coreLight.intensity = 5.5;
      crestGroup.scale.set(1.12, 1.12, 1.12);
    } else {
      coreLight.intensity = 4.0;
      crestGroup.scale.set(1.0, 1.0, 1.0);
    }

    if (tierStatusLabel) {
      const names = {
        1: "Tier 01: Prepare · Resume & Git Proof (Day 1 Zoom)",
        2: "Tier 02: Level Up · LinkedIn Architecture & Pitch (Day 1 Zoom)",
        3: "Tier 03: Discover · Industry Plenary & Pathways (Day 2 Amphitheater)",
        4: "Tier 04: Connect · Opportunity Board & Recruitment (Day 2 Amphitheater)"
      };
      tierStatusLabel.textContent = names[tierNum] || `Tier 0${tierNum}`;
    }
  };

  // Mouse & Touch Orbit Controls (Tactile Spring Physics)
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationY = -0.35;
  let targetRotationX = 0.22;
  let isHovered = false;

  function onPointerMove(e) {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      mouseX = (x / rect.width) * 2 - 1;
      mouseY = -(y / rect.height) * 2 + 1;
      targetRotationY = -0.35 + mouseX * 0.65;
      targetRotationX = 0.22 - mouseY * 0.45;
      isHovered = true;
    } else {
      isHovered = false;
    }
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });

  // Touch drag support
  let isDragging = false;
  let prevTouchX = 0;
  let prevTouchY = 0;

  container.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevTouchX = e.touches[0].clientX;
      prevTouchY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - prevTouchX;
    const dy = e.touches[0].clientY - prevTouchY;
    targetRotationY += dx * 0.007;
    targetRotationX += dy * 0.007;
    prevTouchX = e.touches[0].clientX;
    prevTouchY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", () => { isDragging = false; });

  // Viewport resize
  function onResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener("resize", onResize, { passive: true });

  // Intersection observer: sleep when scrolled off screen
  let isVisible = true;
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(container);

  // Initialize Tier 1 as active
  window.set3DActiveTier(1);

  // Render Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = clock.getDelta();

    // Subtle continuous spin of the official crest at the summit
    if (!reduceMotion) {
      crestGroup.rotation.y += 0.012;
      diagRing1.rotation.z += 0.006;
      diagRing2.rotation.z -= 0.006;
      particles.rotation.y += 0.002;
    }

    // Spring physics: smoothly elevate active tier slab and lower others
    tiers.forEach(t => {
      t.currentY += (t.targetY - t.currentY) * 0.12;
      t.group.position.y = t.currentY;
    });

    // Smooth inertia camera tracking toward mouse/touch target
    rootGroup.rotation.y += (targetRotationY - rootGroup.rotation.y) * 0.07;
    rootGroup.rotation.x += (targetRotationX - rootGroup.rotation.x) * 0.07;

    renderer.render(scene, camera);
  }

  animate();
})();
