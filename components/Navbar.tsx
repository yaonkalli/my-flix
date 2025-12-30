import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, LogOut, Settings, Sparkles, ChevronDown, Film, Music, Layers, Zap, Download, WifiOff } from 'lucide-react';
import { useStore } from '../services/store';
import { usePWA } from '../hooks/usePWA';
import SettingsModal from './SettingsModal';

const Navbar: React.FC<{ onSearchClick?: () => void }> = ({ onSearchClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { isOnline, isInstallable, installApp } = usePWA();
  const { user, logout, currentProfile, isSettingsOpen, setSettingsOpen } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!currentProfile) return null;

  const navLinks = [
    { name: 'Accueil', path: '/browse' },
    { name: 'Séries', path: '/browse/series' },
    { name: 'Films', path: '/browse/movies' },
    { name: 'Musique', path: '/browse/music' },
    { name: 'Ma Liste', path: '/browse/list' },
    { name: 'Hors-ligne', path: '/offline' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out ${isScrolled || isMobileMenuOpen ? 'bg-[#141414] shadow-md' : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent'}`}>
        <div className="px-4 md:px-14 flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-4 md:gap-12">
            <Link to="/browse" className="text-netflix-red text-2xl md:text-4xl font-brand tracking-tighter hover:scale-105 transition-transform">
              MYFLIX
            </Link>

            <div className="hidden lg:flex gap-6 text-[13px]">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`transition-colors duration-200 font-medium hover:text-gray-300 ${location.pathname === link.path ? 'text-white' : 'text-gray-400'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {/* Status Offline */}
            {!isOnline && (
              <div className="flex items-center gap-2 bg-netflix-red/20 text-netflix-red px-2 py-1 rounded-full border border-netflix-red/30 animate-pulse">
                <WifiOff size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">Offline</span>
              </div>
            )}

            <Link to="/studio" className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full flex items-center gap-2 border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg group">
              <Sparkles className="w-3.5 h-3.5 md:w-4 h-4 text-netflix-red group-hover:rotate-12 transition-transform" />
              <span className="font-bold text-[10px] md:text-sm uppercase tracking-wider">Studio</span>
            </Link>

            <div className="flex items-center gap-3 md:gap-6">
              <Search
                className="w-5 h-5 text-white/70 cursor-pointer hover:text-white transition-colors"
                onClick={onSearchClick}
              />

              <div className="hidden md:block relative group">
                <Settings className="w-5 h-5 text-white/70 cursor-pointer hover:text-white hover:rotate-90 transition-all duration-500" onClick={() => setSettingsOpen(true)} />
              </div>

              <div className="relative group" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                <div className="flex items-center gap-2 cursor-pointer">
                  <img src={currentProfile.avatar} alt="Profile" className="w-8 h-8 md:w-9 md:h-9 rounded-md border border-white/20 shadow-xl" />
                  <ChevronDown className={`hidden md:block w-4 h-4 text-white/50 transition-transform duration-300 ${showDropdown ? 'rotate-180 text-white' : ''}`} />
                </div>

                <div className={`absolute right-0 top-full mt-0 pt-2 w-48 bg-zinc-900 shadow-2xl transition-all border border-white/5 rounded-2xl ${showDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="py-3 border-b border-white/5 px-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{currentProfile.name}</p>
                  </div>
                  <div className="p-1">
                    <button onClick={() => navigate('/profiles')} className="w-full px-4 py-3 text-left text-[11px] font-bold hover:bg-white/5 rounded-xl transition text-white/70 hover:text-white uppercase tracking-widest">Changer Profil</button>
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full px-4 py-3 text-left text-[11px] font-black hover:bg-netflix-red/10 rounded-xl transition text-netflix-red uppercase tracking-widest">Déconnexion</button>
                  </div>
                </div>
              </div>

              <div className="lg:hidden text-white/70 hover:text-white cursor-pointer transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </div>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[64px] bg-black/98 backdrop-blur-3xl px-8 py-12 animate-fade-in z-[150]" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex flex-col h-full max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>

              <nav className="flex flex-col gap-8 pt-10">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-3xl font-black uppercase tracking-[0.2em] italic transition-all ${isActive ? 'text-white' : 'text-zinc-700 hover:text-zinc-500'}`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto space-y-8 pb-10">
                <button
                  onClick={() => { setSettingsOpen(true); setIsMobileMenuOpen(false); }}
                  className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors flex items-center gap-4"
                >
                  <Settings size={18} /> Réglages
                </button>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-xs font-black uppercase tracking-[0.3em] text-netflix-red hover:text-red-500 transition-colors flex items-center gap-4"
                >
                  <LogOut size={18} /> Quitter
                </button>
              </div>
            </div>
          </div>
        )}


      </nav>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default Navbar;
