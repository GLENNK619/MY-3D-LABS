import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildProceduralModel, GeneratedMeshGroup } from '../services/proceduralModels';
import { ViewportEnvironment, ViewportRenderMode } from '../types';
import { Camera, Eye, Layers, Maximize2, RotateCcw, Sparkles, Sun, ChevronDown, ChevronUp, Grid } from 'lucide-react';

interface ModelViewer3DProps {
  generatorKey: string;
  customConfig?: any;
  customModelData?: string;
  heightClass?: string;
  initialRenderMode?: ViewportRenderMode;
  onSnapshotTaken?: (dataUrl: string) => void;
  interactive?: boolean;
}

export const ModelViewer3D: React.FC<ModelViewer3DProps> = ({
  generatorKey,
  customConfig,
  heightClass = 'h-96 md:h-[500px]',
  initialRenderMode = 'solid',
  onSnapshotTaken,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const partsRef = useRef<THREE.Mesh[]>([]);
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());

  // Interactive UI State for Dock
  const [renderMode, setRenderMode] = useState<ViewportRenderMode>(initialRenderMode);
  const [environment, setEnvironment] = useState<ViewportEnvironment>('studio');
  const [explodedDistance, setExplodedDistance] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isSoftwareGlState, setIsSoftwareGlState] = useState<boolean>(false);

  // Grid and contact shadow refs
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software-WebGL Probe
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();
    setIsSoftwareGlState(isSoftwareGl);

    // 2. Renderer Setup
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 7.5);
    cameraRef.current = camera;

    // 4. Studio Environment Reflection via RoomEnvironment
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // RoomEnvironment fallback
    }

    // 5. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    dirLight.position.set(5, 12, 7);
    dirLight.castShadow = !isSoftwareGl;
    if (dirLight.shadow) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.8);
    rimLight.position.set(-6, 8, -6);
    scene.add(rimLight);

    // 6. Ground Grid & Contact Shadow Plane
    const grid = new THREE.GridHelper(14, 28, 0x06b6d4, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Soft circular shadow disc
    const shadowGeo = new THREE.CircleGeometry(2.8, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.005;
    scene.add(shadowDisc);

    // 7. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below floor
    controls.minDistance = 2.0;
    controls.maxDistance = 22.0;
    controls.target.set(0, 1.6, 0);
    controls.update();
    controlsRef.current = controls;

    // 8. Generate Procedural Model
    const modelResult: GeneratedMeshGroup = buildProceduralModel(generatorKey, customConfig);
    scene.add(modelResult.group);
    modelGroupRef.current = modelResult.group;
    partsRef.current = modelResult.parts;

    // Cache original materials
    modelResult.parts.forEach((mesh) => {
      originalMaterialsRef.current.set(mesh, mesh.material);
    });

    // Center camera on object bounding box
    const box = modelResult.boundingBox;
    const center = new THREE.Vector3();
    box.getCenter(center);
    controls.target.copy(center);
    controls.update();

    // 9. Animation Render Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (autoRotate && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += delta * 0.4;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // 10. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [generatorKey, customConfig]);

  // Handle Render Mode switches
  useEffect(() => {
    partsRef.current.forEach((mesh) => {
      const orig = originalMaterialsRef.current.get(mesh);
      if (!orig) return;

      if (renderMode === 'solid') {
        mesh.material = orig;
      } else if (renderMode === 'wireframe') {
        mesh.material = new THREE.MeshBasicMaterial({
          color: 0x06b6d4,
          wireframe: true,
        });
      } else if (renderMode === 'clay') {
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0xd8b4fe,
          roughness: 0.9,
          metalness: 0.05,
        });
      } else if (renderMode === 'normals') {
        mesh.material = new THREE.MeshNormalMaterial();
      } else if (renderMode === 'xray') {
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.4,
          wireframe: false,
        });
      }
    });
  }, [renderMode]);

  // Handle Exploded View separation
  useEffect(() => {
    partsRef.current.forEach((mesh) => {
      const base = mesh.userData.basePosition as THREE.Vector3;
      const explode = mesh.userData.explodeVector as THREE.Vector3;
      if (base && explode) {
        mesh.position.x = base.x + explode.x * explodedDistance * 1.5;
        mesh.position.y = base.y + explode.y * explodedDistance * 1.5;
        mesh.position.z = base.z + explode.z * explodedDistance * 1.5;
      }
    });
  }, [explodedDistance]);

  // Handle Environment changes
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current) return;
    const scene = sceneRef.current;
    const dir = dirLightRef.current;
    const hemi = hemiLightRef.current;

    if (environment === 'studio') {
      scene.background = new THREE.Color(0x0b1120);
      dir.color.setHex(0xfff7ed);
      dir.intensity = 2.4;
      hemi.color.setHex(0xffffff);
      hemi.groundColor.setHex(0x1e293b);
    } else if (environment === 'cyber') {
      scene.background = new THREE.Color(0x050510);
      dir.color.setHex(0x06b6d4);
      dir.intensity = 3.0;
      hemi.color.setHex(0xd946ef);
      hemi.groundColor.setHex(0x0284c7);
    } else if (environment === 'sunset') {
      scene.background = new THREE.Color(0x1c131a);
      dir.color.setHex(0xf97316);
      dir.intensity = 3.2;
      hemi.color.setHex(0xfbbf24);
      hemi.groundColor.setHex(0x431407);
    } else if (environment === 'deepspace') {
      scene.background = new THREE.Color(0x020408);
      dir.color.setHex(0xe0f2fe);
      dir.intensity = 2.0;
      hemi.color.setHex(0x38bdf8);
      hemi.groundColor.setHex(0x020617);
    } else if (environment === 'minimal') {
      scene.background = new THREE.Color(0xf8fafc);
      dir.color.setHex(0xffffff);
      dir.intensity = 2.0;
      hemi.color.setHex(0xffffff);
      hemi.groundColor.setHex(0xcbd5e1);
    }
  }, [environment]);

  // Toggle Grid
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current && modelGroupRef.current) {
      cameraRef.current.position.set(0, 3.5, 7.5);
      controlsRef.current.target.set(0, 1.6, 0);
      controlsRef.current.update();
      modelGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleTakeSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    if (onSnapshotTaken) {
      onSnapshotTaken(dataUrl);
    } else {
      // Download directly
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `my3dlabs_snapshot_${Date.now()}.png`;
      a.click();
    }
  };

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden rounded-xl border border-slate-800 bg-slate-950 select-none group`}>
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Utility HUD (Discreet, Top-Right & Top-Left) */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto">
        <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-sm">
          WebGL 2.0 · {isSoftwareGlState ? 'Software Safe' : 'Hardware Accel'}
        </span>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-auto">
        <button
          onClick={handleTakeSnapshot}
          title="Capture High-Res Snapshot (PNG)"
          className="p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          title="Reset Camera View"
          className="p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Collapsible Unified Bottom Control Dock (Three.js skill directive: zero viewport occlusion) */}
      {interactive && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl pointer-events-auto transition-transform duration-300">
          <div className="flex justify-center -mb-2">
            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="flex items-center gap-1 px-3 py-0.5 text-[11px] font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-t-md shadow-lg"
            >
              {isDockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Show Viewport Controls
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Zen Mode
                </>
              )}
            </button>
          </div>

          {!isDockCollapsed && (
            <div className="bg-slate-900/95 border border-slate-800/90 rounded-xl p-3 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              {/* Shading / Render Modes */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                {(['solid', 'wireframe', 'clay', 'normals', 'xray'] as ViewportRenderMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRenderMode(mode)}
                    className={`px-2 py-1 rounded capitalize font-medium transition-colors ${
                      renderMode === mode
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Exploded View Slider */}
              <div className="flex items-center gap-2 px-2 py-1 bg-slate-950/80 rounded-lg border border-slate-800">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">Explode:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={explodedDistance}
                  onChange={(e) => setExplodedDistance(parseFloat(e.target.value))}
                  className="w-20 accent-cyan-400 cursor-pointer"
                />
                <span className="font-mono text-[11px] text-slate-400 w-6">
                  {Math.round(explodedDistance * 100)}%
                </span>
              </div>

              {/* Lighting / Environment Presets */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                <Sun className="w-3.5 h-3.5 text-amber-400 ml-1 mr-0.5" />
                {(['studio', 'cyber', 'sunset', 'deepspace'] as ViewportEnvironment[]).map((env) => (
                  <button
                    key={env}
                    onClick={() => setEnvironment(env)}
                    className={`px-2 py-1 rounded capitalize font-medium transition-colors ${
                      environment === env
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>

              {/* Toggles: Auto Rotate & Grid */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-2.5 py-1 rounded font-medium border transition-colors ${
                    autoRotate
                      ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Spin
                </button>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  title="Toggle Grid Floor"
                  className={`p-1.5 rounded font-medium border transition-colors ${
                    showGrid
                      ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
