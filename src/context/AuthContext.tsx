import React, { createContext, useContext, useState, useEffect } from 'react';
import { Model3D, ModelFormat, ModelReview, UserProfile, GalleryFolder, UserDownloadRecord, UserCollection } from '../types';
import { INITIAL_MODELS } from '../data/modelsData';
import { INITIAL_REVIEWS } from '../data/reviewsData';

interface AuthContextType {
  user: UserProfile | null;
  models: Model3D[];
  reviews: ModelReview[];
  isAuthModalOpen: boolean;
  authModalReason: string;
  isProfileModalOpen: boolean;
  selectedProfileUser: UserProfile | null;
  bookmarkModalModel: Model3D | null;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  openProfileModal: (userOrId?: string | UserProfile, initialTab?: string) => void;
  closeProfileModal: () => void;
  openBookmarkModal: (model: Model3D) => void;
  closeBookmarkModal: () => void;
  login: (email: string, displayName?: string, username?: string) => void;
  signup: (userData: { displayName: string; username: string; email: string; bio: string; specialty: string }) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  recordDownload: (model: Model3D, format: ModelFormat) => boolean;
  toggleLike: (modelId: string) => boolean;
  addUploadedModel: (model: Model3D) => void;
  deleteUploadedModel: (modelId: string) => void;
  createGallery: (title: string, description: string, modelIds?: string[]) => void;
  addModelToGallery: (galleryId: string, modelId: string) => void;
  removeModelFromGallery: (galleryId: string, modelId: string) => void;
  deleteGallery: (galleryId: string) => void;
  // Collections feature
  createCollection: (name: string, description?: string, initialModelId?: string) => UserCollection;
  deleteCollection: (collectionId: string) => void;
  toggleBookmarkModel: (collectionId: string, modelId: string) => void;
  isModelInCollection: (collectionId: string, modelId: string) => boolean;
  getCollectionsForModel: (modelId: string) => UserCollection[];
  isModelBookmarkedAnywhere: (modelId: string) => boolean;
  addReview: (modelId: string, rating: number, comment: string) => boolean;
  getReviewsForModel: (modelId: string) => ModelReview[];
}

