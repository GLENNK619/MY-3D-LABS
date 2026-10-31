import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Model3D, ModelFormat, UserProfile, UserCollection } from '../types';
import { 
  X, Download, UploadCloud, Heart, FolderPlus, Trash2, Edit3, 
  Check, ExternalLink, Box, Sparkles, Layers, Calendar, User, Grid,
  Bookmark, Folder, Plus, ArrowRight
} from 'lucide-react';
import { exportAndDownloadModel } from '../services/exportService';
import { buildProceduralModel } from '../services/proceduralModels';

interface UserProfileModalProps {
  onClose: () => void;
  onOpenModelDetail: (model: Model3D) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  onClose,
  onOpenModelDetail,
}) => {
  const { 
    user, 
    selectedProfileUser, 
    models, 
    updateProfile, 
    createGallery, 
    deleteGallery, 
    removeModelFromGallery,
    deleteUploadedModel,
    createCollection,
    deleteCollection,
    toggleBookmarkModel,
  } = useAuth();

  const profile: UserProfile = selectedProfileUser || user || {
    id: 'guest',
    email: '',
    displayName: 'Anonymous Modeler',
    username: 'guest',
    avatarUrl: '/src/assets/images/avatar_artist_marcus_1793442233065.jpg',
    bio: '3D enthusiast exploring MY 3D LABS.',
    specialty: '3D Modeling',
    joinedDate: 'October 2026',
    downloadsHistory: [],
    uploadedModelIds: [],
    likedModelIds: [],
    galleries: [],
    collections: [],
    totalAuthorDownloads: 0,
  };

  const isCurrentUser = user && user.id === profile.id;

  const [activeTab, setActiveTab] = useState<'collections' | 'gallery' | 'uploads' | 'downloads' | 'settings'>('collections');
  
  // Collections State
  const userCollections: UserCollection[] = profile.collections || [];
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(
    userCollections[0]?.id || null
  );
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  // Galleries State
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(
    profile.galleries?.[0]?.id || null
  );
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryDesc, setNewGalleryDesc] = useState('');

  // Profile Edit State
  const [editDisplayName, setEditDisplayName] = useState(profile.displayName);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editSpecialty, setEditSpecialty] = useState(profile.specialty);
  const [editPortfolio, setEditPortfolio] = useState(profile.portfolioUrl || '');
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Models uploaded by this profile
  const uploadedModels = models.filter((m) =>
    profile.uploadedModelIds?.includes(m.id) || m.creator?.username === profile.username
  );

  // Total downloads of creations
  const authorDownloadsTotal = uploadedModels.reduce((acc, m) => acc + (m.downloads || 0), 0) + (profile.totalAuthorDownloads || 0);

  // Total models user has downloaded
  const userDownloadedCount = profile.downloadsHistory?.length || 0;

  // Selected Gallery
  const activeGallery = profile.galleries?.find((g) => g.id === selectedGalleryId) || profile.galleries?.[0];
  const galleryModels = activeGallery
    ? models.filter((m) => activeGallery.modelIds.includes(m.id))
    : [];

  // Selected Collection
  const activeCollection = userCollections.find((c) => c.id === selectedCollectionId) || userCollections[0];
  const collectionModels = activeCollection
    ? models.filter((m) => activeCollection.modelIds.includes(m.id))
    : [];

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    const created = createCollection(newCollectionName.trim(), newCollectionDesc.trim());
    setSelectedCollectionId(created.id);
    setNewCollectionName('');
    setNewCollectionDesc('');
    setIsCreatingCollection(false);
  };

  const handleCreateGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryTitle.trim()) return;
    createGallery(newGalleryTitle.trim(), newGalleryDesc.trim(), []);
    setNewGalleryTitle('');
    setNewGalleryDesc('');
    setIsCreatingGallery(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: editDisplayName.trim(),
      bio: editBio.trim(),
      specialty: editSpecialty.trim(),
      portfolioUrl: editPortfolio.trim(),
    });
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  const handleReDownload = (modelId: string, format: ModelFormat) => {
    const targetModel = models.find((m) => m.id === modelId);
    if (!targetModel) return;
    const generated = buildProceduralModel(targetModel.generatorKey);
    exportAndDownloadModel(generated.group, targetModel, format);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 px-6 pt-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Avatar & Bio */}
            <div className="flex items-start sm:items-center gap-4">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {profile.displayName}
                  </h2>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                    @{profile.username}
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">{profile.bio}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>Specialty: <strong className="text-slate-200">{profile.specialty}</strong></span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-500" /> Joined {profile.joinedDate}
                  </span>
                  {profile.portfolioUrl && (
                    <>
                      <span>·</span>
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Portfolio <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics Counter Card */}
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl shrink-0">
              <div className="text-center px-3 border-r border-slate-800">
                <span className="text-lg font-bold font-mono text-white block">
                  {uploadedModels.length}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Creations</span>
              </div>
              <div className="text-center px-3 border-r border-slate-800">
                <span className="text-lg font-bold font-mono text-cyan-400 block">
                  {authorDownloadsTotal.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Asset Downloads</span>
              </div>
              <div className="text-center px-3">
                <span className="text-lg font-bold font-mono text-amber-400 block">
                  {userDownloadedCount}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Downloaded</span>
              </div>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-slate-800/80 -mb-6 pb-0 overflow-x-auto">
            {/* 1. COLLECTIONS TAB (Requested Feature) */}
            <button
              onClick={() => setActiveTab('collections')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'collections'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4" /> Collections ({userCollections.length})
            </button>

            {/* 2. GALLERIES TAB */}
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'gallery'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" /> My Galleries ({profile.galleries?.length || 0})
            </button>

            {/* 3. UPLOADED MODELS */}
            <button
              onClick={() => setActiveTab('uploads')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'uploads'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" /> Uploaded Models ({uploadedModels.length})
            </button>

            {/* 4. DOWNLOAD HISTORY & SETTINGS */}
            {isCurrentUser && (
              <>
                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'downloads'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Download className="w-4 h-4" /> Download History ({userDownloadedCount})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: COLLECTIONS (BOOKMARKED FOLDERS) */}
          {activeTab === 'collections' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-cyan-400" />
                    Custom Model Collections
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bookmark and organize your favorite 3D assets into folders like 'Project Ideas', 'Print Queue', and custom boards.
                  </p>
                </div>

                {isCurrentUser && (
                  <button
                    onClick={() => setIsCreatingCollection(!isCreatingCollection)}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    New Collection Folder
                  </button>
                )}
              </div>

              {/* Create Collection Folder Form */}
              {isCreatingCollection && (
                <form
                  onSubmit={handleCreateCollection}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3"
                >
                  <h4 className="text-xs font-semibold text-white">Create New Collection Folder</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Folder Name (e.g. Project Ideas, Print Queue, Mech Assets)..."
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      required
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Description / Purpose of this collection..."
                      value={newCollectionDesc}
                      onChange={(e) => setNewCollectionDesc(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCollection(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
                    >
                      Save Collection
                    </button>
                  </div>
                </form>
              )}

              {/* Collections Navigation Strip */}
              {userCollections.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {userCollections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => setSelectedCollectionId(col.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 border ${
                          (selectedCollectionId === col.id || (!selectedCollectionId && activeCollection?.id === col.id))
                            ? 'bg-slate-800 border-cyan-500 text-cyan-300'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>{col.name}</span>
                        <span className="font-mono text-[10px] opacity-75">({col.modelIds.length})</span>
                      </button>
                    ))}
                  </div>

                  {activeCollection && (
                    <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{activeCollection.name}</h4>
                            <span className="text-[10px] font-mono text-slate-500">
                              Updated {activeCollection.updatedAt}
                            </span>
                          </div>
                          {activeCollection.description && (
                            <p className="text-xs text-slate-400 mt-0.5">{activeCollection.description}</p>
                          )}
                        </div>

                        {isCurrentUser && (
                          <button
                            onClick={() => deleteCollection(activeCollection.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete this collection folder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {collectionModels.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg space-y-1">
                          <p>No models bookmarked in '{activeCollection.name}' yet.</p>
                          <p className="text-[11px] text-slate-600">
                            Browse the 3D database and click the Bookmark icon to add models here!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {collectionModels.map((m) => (
                            <div
                              key={m.id}
                              className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 space-y-2 transition-all flex flex-col justify-between"
                            >
                              <div 
                                onClick={() => onOpenModelDetail(m)}
                                className="h-28 bg-slate-950 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer"
                              >
                                <Box className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                                <span className="absolute bottom-1.5 right-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded">
                                  {m.category}
                                </span>
                              </div>

                              <div>
                                <h5 
                                  onClick={() => onOpenModelDetail(m)}
                                  className="text-xs font-bold text-white truncate cursor-pointer hover:text-cyan-400"
                                >
                                  {m.title}
                                </h5>
                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                                  <span>{m.polycount.faces.toLocaleString()} tris</span>
                                  <span>★ {m.rating.toFixed(1)}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                                <button
                                  onClick={() => onOpenModelDetail(m)}
                                  className="text-xs text-cyan-400 hover:underline"
                                >
                                  Inspect 3D
                                </button>
                                {isCurrentUser && (
                                  <button
                                    onClick={() => toggleBookmarkModel(activeCollection.id, m.id)}
                                    className="p-1 text-slate-500 hover:text-rose-400 text-[11px]"
                                    title="Remove from this collection"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No collections created yet. Click "New Collection Folder" to start bookmarking models!
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY GALLERIES */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Visual Galleries & Portfolios</h3>
                  <p className="text-xs text-slate-400">
                    Curate and organize original 3D creations into custom thematic collections.
                  </p>
                </div>

                {isCurrentUser && (
                  <button
                    onClick={() => setIsCreatingGallery(!isCreatingGallery)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    New Gallery
                  </button>
                )}
              </div>

              {/* Create Gallery Form */}
              {isCreatingGallery && (
                <form
                  onSubmit={handleCreateGallery}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3"
                >
                  <h4 className="text-xs font-semibold text-white">Create New 3D Gallery</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Gallery Title (e.g. Mech Prototypes, 3D Print Batch)"
                      value={newGalleryTitle}
                      onChange={(e) => setNewGalleryTitle(e.target.value)}
                      required
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Short Description of this collection"
                      value={newGalleryDesc}
                      onChange={(e) => setNewGalleryDesc(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingGallery(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
                    >
                      Save Gallery
                    </button>
                  </div>
                </form>
              )}

              {/* Gallery List Selector Bar */}
              {profile.galleries && profile.galleries.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {profile.galleries.map((gal) => (
                      <button
                        key={gal.id}
                        onClick={() => setSelectedGalleryId(gal.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 border ${
                          selectedGalleryId === gal.id
                            ? 'bg-slate-800 border-cyan-500 text-cyan-300'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{gal.title}</span>
                        <span className="font-mono text-[10px] opacity-75">({gal.modelIds.length})</span>
                      </button>
                    ))}
                  </div>

                  {activeGallery && (
                    <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{activeGallery.title}</h4>
                          <p className="text-xs text-slate-400">{activeGallery.description}</p>
                        </div>
                        {isCurrentUser && profile.galleries.length > 1 && (
                          <button
                            onClick={() => deleteGallery(activeGallery.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Gallery"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {galleryModels.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                          This gallery is currently empty. Add models from your uploaded list below!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {galleryModels.map((m) => (
                            <div
                              key={m.id}
                              className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 space-y-2 transition-all cursor-pointer"
                              onClick={() => onOpenModelDetail(m)}
                            >
                              <div className="h-28 bg-slate-950 rounded-lg flex items-center justify-center relative overflow-hidden">
                                <Box className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                                <span className="absolute bottom-1.5 right-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded">
                                  {m.category}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-white truncate">{m.title}</h5>
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>{m.polycount.faces.toLocaleString()} tris</span>
                                <span className="text-cyan-400">{m.downloads} dl</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No galleries yet. Click "New Gallery" above to organize your creations.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UPLOADED MODELS */}
          {activeTab === 'uploads' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Community Uploads & Creations</h3>
              {uploadedModels.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No models uploaded yet. Use the "Upload & Create" button in the top bar to share your 3D models!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedModels.map((model) => (
                    <div
                      key={model.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3"
                    >
                      <div 
                        onClick={() => onOpenModelDetail(model)}
                        className="h-32 bg-slate-900 rounded-lg flex items-center justify-center cursor-pointer group relative"
                      >
                        <Box className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-2 right-2 text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded">
                          {model.category}
                        </span>
                      </div>

                      <div>
                        <h4 
                          onClick={() => onOpenModelDetail(model)}
                          className="text-xs font-bold text-white truncate cursor-pointer hover:text-cyan-400"
                        >
                          {model.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                          <span>{model.polycount.faces.toLocaleString()} tris</span>
                          <span>★ {model.rating.toFixed(1)}</span>
                          <span className="text-cyan-400">{model.downloads} downloads</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                        <button
                          onClick={() => onOpenModelDetail(model)}
                          className="text-xs text-cyan-400 hover:underline"
                        >
                          Inspect 3D
                        </button>
                        {isCurrentUser && (
                          <button
                            onClick={() => deleteUploadedModel(model.id)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Delete model from library"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DOWNLOAD HISTORY */}
          {activeTab === 'downloads' && isCurrentUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Download Archive</h3>
                  <p className="text-xs text-slate-400">
                    All 3D models downloaded to your account with instant re-download.
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  {profile.downloadsHistory.length} Total Files
                </span>
              </div>

              {profile.downloadsHistory.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  You haven't downloaded any 3D models yet. Browse the community catalog to get free models!
                </div>
              ) : (
                <div className="space-y-2">
                  {profile.downloadsHistory.map((item, idx) => (
                    <div
                      key={`${item.modelId}-${idx}`}
                      className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg text-cyan-400">
                          <Box className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.modelTitle}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.category} · Format: .{item.format} · {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleReDownload(item.modelId, item.format)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Re-Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EDIT PROFILE SETTINGS */}
          {activeTab === 'settings' && isCurrentUser && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Specialty / Focus</label>
                <input
                  type="text"
                  value={editSpecialty}
                  onChange={(e) => setEditSpecialty(e.target.value)}
                  placeholder="e.g. Character Sculpting, 3D Printing, Hard Surface"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Portfolio / ArtStation Link</label>
                <input
                  type="url"
                  value={editPortfolio}
                  onChange={(e) => setEditPortfolio(e.target.value)}
                  placeholder="https://artstation.com/your_handle"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {savedSettingsNotice && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Profile changes saved!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                >
                  Save Profile Info
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
