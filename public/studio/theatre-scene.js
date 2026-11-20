import * as THREE from './vendor/three.module.js';

const COLORS = {
  ink: 0x0f1433, green: 0x313827, red: 0x844936,
  wood: 0x270b03, tan: 0xa58b73, gold: 0xc3b094, ivory: 0xf6f0e6,
};
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
function ease(value) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}
function phase(time, start, end) { return ease((time - start) / (end - start)); }

function surface(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: .92, metalness: 0, ...options });
}
function outlined(geometry, material, parent, position = [0, 0, 0], edge = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (edge) {
    const lines = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 30),
      new THREE.LineBasicMaterial({ color: COLORS.ink, transparent: true, opacity: .85 }),
    );
    mesh.add(lines);
  }
  parent.add(mesh);
  return mesh;
}
function box(parent, material, size, position, edge = true) {
  return outlined(new THREE.BoxGeometry(...size), material, parent, position, edge);
}
function rod(parent, material, start, end, radius = .05) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const mesh = outlined(new THREE.CylinderGeometry(radius * .85, radius, a.distanceTo(b), 7), material, parent, a.clone().add(b).multiplyScalar(.5).toArray());
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
  return mesh;
}

function floorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const context = canvas.getContext('2d');
  context.fillStyle = '#543827';
  context.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024; y += 128) {
    context.strokeStyle = '#201c20';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(1024, y);
    context.stroke();
    for (let x = 0; x < 1024; x += 256) {
      const shift = y % 256 === 0 ? 0 : 120;
      context.beginPath();
      context.moveTo(x + shift, y);
      context.lineTo(x + shift, y + 128);
      context.stroke();
    }
  }
  let seed = 52;
  for (let i = 0; i < 1400; i++) {
    seed = (seed * 16807) % 2147483647;
    const x = seed % 1024;
    seed = (seed * 16807) % 2147483647;
    const y = seed % 1024;
    context.strokeStyle = i % 2 ? '#ad88632b' : '#10152635';
    context.lineWidth = .7;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(x + 30, y + 3, x + 70, y - 1);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(9, 6);
  return texture;
}

function buildTheatre(scene, frameTexture, chairTexture, rugTexture) {
  const theatre = new THREE.Group();
  scene.add(theatre);
  const floor = outlined(new THREE.PlaneGeometry(30, 20), surface(0xffffff, { map: floorTexture() }), theatre, [0, -.02, 0], false);
  floor.rotation.x = -Math.PI / 2;
  floor.castShadow = false;
  const backdrop = box(theatre, surface(0x10192d), [22, 11, .1], [0, 4, -5.3], false);
  backdrop.castShadow = false;
  const frameHeight = 12 / (frameTexture.image.width / frameTexture.image.height);
  const frame = new THREE.Group();
  theatre.add(frame);
  const frameParts = [];
  for (let index = 0; index < 3; index++) {
    const tile = frameTexture.clone();
    tile.repeat.set(1 / 3, 1);
    tile.offset.set(index / 3, 0);
    tile.needsUpdate = true;
    const piece = sprite(tile, 4, frameHeight, frame, [-4 + index * 4, frameHeight * .39, .15]);
    piece.material.emissive = new THREE.Color(0xffffff);
    piece.material.emissiveMap = tile;
    piece.material.emissiveIntensity = .16;
    piece.castShadow = false;
    frameParts.push(piece);
  }
  const chair = new THREE.Group();
  chair.position.set(1.2, .03, -1.5);
  theatre.add(chair);
  const chairHeight = 3.8;
  const chairWidth = chairHeight * chairTexture.image.width / chairTexture.image.height;
  const chairArt = sprite(chairTexture, chairWidth, chairHeight, chair, [0, 1.6, 0]);
  chairArt.material.emissive = new THREE.Color(0xffffff);
  chairArt.material.emissiveMap = chairTexture;
  chairArt.material.emissiveIntensity = .28;
  rugTexture.colorSpace = THREE.SRGBColorSpace;
  const rug = outlined(new THREE.PlaneGeometry(5.5, 3.7), surface(0xffffff, { map: rugTexture }), theatre, [1.2, .012, -.7], false);
  rug.rotation.x = -Math.PI / 2;
  rug.castShadow = false;
  return { theatre, frame, frameParts, frameHeight, chair, rug };
}

