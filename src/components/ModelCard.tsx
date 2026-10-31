import React from 'react';
import { Model3D } from '../types';
import { useAuth } from '../context/AuthContext';
import { Star, Download, Heart, Box, CheckCircle2, Bookmark } from 'lucide-react';

interface ModelCardProps {
  model: Model3D;
  onOpenDetail: (model: Model3D) => void;
  onOpenCreator: (username: string) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onOpenDetail,
  onOpenCreator,
}) => {
  const { user, toggleLike, openBookmarkModal, isModelBookmarkedAnywhere } = useAuth();
  const isLiked = user?.likedModelIds.includes(model.id) || false;
  const isBookmarked = isModelBookmarkedAnywhere(model.id);

  return (
    <div className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-cyan-500/5">
      {/* 3D Visual Preview Thumbnail Container */}
      <div 
        onClick={() => onOpenDetail(model)}
        className="relative h-48 sm:h-52 bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden group/thumb"
      >
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Thematic Geometric Center Visual */}
        <div className="relative flex flex-col items-center justify-center p-6 text-center transform transition-transform duration-300 group-hover/thumb:scale-105">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-xl"
            style={{ 
              borderColor: `${model.previewColor || '#06b6d4'}40`,
              backgroundColor: `${model.previewColor || '#06b6d4'}12`,
              boxShadow: `0 0 30px ${model.previewColor || '#06b6d4'}20`
            }}
          >
            <Box 
              className="w-10 h-10 transition-colors" 
              style={{ color: model.previewColor || '#06b6d4' }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2.5 opacity-90">
            {model.polycount.faces.toLocaleString()} Triangles
          </span>
        </div>

        {/* Top Badges (Category & Featured) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-cyan-300 bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded backdrop-blur-sm">
            {model.category}
          </span>
          {model.featured && (
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded">
              Featured
            </span>
          )}
        </div>

        {/* Action Buttons (Bookmark to Collections & Favorite Like) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openBookmarkModal(model);
            }}
            className={`p-2 rounded-lg border backdrop-blur-sm transition-colors ${
              isBookmarked
                ? 'text-cyan-400 bg-cyan-950/80 border-cyan-800/80'
                : 'text-slate-400 hover:text-white bg-slate-900/80 border-slate-700/80'
            }`}
            title="Bookmark to Collection (e.g. Project Ideas, Print Queue)"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(model.id);
            }}
            className={`p-2 rounded-lg border backdrop-blur-sm transition-colors ${
              isLiked
                ? 'text-rose-400 bg-rose-950/80 border-rose-800/80'
                : 'text-slate-400 hover:text-white bg-slate-900/80 border-slate-700/80'
            }`}
            title="Save to Favorites"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

        {/* Quick Hover Overlay: "Click to Inspect 3D" */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 rounded-xl shadow-lg transform -translate-y-1 group-hover/thumb:translate-y-0 transition-transform">
            Launch 3D Viewport
          </span>
        </div>
      </div>

      {/* Card Info & Meta */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 
              onClick={() => onOpenDetail(model)}
              className="text-sm font-bold text-white hover:text-cyan-400 transition-colors cursor-pointer truncate"
              title={model.title}
            >
              {model.title}
            </h3>

            {/* Prominent Star Rating */}
            <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{model.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-500 font-normal">({model.reviewsCount})</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {model.description}
          </p>
        </div>

        {/* Creator Attribution & Unboxed Metadata */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            {/* Creator click */}
            <div 
              onClick={() => onOpenCreator(model.creator.username)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src={model.creator.avatar}
                alt={model.creator.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-medium text-slate-300 truncate max-w-[120px]">
                {model.creator.name}
              </span>
              {model.creator.verified && (
                <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
              )}
            </div>

            {/* Unboxed Metadata with · separator */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <span>{model.downloads.toLocaleString()} dl</span>
              <span>·</span>
              <span>{model.fileSize}</span>
            </div>
          </div>

          {/* Formats and Action */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              {model.formats.map((fmt) => (
                <span key={fmt} className="px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">
                  .{fmt}
                </span>
              ))}
            </div>

            <button
              onClick={() => onOpenDetail(model)}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 rounded-lg transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Free 3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
