/**
 * Tiered Systems · 3D WebGL Emblem & Orbital Architecture
 * Built with Three.js (PBR Metallic Materials, Dynamic Point Lighting & Gyro Parallax)
 */

(function () {
  const container = document.getElementById("emblem-3d-canvas");
  if (!container || !window.THREE) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);

  // Group to rotate with mouse/touch
  const emblemGroup = new THREE.Group();
  scene.add(emblemGroup);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Warm Solar Orange Core Point Light
  const coreLight = new THREE.PointLight(0xff7700, 3.5, 12, 1.2);
  coreLight.position.set(0, 0, 0);
  emblemGroup.add(coreLight);

  // Specular directional key light
  const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
  keyLight.position.set(5, 5, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xff6b00, 3.0);
  rimLight.position.set(-6, -4, -4);
  scene.add(rimLight);

  // Materials: High-end Brushed Golden-Bronze Metallic
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xdf8428,
    metalness: 0.92,
    roughness: 0.22,
    envMapIntensity: 1.5
  });

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xff5500,
    emissive: 0xff3300,
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.3
  });

  const glowWireMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });

  // 1. Central Core Sphere
  const coreGeo = new THREE.SphereGeometry(1.05, 32, 32);
  const coreMesh = new THREE.Mesh(coreGeo, coreMaterial);
  emblemGroup.add(coreMesh);

  // Subtle wireframe halo around core
  const haloGeo = new THREE.SphereGeometry(1.08, 16, 16);
  const haloMesh = new THREE.Mesh(haloGeo, glowWireMaterial);
  emblemGroup.add(haloMesh);

  // 2. The 4 Interlocking Orbital Rings (Representing Tier 01, 02, 03, 04)
  const rings = [];
  const ringConfigs = [
    { radius: 1.85, tube: 0.065, rot: [Math.PI / 4, Math.PI / 6, 0], speed: 0.008, tier: 1 },
    { radius: 2.15, tube: 0.055, rot: [-Math.PI / 3, Math.PI / 4, Math.PI / 8], speed: -0.006, tier: 2 },
    { radius: 2.45, tube: 0.05, rot: [Math.PI / 2.2, -Math.PI / 5, Math.PI / 3], speed: 0.005, tier: 3 },
    { radius: 2.75, tube: 0.045, rot: [-Math.PI / 6, -Math.PI / 2.5, 0], speed: -0.004, tier: 4 }
  ];

  ringConfigs.forEach(cfg => {
    const ringGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 24, 80);
    const ringMesh = new THREE.Mesh(ringGeo, goldMaterial.clone());
    ringMesh.rotation.set(...cfg.rot);
    emblemGroup.add(ringMesh);
    rings.push({ mesh: ringMesh, baseSpeed: cfg.speed, tier: cfg.tier });
  });

  // 3. Floating Ambient Particles (Embers / System Nodes)
  const particleCount = reduceMotion ? 20 : 65;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    const r = 2.5 + Math.random() * 3.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    particlePos[i] = r * Math.sin(phi) * Math.cos(theta);
    particlePos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
    particlePos[i + 2] = r * Math.cos(phi);
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffaa44,
    size: 0.065,
    transparent: true,
    opacity: 0.75
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  emblemGroup.add(particles);

  // Interactive Mouse / Touch Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let isHovered = false;

  function onPointerMove(e) {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      mouseX = (x / rect.width) * 2 - 1;
      mouseY = -(y / rect.height) * 2 + 1;
      targetRotationY = mouseX * 0.75;
      targetRotationX = -mouseY * 0.6;
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
    targetRotationY += dx * 0.008;
    targetRotationX += dy * 0.008;
    prevTouchX = e.touches[0].clientX;
    prevTouchY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", () => { isDragging = false; });

  // Responsiveness
  function onResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener("resize", onResize, { passive: true });

  // Pause rendering when off-screen for maximum performance
  let isVisible = true;
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(container);

  // Active Tier State Integration (highlights the corresponding ring when user clicks a tier tab!)
  window.set3DActiveTier = function (tierNum) {
    rings.forEach((r, idx) => {
      const match = r.tier === tierNum;
      if (match) {
        r.mesh.material.emissive.setHex(0xff6b00);
        r.mesh.material.emissiveIntensity = 0.8;
        r.mesh.scale.set(1.08, 1.08, 1.08);
      } else {
        r.mesh.material.emissive.setHex(0x000000);
        r.mesh.material.emissiveIntensity = 0;
        r.mesh.scale.set(1, 1, 1);
      }
    });
    coreLight.color.setHex(tierNum === 4 ? 0xff4400 : 0xff7700);
    coreLight.intensity = 4.2;
    setTimeout(() => { coreLight.intensity = 3.5; }, 400);
  };

  // Animation Loop with Spring Physics
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = clock.getDelta();

    // Constant smooth background rotation
    if (!reduceMotion) {
      emblemGroup.rotation.y += 0.004;
      rings.forEach(r => {
        r.mesh.rotation.z += r.baseSpeed * (isHovered ? 1.8 : 1);
      });
      particles.rotation.y -= 0.002;
    }

    // Spring interpolation toward mouse target
    emblemGroup.rotation.y += (targetRotationY - emblemGroup.rotation.y) * 0.06;
    emblemGroup.rotation.x += (targetRotationX - emblemGroup.rotation.x) * 0.06;

    renderer.render(scene, camera);
  }

  animate();
})();
