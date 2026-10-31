import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, UploadCloud, User, LogIn, Sparkles, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenStudio: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenStudio,
  onNavigateSection,
}) => {
  const { user, openAuthModal, openProfileModal } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <a 
          href="#top" 
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('top');
          }}
          className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
            <Box className="w-5 h-5" />
          </div>
          <span className="tracking-tighter">
            MY <span className="text-cyan-400">3D</span> LABS
          </span>
        </a>

        {/* Zone 2: 4-5 Concise Single-Line Text Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onNavigateSection('catalog')}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            Explore Database
          </button>
          <button
            onClick={() => {
              if (user) {
                openProfileModal(user, 'collections');
              } else {
                openAuthModal('Sign in to view your bookmarked 3D collections (Project Ideas, Print Queue).');
              }
            }}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            Collections
          </button>
          <button
            onClick={onOpenStudio}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            3D Studio
          </button>
          <button
            onClick={() => onNavigateSection('featured-creators')}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            Creators
          </button>
          <button
            onClick={() => onNavigateSection('ecosystem')}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            3D Websites
          </button>
        </nav>

        {/* Zone 3: Primary Action & Account Menu */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenStudio}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload & Create</span>
          </button>

          {user ? (
            <button
              onClick={() => openProfileModal(user)}
              className="flex items-center gap-2 p-1 pl-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              title="Open My Profile & Galleries"
            >
              <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
                {user.displayName}
              </span>
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-7 h-7 rounded-md object-cover border border-cyan-500/40"
                referrerPolicy="no-referrer"
              />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('Create a free account to download models and share 3D assets.')}
              className="px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