function makeGlow() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#fff9eaff');
  gradient.addColorStop(.15, '#fff4d5ed');
  gradient.addColorStop(.35, '#ffdb9488');
  gradient.addColorStop(1, '#e5b66d00');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function flame(parent) {
  const group = new THREE.Group();
  parent.add(group);
  const points = [
    new THREE.Vector2(0, 0), new THREE.Vector2(.09, .05),
    new THREE.Vector2(.115, .14), new THREE.Vector2(.08, .24),
    new THREE.Vector2(.035, .34), new THREE.Vector2(0, .46),
  ];
  const outer = new THREE.Mesh(new THREE.LatheGeometry(points, 12), new THREE.MeshBasicMaterial({ color: 0xffa346 }));
  const inner = new THREE.Mesh(new THREE.LatheGeometry(points.map((point) => new THREE.Vector2(point.x * .55, point.y * .72)), 12), new THREE.MeshBasicMaterial({ color: 0xfff2ba }));
  group.add(outer, inner);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.position.y = .15;
  glow.scale.set(.9, .9, 1);
  group.add(glow);
  return group;
}
function torch(parent) {
  const group = new THREE.Group();
  parent.add(group);
  const bronze = surface(COLORS.gold);
  rod(group, surface(0x62432b), [0, -.18, 0], [0, .48, 0], .045);
  outlined(new THREE.CylinderGeometry(.14, .055, .17, 9), bronze, group, [0, .5, 0]);
  for (const y of [.21, .28, .39]) {
    outlined(new THREE.TorusGeometry(.054, .009, 5, 16), bronze, group, [0, y, 0], false).rotation.x = Math.PI / 2;
  }
  const fire = flame(group);
  fire.position.y = .58;
  const tip = new THREE.Object3D();
  tip.position.y = .73;
  group.add(tip);
  const light = new THREE.PointLight(0xffcc88, 8, 5, 2);
  light.position.y = .73;
  group.add(light);
  return { group, fire, tip, light };
}

function makeLight(scene) {
  const source = new THREE.Group();
  scene.add(source);
  const fire = flame(source);
  fire.position.y = -.15;
  const point = new THREE.PointLight(0xffd695, 12, 5, 2);
  source.add(point);
  const spot = new THREE.SpotLight(0xffdfad, 0, 28, .48, .65, 1.6);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -.0004;
  spot.shadow.normalBias = .035;
  scene.add(spot);
  scene.add(spot.target);
  const coneMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { strength: { value: 0 }, tint: { value: new THREE.Color(0xffdda8) } },
    vertexShader: 'varying vec2 vUv; varying vec3 vNormal; varying vec3 vView; void main(){ vUv=uv; vec4 p=modelViewMatrix*vec4(position,1.); vNormal=normalize(normalMatrix*normal); vView=normalize(-p.xyz); gl_Position=projectionMatrix*p; }',
    fragmentShader: 'uniform float strength; uniform vec3 tint; varying vec2 vUv; varying vec3 vNormal; varying vec3 vView; void main(){ float edge=pow(abs(dot(normalize(vNormal),normalize(vView))),.65); float ray=pow(vUv.y,.5); float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453); gl_FragColor=vec4(tint, strength*edge*ray*(.85+.15*grain)); }',
  });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(2.2, 6.2, 48, 1, true).translate(0, -3.1, 0), coneMaterial);
  scene.add(cone);
  return { source, point, spot, cone, fire };
}

