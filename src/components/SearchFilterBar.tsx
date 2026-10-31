import React from 'react';
import { ModelCategory, ModelFormat } from '../types';
import { Search, Filter, X, User, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ModelCategory;
  onSelectCategory: (category: ModelCategory) => void;
  selectedUploader: string;
  onSelectUploader: (uploader: string) => void;
  availableUploaders: { username: string; name: string }[];
  selectedFormat: string;
  onSelectFormat: (format: string) => void;
  sortBy: 'trending' | 'downloads' | 'rating' | 'newest';
  onSortByChange: (sort: 'trending' | 'downloads' | 'rating' | 'newest') => void;
  totalResultsCount: number;
  onResetFilters: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedUploader,
  onSelectUploader,
  availableUploaders,
  selectedFormat,
  onSelectFormat,
  sortBy,
  onSortByChange,
  totalResultsCount,
  onResetFilters,
}) => {
  const categories: ModelCategory[] = [
    'All',
    'Characters',
    'Environments',
    'Props',
    'Abstract',
    'Vehicles & Mechs',
    'Sci-Fi',
    '3D Printing',
  ];

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedUploader !== 'all' ||
    selectedFormat !== 'all' ||
    sortBy !== 'trending';

  return (
    <div className="space-y-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Search Input & Dropdowns Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Keywords Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search thousands of free 3D models by keyword, title, tag, or geometry..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Uploader Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={selectedUploader}
              onChange={(e) => onSelectUploader(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              <option value="all">All Uploaders</option>
              {availableUploaders.map((up) => (
                <option key={up.username} value={up.username}>
                  Creator: {up.name}
                </option>
              ))}
            </select>
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="w-2 h-2 border-r border-b border-slate-400 transform rotate-45 absolute right-3 top-1/2 -translate-y-2 pointer-events-none" />
          </div>

          {/* Format Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedFormat}
              onChange={(e) => onSelectFormat(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2.5 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 font-mono font-medium cursor-pointer"
            >
              <option value="all">Formats: All</option>
              <option value="GLTF">.GLTF</option>
              <option value="OBJ">.OBJ</option>
              <option value="STL">.STL</option>
            </select>
            <div className="w-2 h-2 border-r border-b border-slate-400 transform rotate-45 absolute right-3 top-1/2 -translate-y-2 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="appearance-none pl-8 pr-8 py-2.5 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              <option value="trending">Sort: Trending</option>
              <option value="downloads">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Recently Added</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="w-2 h-2 border-r border-b border-slate-400 transform rotate-45 absolute right-3 top-1/2 -translate-y-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Segmented Filter Tabs */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Counter and Clear Filters */}
        <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-400">
          <span>{totalResultsCount} Models</span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
