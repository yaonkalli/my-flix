
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Row from '../components/Row';
import InfoModal from '../components/InfoModal';
import AISearchModal from '../components/AISearchModal';
import { useStore } from '../services/store';
import { MOCK_MOVIES } from '../services/mockData';
import { Movie } from '../types';
import {
   Activity, Play, ListMusic, Plus, Zap, Music as MusicIcon,
   Settings, Layers, TrendingUp, Sparkles, PlusCircle, Film
} from 'lucide-react';



const Home: React.FC = () => {
   const { category } = useParams<{ category: string }>();
   const {
      customContent,
      setActiveTrack,
      setIsPlaying,
      currentProfile,
      playlists,
      createPlaylist,
      myList,
      viewProgress,
      geminiKey
   } = useStore();
   const navigate = useNavigate();

   const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
   const [isSearchOpen, setIsSearchOpen] = useState(false);

   // Combine mocks and custom content
   const allMedia = useMemo(() => [...MOCK_MOVIES, ...customContent], [customContent]);

   // CORRECTION CRITIQUE : Collections IA désactivées pour éviter la consommation automatique de tokens
   // Les collections peuvent être générées manuellement si nécessaire

   const continueWatching = useMemo(() => {
      if (!currentProfile) return [];
      return allMedia.filter(m => {
         const key = `${currentProfile.id}_${m.id}`;
         return !!viewProgress[key];
      });
   }, [allMedia, viewProgress, currentProfile]);

   const [activeFilter, setActiveFilter] = useState('Tous');
   const [heroIndex, setHeroIndex] = useState(() => Math.floor(Math.random() * 5));

   // 1. Hooks MUST be at the top level

   // Reset filter when category changes
   useEffect(() => {
      setActiveFilter('Tous');
   }, [category]);

   // Auth Guard: Redirect to profiles if no profile selected
   useEffect(() => {
      if (!currentProfile) {
         navigate('/profiles');
      }
   }, [currentProfile, navigate]);

   // Get unique artists from music library
   const artists = useMemo(() => {
      const musicTracks = customContent.filter(m => m.type === 'music');
      const uniqueArtists = Array.from(new Set(musicTracks.map(m => m.artist || 'Artiste Inconnu').filter(Boolean)));
      return ['Tous', ...uniqueArtists];
   }, [customContent]);

   // Derive current media based on category and filter
   const currentMedia = useMemo(() => {
      let baseFiltered = allMedia;
      if (category === 'music') {
         baseFiltered = allMedia.filter(m => m.type === 'music');
      } else if (category === 'movies') {
         baseFiltered = allMedia.filter(m => m.type === 'movie');
      } else if (category === 'series') {
         baseFiltered = allMedia.filter(m => m.type === 'series');
      } else if (category === 'list') {
         baseFiltered = allMedia.filter(m => myList.includes(m.id));
      }

      if (category === 'music' && activeFilter !== 'Tous') {
         return baseFiltered.filter(m => (m.artist || 'Artiste Inconnu') === activeFilter);
      }
      return baseFiltered;
   }, [allMedia, category, activeFilter, myList]);

   // Auto-rotate hero every 8 seconds
   useEffect(() => {
      if (currentMedia.length > 1) {
         const interval = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % Math.min(currentMedia.length, 10));
         }, 8000);
         return () => clearInterval(interval);
      }
   }, [currentMedia.length, category]);

   // 2. Early return AFTER all hooks
   if (!currentProfile) return null;

   const handlePlayMedia = (m: any) => {
      if (m.type === 'music') {
         setActiveTrack(m);
         setIsPlaying(true);
      } else {
         navigate(`/watch/${m.id}`);
      }
   };

   // 3. Render Logic

   const isEmpty = currentMedia.length === 0;

   // Render Music Section
   if (category === 'music') {
      return (
         <div className="bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 min-h-screen pb-20 text-white">
            <Navbar onSearchClick={() => setIsSearchOpen(true)} />

            {isEmpty ? (
               <div className="h-screen flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                     <MusicIcon size={36} className="text-white/40" />
                  </div>
                  <h2 className="text-3xl font-semibold mb-3">Aucune musique</h2>
                  <p className="text-white/50 max-w-md mb-8 text-sm">Importe tes morceaux depuis le Studio pour commencer à écouter.</p>
                  <Link to="/studio" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform flex items-center gap-2">
                     Ouvrir le Studio <Sparkles size={16} />
                  </Link>
               </div>
            ) : (
               <div className="pt-20 px-6 md:px-12 max-w-[1400px] mx-auto">
                  <div className="mb-10 pt-8">
                     <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Musique</h1>
                     <p className="text-white/50 text-lg">{currentMedia.length} morceaux</p>
                  </div>

                  <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                     {artists.map(artist => (
                        <button
                           key={artist}
                           onClick={() => setActiveFilter(artist)}
                           className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === artist ? 'bg-white text-black shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-sm'
                              }`}
                        >
                           {artist}
                        </button>
                     ))}
                  </div>

                  {currentMedia.length > 0 && (
                     <div className="mb-8">
                        <button
                           onClick={() => handlePlayMedia(currentMedia[0])}
                           className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-3 shadow-xl"
                        >
                           <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                              <Play size={14} fill="white" className="text-white ml-0.5" />
                           </div>
                           Lecture
                        </button>
                     </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                     {currentMedia.map((m) => (
                        <div key={m.id} className="group cursor-pointer" onClick={() => handlePlayMedia(m)}>
                           <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-white/5 shadow-lg">
                              <img src={m.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={m.title} />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <Play size={20} fill="black" className="text-black ml-1" />
                                 </div>
                              </div>
                           </div>
                           <h3 className="font-medium text-base truncate mb-1 group-hover:underline">{m.title}</h3>
                           <p className="text-sm text-white/50 truncate">{m.artist}</p>
                        </div>
                     ))}
                  </div>

                  <div className="mt-16">
                     <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Mes Playlists</h2>
                        <button onClick={() => { const name = prompt('Nom de la playlist :'); if (name) createPlaylist(name); }} className="text-white/70 hover:text-white flex items-center gap-2 text-sm transition-colors">
                           <PlusCircle size={18} /> Nouvelle playlist
                        </button>
                     </div>
                     {playlists.length === 0 ? (
                        <div className="bg-white/5 rounded-2xl p-12 text-center border border-dashed border-white/10">
                           <p className="text-white/40 text-sm">Crée ta première playlist pour organiser tes morceaux.</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                           {playlists.map(p => (
                              <div key={p.id} className="group cursor-pointer">
                                 <div className="aspect-square bg-white/5 rounded-2xl mb-4 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all relative">
                                    <ListMusic size={40} className="text-white/20 group-hover:text-white/40 transition-colors" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl"><Play size={20} fill="black" className="text-black ml-1" /></div>
                                    </div>
                                 </div>
                                 <h4 className="font-medium text-sm truncate">{p.name}</h4>
                                 <p className="text-xs text-white/40">{p.trackIds.length} titres</p>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>

                  <div className="mt-16 pt-8 border-t border-white/10 flex gap-4">
                     <button onClick={() => navigate('/studio')} className="bg-white text-black px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform flex items-center gap-2">
                        <PlusCircle size={18} /> Ajouter de la musique
                     </button>
                  </div>
               </div>
            )}
         </div>
      );
   }

   // Default Render (Movies/Series/Home/List)
   return (
      <div className="bg-netflix-black min-h-screen pb-40 overflow-x-hidden">
         <Navbar onSearchClick={() => setIsSearchOpen(true)} />
         {isEmpty ? (
            <div className="h-[80vh] flex flex-col items-center justify-center text-center px-6 animate-fade-in">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-8">
                  <Film size={32} className="text-zinc-500" />
               </div>
               <h2 className="text-4xl font-bold mb-4">Votre bibliothèque est vide</h2>
               <p className="text-zinc-500 max-w-sm mx-auto text-sm mb-12">
                  Importez vos propres films et morceaux depuis le Studio pour commencer.
               </p>
               <Link to="/studio" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-netflix-red hover:text-white transition-all">
                  Ouvrir le Studio
               </Link>
            </div>
         ) : (
            <>
               {currentMedia.length > 0 && (
                  <Hero
                     movie={currentMedia[heroIndex % currentMedia.length]}
                     variant="cinema"
                     onOpenModal={setSelectedMovie}
                  />
               )}
               <div className="-mt-8 md:-mt-12 relative z-20 space-y-24 md:space-y-40">
                  {continueWatching.length > 0 && (
                     <Row title="Reprendre la lecture" movies={continueWatching} variant="tall" onOpenModal={setSelectedMovie} />
                  )}
                  {category === 'movies' && <Row title="Films" movies={currentMedia} variant="tall" onOpenModal={setSelectedMovie} />}
                  {category === 'series' && <Row title="Séries" movies={currentMedia} variant="tall" onOpenModal={setSelectedMovie} />}
                  {category === 'list' && <Row title="Ma Liste" movies={currentMedia} variant="tall" onOpenModal={setSelectedMovie} />}
                  {!category && (
                     <>
                        <Row title="Populaires sur Myflix" movies={allMedia.slice(0, 10)} variant="tall" onOpenModal={setSelectedMovie} />
                        <Row title="Films" movies={allMedia.filter(m => m.type === 'movie')} variant="tall" onOpenModal={setSelectedMovie} />
                        <Row title="Séries" movies={allMedia.filter(m => m.type === 'series')} variant="tall" onOpenModal={setSelectedMovie} />
                     </>
                  )}
               </div>

               <InfoModal
                  movie={selectedMovie}
                  onClose={() => setSelectedMovie(null)}
                  onPlay={handlePlayMedia}
               />
               <AISearchModal
                  isOpen={isSearchOpen}
                  onClose={() => setIsSearchOpen(false)}
                  onOpenInfo={(m) => { setIsSearchOpen(false); setSelectedMovie(m); }}
               />
            </>
         )}
      </div>
   );
};

export default Home;
