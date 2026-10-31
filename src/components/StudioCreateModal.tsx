import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Model3D, ModelCategory, ModelFormat } from '../types';
import { ModelViewer3D } from './ModelViewer3D';
import { 
  X, UploadCloud, Sliders, Box, Check, Sparkles, 
  Download, Layers, AlertCircle, FileText, CheckCircle2 
} from 'lucide-react';
import { exportAndDownloadModel } from '../services/exportService';
import { buildProceduralModel } from '../services/proceduralModels';

interface StudioCreateModalProps {
  onClose: () => void;
  onModelCreated: (model: Model3D) => void;
}

export const StudioCreateModal: React.FC<StudioCreateModalProps> = ({
  onClose,
  onModelCreated,
}) => {
  const { user, addUploadedModel, openAuthModal } = useAuth();

  const [mode, setMode] = useState<'generate' | 'upload'>('generate');

  // Generator Studio Parameters
  const [archetype, setArchetype] = useState<string>('aegis_mech');
  const [modelTitle, setModelTitle] = useState<string>('Neo Kinetic Prototype');
  const [modelDesc, setModelDesc] = useState<string>('Original 3D asset created in MY 3D LABS browser studio.');
  const [category, setCategory] = useState<ModelCategory>('Props');
  const [tagsInput, setTagsInput] = useState<string>('Original, 3DLab, Concept');
  const [license, setLicense] = useState<string>('CC-BY 4.0');
  const [accentColor, setAccentColor] = useState<string>('#06b6d4');
  const [complexity, setComplexity] = useState<number>(1.0);

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('4.2 MB');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishedSuccess, setPublishedSuccess] = useState<boolean>(false);

  // Quick Archetype Options
  const archetypes = [
    { key: 'aegis_mech', name: 'Orbital Recon Drone', cat: 'Characters' as ModelCategory },
    { key: 'cyber_katana', name: 'Muramasa Plasma Katana', cat: 'Props' as ModelCategory },
    { key: 'cyber_fox', name: 'Low-Poly Spirit Fox', cat: 'Characters' as ModelCategory },
    { key: 'quantum_core', name: 'Zero-Point Quantum Core', cat: 'Abstract' as ModelCategory },
    { key: 'art_deco_spire', name: 'Metropolis Spire Tower', cat: 'Environments' as ModelCategory },
    { key: 'voxel_castle', name: 'Bastion Keep Fortress', cat: 'Environments' as ModelCategory },
    { key: 'tourbillon_watch', name: 'Tourbillon Timepiece', cat: 'Props' as ModelCategory },
    { key: 'voronoi_vase', name: 'Parametric Voronoi Vase', cat: 'Abstract' as ModelCategory },
    { key: 'bionic_hand', name: 'Articulated Bionic Hand', cat: '3D Printing' as ModelCategory },
    { key: 'vtol_dropship', name: 'Tactical VTOL Dropship', cat: 'Vehicles & Mechs' as ModelCategory },
  ];

  const handleSelectArchetype = (arch: typeof archetypes[0]) => {
    setArchetype(arch.key);
    setModelTitle(`Custom ${arch.name}`);
    setCategory(arch.cat);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setModelTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      // Auto-assign archetype for preview
      setArchetype('quantum_core');
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('Please create an account or sign in to publish your 3D models to the community.');
      return;
    }

    setIsPublishing(true);

    const generated = buildProceduralModel(archetype, { color: accentColor, complexity });
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newModel: Model3D = {
      id: `model-user-${Date.now()}`,
      title: modelTitle.trim() || 'Untitled 3D Asset',
      description: modelDesc.trim() || 'Created with MY 3D LABS Studio.',
      category,
      tags: tags.length > 0 ? tags : ['3DLab', category],
      creator: {
        id: user.id,
        name: user.displayName,
        username: user.username,
        avatar: user.avatarUrl,
        verified: true,
        bio: user.bio,
      },
      polycount: {
        vertices: generated.vertices || 8400,
        faces: generated.triangles || 11200,
      },
      formats: ['GLTF', 'OBJ', 'STL'],
      license,
      fileSize: uploadedFileName ? uploadedFileSize : '8.4 MB',
      downloads: 0,
      likes: 1,
      views: 1,
      dateAdded: new Date().toISOString().split('T')[0],
      generatorKey: archetype,
      previewColor: accentColor,
      isUserUploaded: true,
      featured: false,
      rating: 5.0,
      reviewsCount: 0,
      dimensions: { x: 3.2, y: 4.0, z: 3.2 },
    };

    addUploadedModel(newModel);
    setIsPublishing(false);
    setPublishedSuccess(true);
    onModelCreated(newModel);

    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const handleDirectExport = (format: ModelFormat) => {
    const generated = buildProceduralModel(archetype, { color: accentColor, complexity });
    const mockModel: Model3D = {
      id: 'temp',
      title: modelTitle,
      description: '',
      category,
      tags: [],
      creator: { name: '', username: '', avatar: '', verified: false },
      polycount: { vertices: generated.vertices, faces: generated.triangles },
      formats: [format],
      license,
      fileSize: '5MB',
      downloads: 0,
      likes: 0,
      views: 0,
      dateAdded: '',
      generatorKey: archetype,
      rating: 5,
      reviewsCount: 0,
    };
    exportAndDownloadModel(generated.group, mockModel, format);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              MY 3D LABS · Creator Studio & Community Upload
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setMode('generate')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  mode === 'generate'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> 3D Studio Generator
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  mode === 'upload'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" /> Upload File (.OBJ/.STL/.GLTF)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Content Split */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Interactive 3D Viewport with Live Updates */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-400">Active Viewport Preview</span>
                <span>Orbit, Zoom, and Explode to inspect before publishing</span>
              </div>

              <ModelViewer3D
                generatorKey={archetype}
                customConfig={{ color: accentColor, complexity }}
                heightClass="h-[380px] sm:h-[430px]"
                interactive={true}
              />

              {/* Direct Export bar */}
              <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
                <span className="text-slate-300 font-medium">Export Current Mesh:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDirectExport('OBJ')}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-800 rounded font-mono font-medium transition-colors"
                  >
                    .OBJ
                  </button>
                  <button
                    onClick={() => handleDirectExport('STL')}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-800 rounded font-mono font-medium transition-colors"
                  >
                    .STL
                  </button>
                  <button
                    onClick={() => handleDirectExport('GLTF')}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-800 rounded font-mono font-medium transition-colors"
                  >
                    .GLTF
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Controls & Community Publishing Details */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <form onSubmit={handlePublish} className="space-y-4">
                {mode === 'generate' ? (
                  /* Mode 1: Generator Archetypes & Parametric Tweaks */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                        Choose Base 3D Archetype
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
                        {archetypes.map((arch) => (
                          <button
                            key={arch.key}
                            type="button"
                            onClick={() => handleSelectArchetype(arch)}
                            className={`p-2 rounded text-left text-xs transition-colors flex items-center justify-between ${
                              archetype === arch.key
                                ? 'bg-cyan-950/90 border border-cyan-500 text-cyan-300'
                                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate">{arch.name}</span>
                            {archetype === arch.key && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Emissive / Accent Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono text-slate-400">{accentColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Scale / Complexity ({complexity.toFixed(1)}x)
                        </label>
                        <input
                          type="range"
                          min="0.6"
                          max="1.6"
                          step="0.1"
                          value={complexity}
                          onChange={(e) => setComplexity(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer mt-2"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mode 2: Direct File Upload */
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Upload 3D Asset File
                    </label>
                    <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 transition-colors">
                      <UploadCloud className="w-8 h-8 text-cyan-400 mb-2" />
                      <span className="text-xs font-medium text-slate-200">
                        {uploadedFileName ? uploadedFileName : 'Click or drag 3D model here'}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1">
                        Supports .OBJ, .STL, .GLTF, .GLB (up to 50MB)
                      </span>
                      <input
                        type="file"
                        accept=".obj,.stl,.gltf,.glb"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {uploadedFileName && (
                      <div className="flex items-center justify-between p-2.5 bg-cyan-950/40 border border-cyan-800/40 rounded-lg text-xs text-cyan-300">
                        <span className="flex items-center gap-1.5 truncate">
                          <FileText className="w-4 h-4 shrink-0" /> {uploadedFileName}
                        </span>
                        <span className="font-mono text-[11px]">{uploadedFileSize}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Model Metadata Fields */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Model Title
                    </label>
                    <input
                      type="text"
                      required
                      value={modelTitle}
                      onChange={(e) => setModelTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ModelCategory)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Characters">Characters</option>
                        <option value="Environments">Environments</option>
                        <option value="Props">Props</option>
                        <option value="Abstract">Abstract</option>
                        <option value="Vehicles & Mechs">Vehicles & Mechs</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="3D Printing">3D Printing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Community License
                      </label>
                      <select
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="CC0 (Public Domain)">CC0 (Public Domain)</option>
                        <option value="CC-BY 4.0">CC-BY 4.0 (Attribution)</option>
                        <option value="CC-BY-SA 4.0">CC-BY-SA (ShareAlike)</option>
                        <option value="Editorial Use Only">Editorial Use Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. Mecha, Sci-Fi, Watertight, GameReady"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={modelDesc}
                      onChange={(e) => setModelDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Publish Button */}
                <div className="pt-2">
                  {publishedSuccess ? (
                    <div className="py-2.5 px-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-400 font-semibold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Model Published to MY 3D LABS Community!
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isPublishing}
                      className="w-full py-3 px-4 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {user ? 'Publish Model to Community' : 'Sign In & Publish Model'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
