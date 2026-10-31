export type ModelCategory = 
  | 'All'
  | 'Characters'
  | 'Environments'
  | 'Props'
  | 'Abstract'
  | 'Vehicles & Mechs'
  | 'Sci-Fi'
  | '3D Printing';

export type ModelFormat = 'GLTF' | 'GLB' | 'OBJ' | 'STL';

export interface ModelCreator {
  id?: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  bio?: string;
  location?: string;
}

export interface ModelReview {
  id: string;
  modelId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Model3D {
  id: string;
  title: string;
  description: string;
  category: ModelCategory;
  tags: string[];
  creator: ModelCreator;
  polycount: {
    vertices: number;
    faces: number;
  };
  formats: ModelFormat[];
  license: string;
  fileSize: string;
  downloads: number;
  likes: number;
  views: number;
  dateAdded: string;
  generatorKey: string;
  previewColor?: string;
  isUserUploaded?: boolean;
  featured?: boolean;
  rating: number; // 1.0 - 5.0 average
  reviewsCount: number;
  dimensions?: {
    x: number;
    y: number;
    z: number;
  };
  customModelData?: string;
}

export interface UserDownloadRecord {
  modelId: string;
  modelTitle: string;
  format: ModelFormat;
  timestamp: number;
  fileSize: string;
  category: ModelCategory;
}

export interface GalleryFolder {
  id: string;
  title: string;
  description: string;
  modelIds: string[];
  createdAt: string;
}

export interface UserCollection {
  id: string;
  name: string; // e.g. "Project Ideas", "Print Queue"
  description?: string;
  modelIds: string[];
  createdAt: string;
  updatedAt: string;
  color?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  bio: string;
  specialty: string;
  portfolioUrl?: string;
  joinedDate: string;
  downloadsHistory: UserDownloadRecord[];
  uploadedModelIds: string[];
  likedModelIds: string[];
  galleries: GalleryFolder[];
  collections: UserCollection[];
  totalAuthorDownloads: number;
}

export type ViewportRenderMode = 'solid' | 'wireframe' | 'clay' | 'normals' | 'xray';

export type ViewportEnvironment = 'studio' | 'cyber' | 'sunset' | 'deepspace' | 'minimal';

export interface ViewportSettings {
  renderMode: ViewportRenderMode;
  materialColor: string;
  roughness: number;
  metalness: number;
  environment: ViewportEnvironment;
  autoRotate: boolean;
  showGrid: boolean;
  showAxes: boolean;
  explodedDistance: number; // 0 to 1
  fieldOfView: number;
}