function sprite(texture, width, height, parent, position) {
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = surface(0xffffff, { map: texture, transparent: true, alphaTest: .15, side: THREE.DoubleSide });
  return outlined(new THREE.PlaneGeometry(width, height), material, parent, position, false);
}

function leg(parent, x, z, hind) {
  const hip = new THREE.Group();
  hip.position.set(x, 2.44, z);
  parent.add(hip);
  const coat = surface(COLORS.tan);
  const knee = new THREE.Group();
  knee.position.y = -1.2;
  hip.add(knee);
  rod(hip, coat, [0, 0, 0], [0, -1.2, 0], .07);
  rod(knee, coat, [0, 0, 0], [0, -1.12, 0], .052);
  const hoof = box(knee, surface(COLORS.ink), [.14, .15, .2], [-.02, -1.15, 0]);
  return { hip, knee, hind, hoof };
}

function buildRider(scene, horseTexture, riderTexture) {
  const root = new THREE.Group();
  scene.add(root);
  root.position.set(-3.4, .03, 1.1);
  const body = sprite(horseTexture, 3.65, 2.43, root, [0, 3.05, 0]);
  const legs = [
    leg(root, -.57, -.18, false), leg(root, .42, -.18, true),
    leg(root, -.23, .18, false), leg(root, .77, .18, true),
  ];
  const person = new THREE.Group();
  person.position.set(.36, 3.1, .2);
  root.add(person);
  sprite(riderTexture, 1.12, 1.65, person, [0, .8, .07]);
  const boot = surface(0x805132);
  const cream = surface(COLORS.ivory);
  for (const z of [-.12, .3]) {
    rod(person, cream, [.05, .1, z], [-.6, -.32, z], .1);
    rod(person, boot, [-.6, -.32, z], [-.48, -1.27, z + .02], .09);
    box(person, boot, [.34, .16, .22], [-.6, -1.3, z + .04]);
  }
  const arm = new THREE.Group();
  arm.position.set(.24, 1.05, .22);
  person.add(arm);
  const sleeve = surface(COLORS.ink);
  const skin = surface(0xead4b4);
  rod(arm, sleeve, [0, 0, 0], [.52, 0, 0], .075);
  const elbow = new THREE.Group();
  elbow.position.set(.52, 0, 0);
  arm.add(elbow);
  rod(elbow, sleeve, [0, 0, 0], [.42, 0, 0], .065);
  rod(elbow, cream, [.4, 0, 0], [.46, 0, 0], .067);
  const hand = new THREE.Group();
  hand.position.set(.57, 0, 0);
  elbow.add(hand);
  const palm = outlined(new THREE.SphereGeometry(1, 10, 8), skin, hand, [0, 0, 0], false);
  palm.scale.set(.085, .1, .08);
  for (let i = 0; i < 4; i++) {
    const finger = outlined(new THREE.TorusGeometry(.052, .015, 5, 10, Math.PI * 1.4), skin, hand, [.035, -.05 + i * .035, .015], false);
    finger.rotation.x = Math.PI / 2;
  }
  const carriedTorch = torch(hand);
  carriedTorch.group.position.x = .035;
  const reinArm = new THREE.Group();
  reinArm.position.set(.18, .98, -.05);
  person.add(reinArm);
  rod(reinArm, sleeve, [0, 0, 0], [.28, -.33, 0], .09);
  rod(reinArm, skin, [.28, -.33, 0], [-.05, -.48, .05], .055);
  return { root, body, legs, person, arm, elbow, hand, carriedTorch };
}

