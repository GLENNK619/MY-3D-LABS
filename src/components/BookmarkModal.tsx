import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Model3D, UserCollection } from '../types';
import { 
  X, Bookmark, FolderPlus, Check, Plus, Folder, Sparkles, Box 
} from 'lucide-react';

export const BookmarkModal: React.FC = () => {
  const { 
    user, 
    bookmarkModalModel, 
    closeBookmarkModal, 
    createCollection, 
    toggleBookmarkModel, 
    isModelInCollection 
  } = useAuth();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  if (!bookmarkModalModel || !user) return null;

  const collections = user.collections || [];

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    createCollection(newCollectionName.trim(), newCollectionDesc.trim(), bookmarkModalModel.id);
    setNewCollectionName('');
    setNewCollectionDesc('');
    setIsCreatingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 rounded-xl">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Save to Collections</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {bookmarkModalModel.title}
              </p>
            </div>
          </div>

          <button
            onClick={closeBookmarkModal}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collections List */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Folders ({collections.length})
            </span>
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Folder
            </button>
          </div>

          {/* Inline Create Folder Form */}
          {isCreatingNew && (
            <form 
              onSubmit={handleCreateAndAdd} 
              className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2.5"
            >
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                Create Custom Collection
              </h4>
              <input
                type="text"
                required
                placeholder="Folder name (e.g. Project Ideas, Print Queue)..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Optional description / notes..."
                value={newCollectionDesc}
                onChange={(e) => setNewCollectionDesc(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                >
                  Create & Bookmark
                </button>
              </div>
            </form>
          )}

          {/* Folder Buttons */}
          <div className="space-y-2">
            {collections.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                No collections yet. Click "New Folder" above to create your first collection!
              </div>
            ) : (
              collections.map((col) => {
                const isBookmarked = isModelInCollection(col.id, bookmarkModalModel.id);
                return (
                  <div
                    key={col.id}
                    onClick={() => toggleBookmarkModel(col.id, bookmarkModalModel.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isBookmarked
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                        : 'bg-slate-950/70 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isBookmarked 
                            ? 'bg-cyan-500/20 text-cyan-300' 
                            : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        <Folder className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{col.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {col.modelIds.length} model{col.modelIds.length === 1 ? '' : 's'} saved
                          {col.description && ` · ${col.description}`}
                        </span>
                      </div>
                    </div>

                    <div 
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isBookmarked
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                          : 'border-slate-700 bg-slate-900 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Collections are saved to your profile
          </span>
          <button
            onClick={closeBookmarkModal}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