const DEFAULT_USER: UserProfile = {
  id: 'glen_glenn',
  email: 'mairongglenn619@gmail.com',
  displayName: 'Glenn Mairong',
  username: 'glen_3dlab',
  avatarUrl: '/src/assets/images/avatar_artist_marcus_1793442233065.jpg',
  bio: 'Lead 3D spatial engineer and parametric modeler. Obsessed with cyber hard-surface assets, watertight 3D printing geometries, and real-time WebGL rendering.',
  specialty: 'Parametric Architecture & Hard Surface',
  portfolioUrl: 'https://artstation.com/glen_3dlab',
  joinedDate: 'October 2026',
  downloadsHistory: [
    {
      modelId: 'model-cyber-fox',
      modelTitle: 'Low-Poly Spectral Kitsune Fox',
      format: 'GLTF',
      timestamp: Date.now() - 86400000 * 2,
      fileSize: '3.4 MB',
      category: 'Characters',
    },
    {
      modelId: 'model-aegis-drone',
      modelTitle: 'Aegis-9 Autonomous Recon Mech',
      format: 'OBJ',
      timestamp: Date.now() - 86400000 * 4,
      fileSize: '14.2 MB',
      category: 'Characters',
    },
    {
      modelId: 'model-bionic-hand',
      modelTitle: 'Myoelectric Bionic Hand Prosthetic',
      format: 'STL',
      timestamp: Date.now() - 86400000 * 7,
      fileSize: '12.8 MB',
      category: '3D Printing',
    },
  ],
  uploadedModelIds: ['model-art-deco-spire', 'model-quantum-core', 'model-bionic-hand'],
  likedModelIds: ['model-aegis-drone', 'model-cyber-fox', 'model-cyber-katana', 'model-tourbillon-watch'],
  galleries: [
    {
      id: 'gallery-showcase',
      title: 'Featured Renders & Flagships',
      description: 'Hand-picked portfolio highlights optimized for real-time engines and cinematic showcases.',
      modelIds: ['model-quantum-core', 'model-art-deco-spire'],
      createdAt: '2026-10-25',
    },
    {
      id: 'gallery-print',
      title: '3D Printing & Functional STL',
      description: 'Watertight, support-free geometries tested on Bambu Lab and resin printers.',
      modelIds: ['model-bionic-hand'],
      createdAt: '2026-10-26',
    },
  ],
  collections: [
    {
      id: 'coll-project-ideas',
      name: 'Project Ideas',
      description: 'Inspirational concept geometries for our next game environment build.',
      modelIds: ['model-aegis-drone', 'model-voxel-castle'],
      createdAt: '2026-10-24',
      updatedAt: '2026-10-29',
      color: '#06b6d4',
    },
    {
      id: 'coll-print-queue',
      name: 'Print Queue',
      description: 'Assets prepared and queued for weekend 3D printing on the Bambu X1-Carbon.',
      modelIds: ['model-bionic-hand', 'model-cyber-fox'],
      createdAt: '2026-10-26',
      updatedAt: '2026-10-30',
      color: '#f97316',
    },
  ],
  totalAuthorDownloads: 12000,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial models from storage or fallback to INITIAL_MODELS
  const [models, setModels] = useState<Model3D[]>(() => {
    try {
      const saved = localStorage.getItem('my3dlabs_models');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_MODELS;
  });

  // Load reviews
  const [reviews, setReviews] = useState<ModelReview[]>(() => {
    try {
      const saved = localStorage.getItem('my3dlabs_reviews');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS;
  });

  // User state
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('my3dlabs_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure collections exists on loaded user
        if (!parsed.collections) {
          parsed.collections = DEFAULT_USER.collections;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  });

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('Create an account to download 3D models and share your creations with the community.');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);
  const [bookmarkModalModel, setBookmarkModalModel] = useState<Model3D | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('my3dlabs_models', JSON.stringify(models));
    } catch {
      // error ignore
    }
  }, [models]);

  useEffect(() => {
    try {
      localStorage.setItem('my3dlabs_reviews', JSON.stringify(reviews));
    } catch {
      // error ignore
    }
  }, [reviews]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('my3dlabs_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('my3dlabs_user');
      }
    } catch {
      // error ignore
    }
  }, [user]);

  const openAuthModal = (reason?: string) => {
    if (reason) setAuthModalReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openProfileModal = (userOrId?: string | UserProfile, initialTab?: string) => {
    if (!userOrId || userOrId === user?.id || (typeof userOrId === 'object' && userOrId.id === user?.id)) {
      setSelectedProfileUser(user);
    } else if (typeof userOrId === 'object') {
      setSelectedProfileUser(userOrId);
    } else {
      const foundArtistModel = models.find(m => m.creator.username === userOrId || m.creator.id === userOrId);
      if (foundArtistModel) {
        const artistUploaded = models.filter(m => m.creator.username === foundArtistModel.creator.username);
        const artistProfile: UserProfile = {
          id: foundArtistModel.creator.id || foundArtistModel.creator.username,
          displayName: foundArtistModel.creator.name,
          username: foundArtistModel.creator.username,
          email: `${foundArtistModel.creator.username}@my3dlabs.art`,
          avatarUrl: foundArtistModel.creator.avatar,
          bio: foundArtistModel.creator.bio || 'Digital 3D Sculptor & Community Contributor on MY 3D LABS.',
          specialty: foundArtistModel.category,
          joinedDate: 'September 2026',
          downloadsHistory: [],
          uploadedModelIds: artistUploaded.map(m => m.id),
          likedModelIds: [],
          galleries: [
            {
              id: 'gallery-community',
              title: `${foundArtistModel.creator.name}'s Public Creations`,
              description: 'All 3D assets released to the MY 3D LABS community.',
              modelIds: artistUploaded.map(m => m.id),
              createdAt: '2026-10-01',
            }
          ],
          collections: [
            {
              id: `coll-${foundArtistModel.creator.username}`,
              name: 'Studio Showcase',
              description: 'Official production-tested asset collection.',
              modelIds: artistUploaded.map(m => m.id),
              createdAt: '2026-10-01',
              updatedAt: '2026-10-25',
              color: '#06b6d4',
            }
          ],
          totalAuthorDownloads: artistUploaded.reduce((acc, m) => acc + m.downloads, 0),
        };
        setSelectedProfileUser(artistProfile);
      } else {
        setSelectedProfileUser(user);
      }
    }
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => setIsProfileModalOpen(false);

  const openBookmarkModal = (model: Model3D) => {
    if (!user) {
      openAuthModal(`Please create an account or sign in to bookmark "${model.title}" into custom collection folders.`);
      return;
    }
    setBookmarkModalModel(model);
  };

  const closeBookmarkModal = () => setBookmarkModalModel(null);

  const login = (email: string, displayName?: string, username?: string) => {
    const newUser: UserProfile = {
      ...DEFAULT_USER,
      email,
      displayName: displayName || email.split('@')[0],
      username: username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
    };
    setUser(newUser);
    closeAuthModal();
  };

  const signup = (userData: { displayName: string; username: string; email: string; bio: string; specialty: string }) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: userData.email,
      displayName: userData.displayName,
      username: userData.username,
      avatarUrl: '/src/assets/images/avatar_artist_marcus_1793442233065.jpg',
      bio: userData.bio || '3D creator and community member at MY 3D LABS.',
      specialty: userData.specialty || 'General 3D Modeling',
      portfolioUrl: '',
      joinedDate: 'October 2026',
      downloadsHistory: [],
      uploadedModelIds: [],
      likedModelIds: [],
      galleries: [
        {
          id: `gallery-${Date.now()}`,
          title: 'My First 3D Gallery',
          description: 'A curated showcase of my favorite models and original creations.',
          modelIds: [],
          createdAt: new Date().toISOString().split('T')[0],
        }
      ],
      collections: [
        {
          id: `coll-${Date.now()}-1`,
          name: 'Project Ideas',
          description: 'Inspirational 3D models for upcoming builds.',
          modelIds: [],
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          color: '#06b6d4',
        },
        {
          id: `coll-${Date.now()}-2`,
          name: 'Print Queue',
          description: '3D print ready models queued for slicing and printing.',
          modelIds: [],
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          color: '#f97316',
        }
      ],
      totalAuthorDownloads: 0,
    };
    setUser(newUser);
    closeAuthModal();
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const recordDownload = (model: Model3D, format: ModelFormat): boolean => {
    if (!user) {
      openAuthModal(`Please create a free account or sign in to download "${model.title}" in ${format} format.`);
      return false;
    }

    const record: UserDownloadRecord = {
      modelId: model.id,
      modelTitle: model.title,
      format,
      timestamp: Date.now(),
      fileSize: model.fileSize,
      category: model.category,
    };

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        downloadsHistory: [record, ...prev.downloadsHistory.filter(d => !(d.modelId === model.id && d.format === format))],
      };
    });

    setModels(prev =>
      prev.map(m => (m.id === model.id ? { ...m, downloads: m.downloads + 1 } : m))
    );

    return true;
  };

  const toggleLike = (modelId: string): boolean => {
    if (!user) {
      openAuthModal('Please create an account to save models to your favorites and like community creations.');
      return false;
    }

    const isLiked = user.likedModelIds.includes(modelId);
    const updatedLiked = isLiked
      ? user.likedModelIds.filter(id => id !== modelId)
      : [...user.likedModelIds, modelId];

    setUser(prev => prev ? { ...prev, likedModelIds: updatedLiked } : null);

    setModels(prev =>
      prev.map(m =>
        m.id === modelId ? { ...m, likes: m.likes + (isLiked ? -1 : 1) } : m
      )
    );

    return true;
  };

  const addUploadedModel = (newModel: Model3D) => {
    if (!user) {
      openAuthModal('Please create an account to publish your 3D models to the community.');
      return;
    }

    const modelWithCreator: Model3D = {
      ...newModel,
      creator: {
        id: user.id,
        name: user.displayName,
        username: user.username,
        avatar: user.avatarUrl,
        verified: true,
        bio: user.bio,
      },
      isUserUploaded: true,
    };

    setModels(prev => [modelWithCreator, ...prev]);

    setUser(prev => {
      if (!prev) return null;
      const updatedGalleries = prev.galleries.map((gal, idx) => {
        if (idx === 0) {
          return { ...gal, modelIds: [modelWithCreator.id, ...gal.modelIds] };
        }
        return gal;
      });

      return {
        ...prev,
        uploadedModelIds: [modelWithCreator.id, ...prev.uploadedModelIds],
        galleries: updatedGalleries,
      };
    });
  };

  const deleteUploadedModel = (modelId: string) => {
    setModels(prev => prev.filter(m => m.id !== modelId));
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        uploadedModelIds: prev.uploadedModelIds.filter(id => id !== modelId),
        galleries: prev.galleries.map(gal => ({
          ...gal,
          modelIds: gal.modelIds.filter(id => id !== modelId),
        })),
        collections: prev.collections.map(col => ({
          ...col,
          modelIds: col.modelIds.filter(id => id !== modelId),
        })),
      };
    });
  };

  const createGallery = (title: string, description: string, modelIds: string[] = []) => {
    if (!user) return;
    const newGallery: GalleryFolder = {
      id: `gallery-${Date.now()}`,
      title,
      description,
      modelIds,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUser(prev => prev ? {
      ...prev,
      galleries: [...prev.galleries, newGallery],
    } : null);
  };

  const addModelToGallery = (galleryId: string, modelId: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        galleries: prev.galleries.map(g =>
          g.id === galleryId && !g.modelIds.includes(modelId)
            ? { ...g, modelIds: [...g.modelIds, modelId] }
            : g
        ),
      };
    });
  };

  const removeModelFromGallery = (galleryId: string, modelId: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        galleries: prev.galleries.map(g =>
          g.id === galleryId ? { ...g, modelIds: g.modelIds.filter(id => id !== modelId) } : g
        ),
      };
    });
  };

  const deleteGallery = (galleryId: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        galleries: prev.galleries.filter(g => g.id !== galleryId),
      };
    });
  };

  // --- COLLECTIONS IMPLEMENTATION ---
  const createCollection = (name: string, description?: string, initialModelId?: string): UserCollection => {
    const newCol: UserCollection = {
      id: `coll-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || '',
      modelIds: initialModelId ? [initialModelId] : [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      color: '#06b6d4',
    };

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        collections: [newCol, ...(prev.collections || [])],
      };
    });

    return newCol;
  };

  const deleteCollection = (collectionId: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        collections: (prev.collections || []).filter(c => c.id !== collectionId),
      };
    });
  };

  const toggleBookmarkModel = (collectionId: string, modelId: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        collections: (prev.collections || []).map(col => {
          if (col.id === collectionId) {
            const hasModel = col.modelIds.includes(modelId);
            const updatedModelIds = hasModel
              ? col.modelIds.filter(id => id !== modelId)
              : [...col.modelIds, modelId];
            return {
              ...col,
              modelIds: updatedModelIds,
              updatedAt: new Date().toISOString().split('T')[0],
            };
          }
          return col;
        }),
      };
    });
  };

  const isModelInCollection = (collectionId: string, modelId: string): boolean => {
    if (!user || !user.collections) return false;
    const col = user.collections.find(c => c.id === collectionId);
    return col ? col.modelIds.includes(modelId) : false;
  };

  const getCollectionsForModel = (modelId: string): UserCollection[] => {
    if (!user || !user.collections) return [];
    return user.collections.filter(c => c.modelIds.includes(modelId));
  };

  const isModelBookmarkedAnywhere = (modelId: string): boolean => {
    if (!user || !user.collections) return false;
    return user.collections.some(c => c.modelIds.includes(modelId));
  };

  const addReview = (modelId: string, rating: number, comment: string): boolean => {
    if (!user) {
      openAuthModal('Please create an account or sign in to rate models and leave reviews.');
      return false;
    }

    const newRev: ModelReview = {
      id: `rev-${Date.now()}`,
      modelId,
      userId: user.id,
      userName: user.displayName,
      userAvatar: user.avatarUrl,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedReviews = [newRev, ...reviews];
    setReviews(updatedReviews);

    const modelReviews = updatedReviews.filter(r => r.modelId === modelId);
    const avg = Number((modelReviews.reduce((sum, r) => sum + r.rating, 0) / modelReviews.length).toFixed(1));

    setModels(prev =>
      prev.map(m =>
        m.id === modelId
          ? { ...m, rating: avg, reviewsCount: modelReviews.length }
          : m
      )
    );

    return true;
  };

  const getReviewsForModel = (modelId: string) => {
    return reviews.filter(r => r.modelId === modelId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        models,
        reviews,
        isAuthModalOpen,
        authModalReason,
        isProfileModalOpen,
        selectedProfileUser,
        bookmarkModalModel,
        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal,
        openBookmarkModal,
        closeBookmarkModal,
        login,
        signup,
        logout,
        updateProfile,
        recordDownload,
        toggleLike,
        addUploadedModel,
        deleteUploadedModel,
        createGallery,
        addModelToGallery,
        removeModelFromGallery,
        deleteGallery,
        createCollection,
        deleteCollection,
        toggleBookmarkModel,
        isModelInCollection,
        getCollectionsForModel,
        isModelBookmarkedAnywhere,
        addReview,
        getReviewsForModel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