export async function createTheatre(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x11182a);
  scene.fog = new THREE.FogExp2(0x11182a, .025);
  const ambient = new THREE.HemisphereLight(0xc3c9de, 0x46301f, 1.25);
  scene.add(ambient);
  const rim = new THREE.DirectionalLight(0xf2d6b0, 1.25);
  rim.position.set(-5, 7, 5);
  scene.add(rim);
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 80);
  const loader = new THREE.TextureLoader();
  const [horseTexture, riderTexture, frameTexture, chairTexture, rugTexture] = await Promise.all([
    loader.loadAsync('/studio/v4-assets/rig-horse-body.png'),
    loader.loadAsync('/studio/v4-assets/rig-rider-torso.png'),
    loader.loadAsync('/studio/v4-assets/scene-frame.png'),
    loader.loadAsync('/studio/v4-assets/scene-chair.png'),
    loader.loadAsync('/studio/v4-assets/scene-rug.png'),
  ]);
  const theatre = buildTheatre(scene, frameTexture, chairTexture, rugTexture);
  const lights = makeLight(scene);
  const rider = buildRider(scene, horseTexture, riderTexture);
  const finalSource = new THREE.Vector3(-.88, 4.88, -4.2);
  const target = new THREE.Vector3(1.2, 1.3, -1.5);
  const lightHolder = new THREE.Group();
  scene.add(lightHolder);
  const brass = surface(COLORS.gold);
  box(lightHolder, surface(0x593b28), [.35, .65, .08], [-.88, 4.3, -5.12]);
  const bracket = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.88, 4.08, -5.03),
    new THREE.Vector3(-.88, 4.05, -4.6),
    new THREE.Vector3(-.88, 4.28, -4.22),
    new THREE.Vector3(-.88, 4.58, -4.2),
  ]);
  outlined(new THREE.TubeGeometry(bracket, 18, .035, 7, false), brass, lightHolder, [0, 0, 0]);
  outlined(new THREE.CylinderGeometry(.16, .07, .17, 10), brass, lightHolder, [-.88, 4.65, -4.2]);
  let width = 0;
  let height = 0;
  let lastTime = 0;
  let pointerX = 0;
  let pointerY = 0;
  function resize() {
    const bounds = container.getBoundingClientRect();
    if (bounds.width === width && bounds.height === height) return;
    width = bounds.width;
    height = bounds.height;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }
  function render(time, resting = false) {
    resize();
    const assembly = phase(time, 4.8, 7.4);
    const carpetAssembly = phase(time, 4.7, 6.5);
    const chairAssembly = phase(time, 5.1, 7);
    theatre.frameParts.forEach((piece, index) => {
      const direction = index - 1;
      const arrival = phase(time, 4.8 + index * .18, 7.4 + index * .12);
      piece.position.x = -4 + index * 4 + direction * (1 - arrival) * 5.5;
      piece.position.y = theatre.frameHeight * .39 + (index === 1 ? 4.5 * (1 - arrival) : 0);
      piece.position.z = .15 + 8 * (1 - arrival);
      piece.scale.setScalar(1 + (1 - arrival) * .35);
      piece.rotation.y = direction * (1 - arrival) * .35;
      piece.material.opacity = arrival;
    });
    theatre.rug.position.set(1.2 + (1 - carpetAssembly) * 6, .012, -.7 - (1 - carpetAssembly) * 4);
    theatre.rug.rotation.z = (1 - carpetAssembly) * -.15;
    theatre.rug.material.opacity = carpetAssembly;
    theatre.rug.material.transparent = true;
    theatre.chair.position.set(1.2 + (1 - chairAssembly) * 5, .03 + (1 - chairAssembly) * .7, -1.5 - (1 - chairAssembly) * 3);
    theatre.chair.rotation.y = (1 - chairAssembly) * -.25;
    theatre.chair.children[0].material.opacity = chairAssembly;
    const approach = phase(time, .5, 3);
    const place = phase(time, 2.9, 4.4);
    const withdraw = phase(time, 5, 5.7);
    const depart = phase(time, 5.9, 8.2);
    const enter = resting ? 1 : phase(time, 8, 11);
    rider.root.position.x = mix(-3.4, -2.2, approach) - depart * 8;
    rider.root.position.z = mix(1.1, -3.7, approach) + depart * 4.8;
    const walking = time < 2.9 || (time > 5.9 && time < 8.3);
    const stride = walking ? .13 : .015;
    const gait = time * 7.5;
    rider.legs.forEach(({ hip, knee }, i) => {
      const swing = Math.sin(gait + [0, Math.PI, Math.PI, 0][i]);
      hip.rotation.z = swing * stride;
      knee.rotation.z = Math.max(0, -swing) * stride * 1.15;
    });
    rider.person.position.y = 3.1 + (walking ? Math.sin(gait * 2) * .025 : 0);
    // Two-bone inverse kinematics keeps the palm and light together during placement.
    const reach = place * (1 - withdraw);
    const handX = mix(.66, .95, reach);
    const handY = mix(-.25, 0, reach);
    const upperLength = .52;
    const foreLength = .57;
    const elbowAngle = Math.acos(clamp(
      (handX * handX + handY * handY - upperLength * upperLength - foreLength * foreLength)
      / (2 * upperLength * foreLength), -1, 1,
    ));
    rider.arm.rotation.y = reach * .9;
    rider.arm.rotation.z = Math.atan2(handY, handX)
      - Math.atan2(foreLength * Math.sin(elbowAngle), upperLength + foreLength * Math.cos(elbowAngle));
    rider.elbow.rotation.z = elbowAngle;
    rider.hand.rotation.z = -(rider.arm.rotation.z + elbowAngle);
    scene.updateMatrixWorld(true);
    const tilt = phase(time, 3.4, 4.4) * (1 - phase(time, 5.1, 5.8));
    rider.carriedTorch.group.rotation.z = -tilt * .3;
    rider.carriedTorch.fire.scale.set(1 + Math.sin(time * 19) * .025, 1 + Math.sin(time * 15) * .06, 1);
    const ignition = phase(time, 4.65, 5.15);
    lights.source.visible = resting || ignition > 0;
    lights.source.position.copy(finalSource);
    lights.source.scale.setScalar(resting ? 1 : ignition);
    lights.fire.scale.y = 1 + Math.sin(time * 13) * .05;
    lights.point.intensity = 4 * (resting ? 1 : ignition);
    lights.spot.position.copy(finalSource);
    lights.spot.target.position.copy(target);
    const illumination = phase(time, 4.65, 5.4);
    theatre.chair.children[0].material.emissiveIntensity = .12 + illumination * .22;
    lights.spot.intensity = 62 * illumination;
    lights.cone.position.copy(finalSource);
    lights.cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), target.clone().sub(finalSource).normalize());
    lights.cone.material.uniforms.strength.value = .19 * illumination;
    ambient.intensity = mix(1.25, .95, illumination);
    rider.root.visible = !resting && time < 8.5;
    if (resting) {
      lights.source.position.copy(finalSource);
      lights.spot.intensity = 62;
      lights.cone.material.uniforms.strength.value = .19;
    }
    const portrait = camera.aspect < 1.2;
    const reveal = phase(time, 0, 2.8);
    const start = new THREE.Vector3(-2.8, 3.15, mix(portrait ? 23 : 19, portrait ? 15.5 : 13, reveal));
    const end = new THREE.Vector3(1.3, 3.5, portrait ? 11.6 : 9.2);
    camera.position.copy(start).lerp(end, enter);
    camera.position.x += pointerX * .3 * assembly;
    camera.position.y += pointerY * .16 * assembly;
    camera.lookAt(new THREE.Vector3(-2.2, 2.65, .3).lerp(new THREE.Vector3(.6, 3.2, -1.5), enter));

    renderer.render(scene, camera);
    lastTime = time;
  }
  render(0);
  return {
    canvas: renderer.domElement,
    render,
    setPointer(x, y) { pointerX = x; pointerY = y; },
    moveTo(nextContainer) { nextContainer.append(renderer.domElement); container = nextContainer; width = 0; height = 0; render(lastTime, true); },
    dispose() {
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      [horseTexture, riderTexture, frameTexture, chairTexture, rugTexture].forEach((texture) => texture.dispose());
      renderer.dispose();
    },
  };
}
