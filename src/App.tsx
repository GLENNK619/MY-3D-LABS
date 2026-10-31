import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ModelCard } from './components/ModelCard';
import { ModelDetailModal } from './components/ModelDetailModal';
import { UserProfileModal } from './components/UserProfileModal';
import { StudioCreateModal } from './components/StudioCreateModal';
import { AuthModal } from './components/AuthModal';
import { BookmarkModal } from './components/BookmarkModal';
import { EcosystemWebsitesSection } from './components/EcosystemWebsitesSection';
import { SearchFilterBar } from './components/SearchFilterBar';
import { Model3D, ModelCategory } from './types';
import { 
  Box, Sparkles, UploadCloud, Download, ShieldCheck, 
  Printer, Star, CheckCircle2, ArrowRight, Eye, Layers, Bookmark 
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { models, user, openAuthModal, openProfileModal, isProfileModalOpen, closeProfileModal } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory>('All');
  const [selectedUploader, setSelectedUploader] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'downloads' | 'rating' | 'newest'>('trending');

  // Modal States
  const [activeDetailModel, setActiveDetailModel] = useState<Model3D | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Available unique uploaders for filter dropdown
  const availableUploaders = useMemo(() => {
    const map = new Map<string, string>();
    models.forEach((m) => {
      if (m.creator && m.creator.username) {
        map.set(m.creator.username, m.creator.name);
      }
    });
    return Array.from(map.entries()).map(([username, name]) => ({ username, name }));
  }, [models]);

  // Filtered & Sorted Models
  const filteredModels = useMemo(() => {
    return models
      .filter((model) => {
        // 1. Category Filter
        if (selectedCategory !== 'All' && model.category !== selectedCategory) {
          return false;
        }

        // 2. Uploader Filter
        if (selectedUploader !== 'all' && model.creator.username !== selectedUploader) {
          return false;
        }

        // 3. Format Filter
        if (selectedFormat !== 'all' && !model.formats.includes(selectedFormat as any)) {
          return false;
        }

        // 4. Keyword Query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchTitle = model.title.toLowerCase().includes(q);
          const matchDesc = model.description.toLowerCase().includes(q);
          const matchTags = model.tags.some((t) => t.toLowerCase().includes(q));
          const matchCreator = model.creator.name.toLowerCase().includes(q) || model.creator.username.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchTags && !matchCreator) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') return b.downloads - a.downloads;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        // Default: trending (likes + downloads composite)
        return b.likes * 2 + b.downloads - (a.likes * 2 + a.downloads);
      });
  }, [models, selectedCategory, selectedUploader, selectedFormat, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedUploader('all');
    setSelectedFormat('all');
    setSortBy('trending');
  };

  const handleOpenCreator = (username: string) => {
    openProfileModal(username);
  };

  const handleOpenStudio = () => {
    if (!user) {
      openAuthModal('Please create an account or sign in to open the 3D Creator Studio and publish models.');
      return;
    }
    setIsStudioOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenStudio={handleOpenStudio}
        onNavigateSection={scrollToSection}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12" id="top">
        {/* HERO SECTION */}
        <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-10 lg:p-12 shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left 7 Cols: Value Proposition */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-800/80 rounded-full text-xs font-mono text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Gen 3D Model Repository & Studio</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Browse, Create, and Download <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                  Free 3D Models
                </span>{' '}
                for Everyone.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Explore a vast community database of open 3D assets with real-time interactive WebGL viewports. 
                Create your account to download in OBJ, STL, and GLTF, or launch our in-browser studio to build and publish your own creations.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => scrollToSection('catalog')}
                  className="px-6 py-3 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Explore Free Models
                </button>

                <button
                  onClick={handleOpenStudio}
                  className="px-5 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4 text-cyan-400" />
                  Launch 3D Studio & Upload
                </button>

                <button
                  onClick={() => {
                    if (user) {
                      openProfileModal(user, 'collections');
                    } else {
                      openAuthModal('Sign in to view your bookmarked 3D collections (Project Ideas, Print Queue).');
                    }
                  }}
                  className="px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Bookmark className="w-4 h-4 text-cyan-400" />
                  My Collections ({user?.collections?.length || 0})
                </button>
              </div>

              {/* Unboxed Metadata Proof Metrics */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                <span>12,400+ Free Models</span>
                <span>·</span>
                <span>100% Manifold 3D Print Ready</span>
                <span>·</span>
                <span>PBR Shaders & Exploded Views</span>
              </div>
            </div>

            {/* Right 5 Cols: Hero Featured Model Showcase Card */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => {
                  const featured = models.find((m) => m.id === 'model-aegis-drone') || models[0];
                  setActiveDetailModel(featured);
                }}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-5 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-300">
                      Featured Model Spotlight
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 (38 reviews)
                  </div>
                </div>

                <div className="h-52 bg-slate-950 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:border-cyan-500/30 border border-slate-800/80">
                  <img
                    src="/src/assets/images/hero_3d_lab_banner_1793442232615.jpg"
                    alt="MY 3D LABS Model Spotlight"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Aegis-9 Autonomous Recon Mech</span>
                    <span className="text-cyan-300 font-mono text-[11px] bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                      Click to Inspect 3D
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Creator: <strong>Marcus Chen</strong></span>
                  <span className="text-cyan-400 flex items-center gap-1 group-hover:underline">
                    View in 3D Viewport <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH, CATEGORIES & MODEL DATABASE SECTION */}
        <section className="space-y-6" id="catalog">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2" id="categories">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">3D Model Database</h2>
              <p className="text-xs text-slate-400">
                Filter by Category (Characters, Environments, Props, Abstract), search keywords, and creator.
              </p>
            </div>
          </div>

          {/* Search & Filter Component */}
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedUploader={selectedUploader}
            onSelectUploader={setSelectedUploader}
            availableUploaders={availableUploaders}
            selectedFormat={selectedFormat}
            onSelectFormat={setSelectedFormat}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            totalResultsCount={filteredModels.length}
            onResetFilters={handleResetFilters}
          />

          {/* Model Cards Grid */}
          {filteredModels.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
              <Box className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No matching 3D models found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any models matching your active filter criteria. Try adjusting your search query or reset filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onOpenDetail={setActiveDetailModel}
                  onOpenCreator={handleOpenCreator}
                />
              ))}
            </div>
          )}
        </section>

        {/* FEATURED CREATORS & COMMUNITY SECTION */}
        <section className="space-y-6 pt-6 border-t border-slate-800" id="featured-creators">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Featured 3D Creators</h2>
            <p className="text-xs text-slate-400">
              Discover top modelers and explore their personalized visual galleries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Creator 1: Elena Vance */}
            <div 
              onClick={() => handleOpenCreator('elena_sculpts')}
              className="group bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/avatar_artist_elena_1793442233950.jpg"
                  alt="Elena Vance"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-cyan-500/30"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">Elena Vance</h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">@elena_sculpts</span>
                  <span className="text-[11px] text-cyan-400 block font-medium">Stylized Characters & Sculptures</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Specializes in stylized low-poly creatures, game-ready character topology, and expressive organic forms.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
                <span>9,300+ Model Downloads</span>
                <span className="text-cyan-400 group-hover:underline">View Gallery →</span>
              </div>
            </div>

            {/* Creator 2: Marcus Chen */}
            <div 
              onClick={() => handleOpenCreator('marcus_hard_surface')}
              className="group bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/avatar_artist_marcus_1793442233065.jpg"
                  alt="Marcus Chen"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-cyan-500/30"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">Marcus Chen</h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">@marcus_hard_surface</span>
                  <span className="text-[11px] text-cyan-400 block font-medium">Hard-Surface & Industrial Design</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Creator of autonomous robotics, VTOL aerospace hulls, and precision luxury horology props.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
                <span>12,800+ Model Downloads</span>
                <span className="text-cyan-400 group-hover:underline">View Gallery →</span>
              </div>
            </div>

            {/* Creator 3: Glenn Mairong */}
            <div 
              onClick={() => handleOpenCreator('glen_3dlab')}
              className="group bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-cyan-950/80 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  GM
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">Glenn Mairong</h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">@glen_3dlab</span>
                  <span className="text-[11px] text-cyan-400 block font-medium">Parametric & 3D Printing STL</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Focused on watertight prosthetic mechanisms, mathematical kinetic sculptures, and architectural monuments.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
                <span>12,000+ Model Downloads</span>
                <span className="text-cyan-400 group-hover:underline">View Gallery →</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3D PRINTING & SPECIFICATIONS INFO */}
        <section className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4" id="specs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">3D Printing Quality Guarantee</h3>
              <p className="text-xs text-slate-400">
                Every STL asset is algorithmically inspected for non-manifold edges, planar orientation, and watertightness.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1">
              <span className="font-semibold text-white block">Slicer Compatibility</span>
              <p className="text-slate-400 text-[11px]">
                Pre-tested for Bambu Studio, PrusaSlicer, Ultimaker Cura, and Lychee Resin Slicer.
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1">
              <span className="font-semibold text-white block">Zero Support Waste</span>
              <p className="text-slate-400 text-[11px]">
                Low overhang angles allow many models to print cleanly without excessive support generation.
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1">
              <span className="font-semibold text-white block">Real Export Files</span>
              <p className="text-slate-400 text-[11px]">
                Download actual binary STL and text OBJ files generated directly from the 3D viewport canvas.
              </p>
            </div>
          </div>
        </section>

        {/* 3D WEBSITES & EXTERNAL ECOSYSTEM PLATFORMS */}
        <EcosystemWebsitesSection />
      </main>

      {/* QUIET SITE FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Box className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">MY 3D LABS</span>
            <span>·</span>
            <span>The Open 3D Asset Repository</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => scrollToSection('catalog')} className="hover:text-white transition-colors">
              Database
            </button>
            <button onClick={handleOpenStudio} className="hover:text-white transition-colors">
              3D Studio
            </button>
            <button onClick={() => scrollToSection('ecosystem')} className="hover:text-white transition-colors">
              3D Websites
            </button>
            <button 
              onClick={() => {
                if (user) openProfileModal(user, 'collections');
                else openAuthModal('Sign in to view your 3D collections.');
              }} 
              className="hover:text-white transition-colors"
            >
              Collections
            </button>
            <button onClick={() => scrollToSection('specs')} className="hover:text-white transition-colors">
              3D Print Specs
            </button>
          </div>

          <span className="font-mono text-[11px]">
            © 2026 MY 3D LABS. Free for personal & commercial use.
          </span>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Model Detail & Real-Time 3D Viewport Modal */}
      {activeDetailModel && (
        <ModelDetailModal
          model={activeDetailModel}
          onClose={() => setActiveDetailModel(null)}
          onOpenCreatorProfile={(username) => {
            setActiveDetailModel(null);
            handleOpenCreator(username);
          }}
        />
      )}

      {/* 2. User Profile Modal with My Gallery & Collections */}
      {isProfileModalOpen && (
        <UserProfileModal
          onClose={closeProfileModal}
          onOpenModelDetail={(model) => {
            closeProfileModal();
            setActiveDetailModel(model);
          }}
        />
      )}

      {/* 3. In-Browser 3D Creator Studio & Uploader Modal */}
      {isStudioOpen && (
        <StudioCreateModal
          onClose={() => setIsStudioOpen(false)}
          onModelCreated={(newModel) => {
            setActiveDetailModel(newModel);
          }}
        />
      )}

      {/* 4. Bookmark to Collections Modal */}
      <BookmarkModal />

      {/* 5. Auth & Account Registration Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
