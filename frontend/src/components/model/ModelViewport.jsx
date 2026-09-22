import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const FACING = {
  "+X": [1, 0, 0], "-X": [-1, 0, 0], "+Y": [0, 1, 0], "-Y": [0, -1, 0], "+Z": [0, 0, 1], "-Z": [0, 0, -1],
};

export const applyTransforms = (group, { facing, targetLength, mode }) => {
  group.quaternion.identity();
  group.scale.setScalar(1);
  group.position.set(0, 0, 0);
  group.updateMatrixWorld(true);

  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(...FACING[facing]), new THREE.Vector3(0, 0, 1));
  group.quaternion.copy(q);
  group.updateMatrixWorld(true);

  let box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z) || 1;
  group.scale.setScalar((mode === "Block" ? 1 : targetLength) / longest);
  group.updateMatrixWorld(true);

  box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  if (mode === "Weapon") group.position.set(-center.x, -center.y, -box.min.z);
  else group.position.set(-center.x, -center.y, -center.z);
  group.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());
};

const loadObject = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const done = (obj) => { URL.revokeObjectURL(url); resolve(obj); };
    if (/\.(glb|gltf)$/i.test(file.name)) new GLTFLoader().load(url, (g) => done(g.scene), undefined, reject);
    else new OBJLoader().load(url, done, undefined, reject);
  });

export const ModelViewport = forwardRef(({ file, textureFile, settings, onLoaded, onError }, ref) => {
  const mount = useRef(null);
  const s = useRef({});

  useEffect(() => {
    const el = mount.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
    camera.position.set(2.5, 2, 3);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("data-testid", "model-3d-canvas");
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(4, 6, 5);
    scene.add(sun);
    const helpers = new THREE.Group();
    helpers.add(new THREE.GridHelper(10, 10, 0xf59e0b, 0x2a364f), new THREE.AxesHelper(1.2));
    scene.add(helpers);
    const group = new THREE.Group();
    scene.add(group);

    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    let raf;
    const loop = () => { controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); };
    loop();
    s.current = { scene, camera, renderer, controls, group, helpers };
    return () => { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); el.removeChild(renderer.domElement); };
  }, []);

  useEffect(() => {
    const { group } = s.current;
    group.clear();
    if (!file) return;
    let cancelled = false;
    loadObject(file)
      .then((obj) => {
        if (cancelled) return;
        obj.traverse((m) => { if (m.isMesh) { m.material.side = THREE.DoubleSide; if (!m.material.map && !m.material.color) m.material.color = new THREE.Color(0x9ca3af); } });
        group.add(obj);
        s.current.raw = obj;
        const size = applyTransforms(group, settings);
        onLoaded?.(size);
        if (textureFile) applyTexture(textureFile);
      })
      .catch((e) => onError?.(e?.message || "Failed to load model"));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    const { group } = s.current;
    if (group?.children.length) onLoaded?.(applyTransforms(group, settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.facing, settings.targetLength, settings.mode]);

  const applyTexture = (tf) => {
    const url = URL.createObjectURL(tf);
    new THREE.TextureLoader().load(url, (tex) => {
      tex.flipY = !/\.(glb|gltf)$/i.test(file?.name || "");
      tex.colorSpace = THREE.SRGBColorSpace;
      s.current.group.traverse((m) => { if (m.isMesh) { m.material = new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, transparent: true }); } });
      URL.revokeObjectURL(url);
    });
  };
  useEffect(() => { if (textureFile && s.current.group?.children.length) applyTexture(textureFile); }, [textureFile]); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    snapshot: (px = 512) => {
      const { scene, camera, helpers, group } = s.current;
      if (!group.children.length) return null;
      helpers.visible = false;
      const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      r.setSize(px, px);
      r.setClearColor(0x000000, 0);
      const cam = camera.clone();
      cam.aspect = 1;
      cam.updateProjectionMatrix();
      r.render(scene, cam);
      const url = r.domElement.toDataURL("image/png");
      r.dispose();
      helpers.visible = true;
      return url;
    },
    resetCamera: () => { s.current.camera.position.set(2.5, 2, 3); s.current.controls.target.set(0, 0, 0); },
    lookFrom: (dir) => {
      const d = { front: [0, 0.4, 3.2], iso: [2.3, 2, 2.3], top: [0, 3.5, 0.01], side: [3.2, 0.4, 0] }[dir];
      s.current.camera.position.set(...d);
      s.current.controls.target.set(0, 0, 0);
    },
  }));

  return <div ref={mount} className="w-full h-full" />;
});
