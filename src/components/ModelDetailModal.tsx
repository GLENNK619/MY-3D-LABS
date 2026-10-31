import React, { useState } from 'react';
import { Model3D, ModelFormat } from '../types';
import { useAuth } from '../context/AuthContext';
import { ModelViewer3D } from './ModelViewer3D';
import { RatingReviewSection } from './RatingReviewSection';
import { exportAndDownloadModel } from '../services/exportService';
import { buildProceduralModel } from '../services/proceduralModels';
import { 
  X, Download, Heart, Share2, Box, Eye, CheckCircle2, 
  ExternalLink, Printer, Shield, Sparkles, Star, Bookmark 
} from 'lucide-react';

interface ModelDetailModalProps {
  model: Model3D | null;
  onClose: () => void;
  onOpenCreatorProfile: (username: string) => void;
}

export const ModelDetailModal: React.FC<ModelDetailModalProps> = ({
  model,
  onClose,
  onOpenCreatorProfile,
}) => {
  const { user, recordDownload, toggleLike, openBookmarkModal, getCollectionsForModel } = useAuth();
  const [downloadSuccessFormat, setDownloadSuccessFormat] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!model) return null;

  const isLiked = user?.likedModelIds.includes(model.id) || false;
  const savedCollections = getCollectionsForModel(model.id);

  const handleDownload = (format: ModelFormat) => {
    // 1. Check account authorization & record download in history
    const allowed = recordDownload(model, format);
    if (!allowed) return;

    // 2. Perform real 3D geometry export using Three.js Exporters
    try {
      const generated = buildProceduralModel(model.generatorKey);
      exportAndDownloadModel(generated.group, model, format);
      setDownloadSuccessFormat(format);
      setTimeout(() => setDownloadSuccessFormat(null), 3500);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
              {model.category}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400 font-mono">{model.fileSize}</span>
            <span className="text-xs text-slate-400">·</span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{model.rating.toFixed(1)}</span>
              <span className="text-slate-500">({model.reviewsCount})</span>
            </div>
            {savedCollections.length > 0 && (
              <>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                  Saved in {savedCollections.map(c => c.name).join(', ')}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openBookmarkModal(model)}
              title="Bookmark to Collection (e.g. Project Ideas, Print Queue)"
              className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium ${
                savedCollections.length > 0
                  ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60'
                  : 'text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border-slate-700/80'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${savedCollections.length > 0 ? 'fill-cyan-400' : ''}`} />
              <span className="hidden sm:inline">
                {savedCollections.length > 0 ? 'Bookmarked' : 'Add to Collection'}
              </span>
            </button>
            <button
              onClick={handleShare}
              title="Copy Model Share Link"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleLike(model.id)}
              title={isLiked ? 'Unlike' : 'Add to Favorites'}
              className={`p-2 rounded-lg transition-colors ${
                isLiked
                  ? 'text-rose-400 bg-rose-950/50 border border-rose-800/50'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {copiedLink && (
          <div className="bg-cyan-500 text-slate-950 px-4 py-1.5 text-xs font-semibold text-center">
            Link copied to clipboard!
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Top Split: 3D Viewport & Action Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Interactive 3D Canvas */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <ModelViewer3D
                generatorKey={model.generatorKey}
                heightClass="h-[360px] sm:h-[420px]"
                interactive={true}
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
                <span>Left Click: Rotate · Right Click: Pan · Scroll: Zoom</span>
                <span>Real-Time PBR WebGL</span>
              </div>
            </div>

            {/* Right 5 Cols: Specifications & Download Engine */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{model.title}</h1>

                {/* Creator Attribution */}
                <div 
                  onClick={() => onOpenCreatorProfile(model.creator.username)}
                  className="flex items-center gap-3 mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-colors"
                >
                  <img
                    src={model.creator.avatar}
                    alt={model.creator.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">{model.creator.name}</span>
                      {model.creator.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400">@{model.creator.username}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 ml-auto" />
                </div>

                <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                  {model.description}
                </p>

                {/* Technical Specifications Matrix */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Triangles</span>
                    <span className="text-slate-200 font-semibold">{model.polycount.faces.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Vertices</span>
                    <span className="text-slate-200 font-semibold">{model.polycount.vertices.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">License</span>
                    <span className="text-slate-200 font-semibold truncate block" title={model.license}>
                      {model.license.split(' ')[0]}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Total Downloads</span>
                    <span className="text-slate-200 font-semibold">{model.downloads.toLocaleString()}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs text-slate-400">
                  {model.tags.map((tag) => (
                    <span key={tag} className="text-[11px] text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Free Download Zone */}
              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-cyan-400" />
                    Free 3D Download
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Free for Community</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {model.formats.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleDownload(fmt)}
                      className="px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 border border-slate-700/80 rounded-lg transition-colors flex flex-col items-center justify-center gap-0.5"
                    >
                      <span>.{fmt}</span>
                      <span className="text-[10px] opacity-75 font-normal">Ready</span>
                    </button>
                  ))}
                </div>

                {downloadSuccessFormat && (
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 justify-center py-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Exported .{downloadSuccessFormat} successfully to your device!
                  </div>
                )}

                {!user && (
                  <p className="text-[11px] text-amber-400/90 text-center">
                    * Account registration required to download 3D models.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3D Printing & Manufacturing Specs Bar */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">3D Printing Readiness Check</h4>
                <p className="text-[11px] text-slate-400">
                  Watertight manifold mesh · Recommended Slicer: Bambu Studio / Cura · Infill: 15–20%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              {model.dimensions && (
                <span>
                  Bounds: {model.dimensions.x} × {model.dimensions.y} × {model.dimensions.z} cm
                </span>
              )}
              <span className="text-emerald-400 flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5" /> Manifold Validated
              </span>
            </div>
          </div>

          {/* External 3D Ecosystem Integrations */}
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                Compatible 3D Software & Ecosystem
              </span>
              <span className="text-[11px] text-slate-500">Free open interoperability</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <a
                href="https://www.blender.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 transition-colors flex items-center gap-1.5"
              >
                Blender (Import OBJ/GLTF) <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://sketchfab.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 transition-colors flex items-center gap-1.5"
              >
                Sketchfab 3D Viewers <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://makerworld.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 transition-colors flex items-center gap-1.5"
              >
                Bambu MakerWorld (Slice) <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://www.printables.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 transition-colors flex items-center gap-1.5"
              >
                Printables (Prusa) <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://www.thingiverse.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 transition-colors flex items-center gap-1.5"
              >
                Thingiverse <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <RatingReviewSection model={model} />
        </div>
      </div>
    </div>
  );
};
