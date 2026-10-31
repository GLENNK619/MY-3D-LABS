import React from 'react';
import { ExternalLink, Globe, Sparkles, Box, Printer, Cpu, Compass } from 'lucide-react';

interface WebsiteItem {
  id: string;
  name: string;
  url: string;
  category: 'Modeling & Tools' | '3D Printing' | 'Showcase & Portfolios' | 'Game & Engine Assets';
  description: string;
  badge: string;
  popularFor: string;
}

export const EcosystemWebsitesSection: React.FC = () => {
  const websites: WebsiteItem[] = [
    {
      id: 'blender',
      name: 'Blender.org',
      url: 'https://www.blender.org',
      category: 'Modeling & Tools',
      description: 'The free and open-source 3D creation pipeline supporting modeling, rigging, animation, simulation, rendering, compositing, and video editing.',
      badge: 'Open Source',
      popularFor: 'Importing & editing our downloaded .OBJ & .GLTF models',
    },
    {
      id: 'sketchfab',
      name: 'Sketchfab',
      url: 'https://sketchfab.com',
      category: 'Showcase & Portfolios',
      description: 'The premier platform to publish, share, and discover interactive 3D, VR, and AR content directly in the browser.',
      badge: 'WebGL Platform',
      popularFor: 'Real-time 3D viewers and portfolio embeddings',
    },
    {
      id: 'makerworld',
      name: 'Bambu Lab MakerWorld',
      url: 'https://makerworld.com',
      category: '3D Printing',
      description: 'Next-generation 3D printing model repository featuring direct 1-click cloud slicing for Bambu Lab X1, P1, and A1 series.',
      badge: 'Slicing & STL',
      popularFor: 'One-click wireless printing of our watertight STL models',
    },
    {
      id: 'printables',
      name: 'Printables (by Prusa)',
      url: 'https://www.printables.com',
      category: '3D Printing',
      description: 'Prusa Research community hub hosting thousands of verified, test-printed models, maker competitions, and printer profiles.',
      badge: 'Verified Prints',
      popularFor: 'Tested filament prints, print contests, and G-code',
    },
    {
      id: 'thingiverse',
      name: 'Thingiverse',
      url: 'https://www.thingiverse.com',
      category: '3D Printing',
      description: 'The pioneering open hardware and 3D printing community dedicated to open-source sharing and maker innovation.',
      badge: 'Open Hardware',
      popularFor: 'Massive library of maker hacks, brackets, and prototypes',
    },
    {
      id: 'artstation',
      name: 'ArtStation',
      url: 'https://www.artstation.com',
      category: 'Showcase & Portfolios',
      description: 'The gold standard portfolio platform for digital artists, 3D character sculptors, environment modelers, and VFX leads.',
      badge: 'Artist Network',
      popularFor: 'Professional 3D game portfolios and concept art',
    },
    {
      id: 'poly-pizza',
      name: 'Poly Pizza',
      url: 'https://poly.pizza',
      category: 'Game & Engine Assets',
      description: 'Searchable repository of free, low-poly 3D models with CC-BY and CC0 licenses designed for indie games and web experiences.',
      badge: 'Low-Poly',
      popularFor: 'Lightweight assets for Three.js, Godot, and Unity',
    },
    {
      id: 'fab',
      name: 'Fab (by Epic Games)',
      url: 'https://www.fab.com',
      category: 'Game & Engine Assets',
      description: 'Epic Games unified digital marketplace bringing together Unreal Engine Marketplace, Sketchfab Store, Quixel, and ArtStation Marketplace.',
      badge: 'Game Engines',
      popularFor: 'Unreal Engine 5 and cinematic Nanite assets',
    },
  ];

  return (
    <section className="space-y-6 pt-6 border-t border-slate-800" id="ecosystem">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Connected 3D Web
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            3D Ecosystem & Platform Directory
          </h2>
          <p className="text-xs text-slate-400">
            Open-access links to leading external 3D software suites, printing slicers, asset repositories, and artist communities.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          {websites.length} Curated Platforms
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {websites.map((site) => (
          <a
            key={site.id}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-0.5"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                  {site.badge}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  {site.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {site.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {site.description}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
              <strong className="text-slate-300 block mb-0.5">Recommended for:</strong>
              <span className="text-slate-400 line-clamp-2">{site.popularFor}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
