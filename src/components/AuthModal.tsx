import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, Download, UploadCloud, Sparkles, User, Mail, Lock } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalReason, closeAuthModal, login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);

  // Form inputs
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('3D Character & Hard Surface');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (!email.trim() || !displayName.trim()) return;
      signup({
        displayName: displayName.trim(),
        username: username.trim() || displayName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        email: email.trim(),
        bio: bio.trim() || '3D creator and community member at MY 3D LABS.',
        specialty,
      });
    } else {
      if (!email.trim()) return;
      login(email.trim(), displayName || undefined, username || undefined);
    }
  };

  const handleQuickDemoLogin = () => {
    login('mairongglenn619@gmail.com', 'Glenn Mairong', 'glen_3dlab');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              MY 3D LABS ACCOUNT
            </span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create Your 3D Labs Account' : 'Sign In to MY 3D LABS'}
          </h3>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {authModalReason || 'Join our global 3D artist community to download free models, save custom galleries, and upload your own creations.'}
          </p>
        </div>

        {/* Benefits Strip */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Free Downloads
          </span>
          <span className="flex items-center gap-1">
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" /> Model Uploads
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Saved Galleries
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Quick Demo Test Access Button */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
          >
            <Sparkles className="w-4 h-4 text-slate-900" />
            Instant Sign In as Glenn Mairong (Demo)
          </button>

          <div className="flex items-center gap-3 my-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[10px] uppercase font-mono text-slate-500">or enter details</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Glenn Mairong"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. glen_3dlab"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Primary 3D Specialty
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Characters & Sculpting">Characters & Sculpting</option>
                    <option value="Environments & Architecture">Environments & Architecture</option>
                    <option value="Props & Weapons">Props & Weapons</option>
                    <option value="3D Printing & STL">3D Printing & STL</option>
                    <option value="Abstract & Parametric">Abstract & Parametric</option>
                    <option value="Vehicles & Hard Surface">Vehicles & Hard Surface</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                defaultValue="password123"
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              {isSignUp ? 'Create Free Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account yet? Create one for free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
