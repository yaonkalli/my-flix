import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Menu, X, LogOut, Settings, Sparkles, ChevronDown, Film, Music, Layers, Zap, Download, WifiOff } from 'lucide-react';
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
        <div className="px-6 md:px-14 flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-8 md:gap-12">
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

          <div className="flex items-center gap-3 md:gap-6">
            {/* Status Offline */}
            {!isOnline && (
              <div className="flex items-center gap-2 bg-netflix-red/20 text-netflix-red px-3 py-1.5 rounded-full border border-netflix-red/30 animate-pulse">
                <WifiOff size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Hors-ligne</span>
              </div>
            )}



            <Link to="/studio" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center gap-2 border border-white/20 transition-all">
              <Sparkles className="w-3.5 h-3.5 md:w-4 h-4" />
              <span className="font-medium text-[10px] md:text-xs">Studio</span>
            </Link>

            <div className="flex items-center gap-4">
              <Search
                className="w-5 h-5 text-white cursor-pointer hover:text-gray-300 transition"
                onClick={onSearchClick}
              />
              <Bell className="w-5 h-5 text-white cursor-pointer hover:text-gray-300 transition" />

              <div className="relative group">
                <Settings className="w-5 h-5 text-white cursor-pointer hover:animate-spin-slow transition" onClick={() => setSettingsOpen(true)} />
              </div>

              <div className="relative group" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                <div className="flex items-center gap-2 cursor-pointer">
                  <img src={currentProfile.avatar} alt="Profile" className="w-8 h-8 rounded-sm border border-white/10" />
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                </div>

                <div className={`absolute right-0 top-full mt-0 pt-2 w-48 bg-black/95 backdrop-blur-md border border-white/10 shadow-2xl transition-all ${showDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="py-2 border-b border-white/10 px-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Profil: {currentProfile.name}</p>
                  </div>
                  <button onClick={() => { logout(); navigate('/'); }} className="w-full p-4 text-left text-xs font-bold hover:underline transition">Déconnexion de Myflix</button>
                </div>
              </div>

              <div className="lg:hidden text-white cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </div>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[64px] bg-black/95 backdrop-blur-3xl px-8 py-12 animate-fade-in z-[150]" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
              {/* Profile Header in Mobile Menu */}
              <div className="flex items-center gap-5 mb-12 pb-8 border-b border-white/10">
                <div className="relative">
                  <img src={currentProfile.avatar} alt="" className="w-16 h-16 rounded-xl border-2 border-netflix-red shadow-2xl" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-netflix-red rounded-full border-2 border-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black italic tracking-tighter leading-none mb-1">Salut, {currentProfile.name} !</h3>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Session Myflix Active</p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {navLinks.map((link) => {
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-6 group transition-all ${location.pathname === link.path ? 'scale-105' : 'hover:translate-x-2'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${location.pathname === link.path ? 'bg-netflix-red text-white shadow-[0_0_30px_rgba(229,9,20,0.5)] scale-110' : 'bg-zinc-900 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white'}`}>
                        {link.name === 'Accueil' && <Sparkles size={26} />}
                        {link.name === 'Séries' && <Layers size={26} />}
                        {link.name === 'Films' && <Film size={26} />}
                        {link.name === 'Musique' && <Music size={26} />}
                        {link.name === 'Ma Liste' && <Bell size={26} />}
                      </div>
                      <span className={`text-2xl font-black uppercase tracking-tighter ${location.pathname === link.path ? 'text-white' : 'text-zinc-500'}`}>
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto space-y-4 pt-10 border-t border-white/5">
                <button
                  onClick={() => { setSettingsOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between bg-zinc-900/40 hover:bg-zinc-900 p-5 rounded-2xl border border-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4 text-zinc-400 font-bold uppercase text-[10px] tracking-widest group-hover:text-white transition-colors">
                    <Settings size={20} /> Paramètres
                  </div>
                  <ChevronDown className="-rotate-90 w-4 h-4 opacity-30" />
                </button>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="w-full flex items-center justify-between bg-netflix-red/5 hover:bg-netflix-red/10 p-5 rounded-2xl border border-netflix-red/20 transition-all group"
                >
                  <div className="flex items-center gap-4 text-netflix-red font-bold uppercase text-[10px] tracking-widest">
                    <LogOut size={20} /> Déconnexion
                  </div>
                  <ChevronDown className="-rotate-90 w-4 h-4 opacity-30" />
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
