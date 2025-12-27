
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import Visualizer from '../components/Visualizer';
import { MOCK_MOVIES } from '../services/mockData';
import { useStore } from '../services/store';
import { Episode } from '../types';
import {
   ArrowLeft, Music, ListMusic, Play, Pause, SkipBack, SkipForward,
   Volume2, Shuffle, Repeat, Activity, MoreHorizontal, X, Heart, Sparkles, Mic2, Disc
} from 'lucide-react';

const Player: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const { customContent, isInMyList, addToMyList, removeFromMyList, getProgress, saveProgress } = useStore();
   const allMedia = useMemo(() => [...MOCK_MOVIES, ...customContent], [customContent]);
   const movie = allMedia.find(m => m.id === id);

   // Gestion des épisodes pour les séries
   const seasonNumber = searchParams.get('season') ? parseInt(searchParams.get('season')!) : null;
   const episodeNumber = searchParams.get('episode') ? parseInt(searchParams.get('episode')!) : null;

   let currentEpisode: Episode | null = null;
   if (movie?.type === 'series' && seasonNumber && episodeNumber && movie.seasons) {
      const season = movie.seasons.find(s => s.number === seasonNumber);
      currentEpisode = season?.episodes.find(e => e.number === episodeNumber) || null;
   }

   const audioRef = useRef<HTMLAudioElement>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [currentTime, setCurrentTime] = useState(0);
   const [duration, setDuration] = useState(0);
   const [showQueue, setShowQueue] = useState(false);

   // Initial load of progress
   const initialProgress = useMemo(() => id ? getProgress(id) : null, [id, getProgress]);

   useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      // Set starting time if music
      if (movie?.type === 'music' && initialProgress && initialProgress.time > 0) {
         audio.currentTime = initialProgress.time;
      }

      const updateTime = () => {
         setCurrentTime(audio.currentTime);
      };
      const updateDuration = () => setDuration(audio.duration);
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      return () => {
         audio.removeEventListener('timeupdate', updateTime);
         audio.removeEventListener('loadedmetadata', updateDuration);
      };
   }, [movie, initialProgress]);

   // Periodic save (every 5 seconds)
   useEffect(() => {
      if (!isPlaying || !id) return;
      const interval = setInterval(() => {
         if (currentTime > 10 && currentTime < (duration - 10)) {
            saveProgress(id, currentTime, duration);
         } else if (currentTime >= (duration - 10) && duration > 0) {
            saveProgress(id, 0, duration); // Reset if near end
         }
      }, 5000);
      return () => clearInterval(interval);
   }, [isPlaying, id, currentTime, duration, saveProgress]);

   if (!movie) return <div className="text-white text-center mt-20 font-black uppercase tracking-widest">Master not found</div>;

   const togglePlay = async () => {
      if (!audioRef.current) return;
      try {
         if (audioRef.current.paused) await audioRef.current.play();
         else audioRef.current.pause();
      } catch (err) { console.warn("Audio error:", err); }
   };

   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      if (audioRef.current) {
         audioRef.current.currentTime = time;
         setCurrentTime(time);
      }
   };

   const formatTime = (time: number) => {
      const min = Math.floor(time / 60);
      const sec = Math.floor(time % 60);
      return `${min}:${sec.toString().padStart(2, '0')}`;
   };

   if (movie.type === 'music') {
      return (
         <div className="bg-[#050505] w-full h-screen flex flex-col items-center justify-center relative overflow-hidden selection:bg-netflix-red font-sans">

            {/* ULTRA-IMMERSIVE DYNAMIC BACKGROUND */}
            <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-netflix-red/10 blur-[200px] animate-pulse" />
               <img src={movie.thumbnailUrl} className="w-full h-full object-cover blur-[120px] opacity-30 scale-150 animate-slow-zoom" alt="" />
               <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]" />
               <Visualizer audioRef={audioRef} isPlaying={isPlaying} />
            </div>

            {/* TOP INTERFACE */}
            <div className="absolute top-0 left-0 right-0 h-32 flex items-center justify-between px-12 z-50">
               <button onClick={() => navigate(-1)} className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                     <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-1">Studio Player</span>
                     <span className="text-[9px] font-bold text-netflix-red uppercase tracking-widest">Lossless Hi-Fi Render</span>
                  </div>
               </button>

               <div className="flex items-center gap-4">
                  <button
                     onClick={() => setShowQueue(!showQueue)}
                     className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${showQueue ? 'bg-netflix-red text-white' : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10'}`}
                  >
                     <ListMusic size={14} /> File d'attente
                  </button>
               </div>
            </div>

            <div className="z-10 flex flex-col lg:flex-row items-center gap-20 max-w-7xl w-full px-12 pt-20">

               {/* COVER ART AREA */}
               <div className={`relative transition-all duration-1000 ${showQueue ? 'lg:w-1/3' : 'lg:w-1/2'} flex justify-center`}>
                  <div className="relative group">
                     {/* Adaptive Glow */}
                     <div className="absolute -inset-10 bg-netflix-red/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                     <div className={`relative aspect-square overflow-hidden rounded-[60px] shadow-[0_60px_150px_rgba(0,0,0,0.9)] border border-white/10 transition-all duration-1000 ${showQueue ? 'w-80' : 'w-[500px]'}`}>
                        <img
                           src={movie.thumbnailUrl}
                           className={`w-full h-full object-cover transition-transform duration-[10s] ${isPlaying ? 'scale-110 rotate-1' : 'scale-100'}`}
                           alt={movie.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>

                     {/* Floating Badges */}
                     <div className="absolute -bottom-6 -right-6 flex flex-col gap-3">
                        <div className="bg-zinc-900/90 backdrop-blur-3xl border border-white/10 p-5 rounded-[25px] shadow-2xl animate-pop-out">
                           <Disc className={`w-6 h-6 ${isPlaying ? 'text-netflix-red animate-spin-slow' : 'text-zinc-600'}`} />
                        </div>
                        {movie.isCustom && (
                           <div className="bg-netflix-red p-5 rounded-[25px] shadow-2xl flex items-center justify-center">
                              <Sparkles size={20} className="text-white" />
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* TRACK INFO & CONTROLS */}
               <div className={`w-full ${showQueue ? 'lg:w-1/3' : 'lg:w-1/2'} space-y-12 transition-all duration-1000`}>
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 border border-white/5">Digital Master</span>
                           <span className="px-3 py-1 bg-netflix-red/10 rounded-full text-[8px] font-black uppercase tracking-[0.3em] text-netflix-red border border-netflix-red/10">Hi-Res</span>
                        </div>
                        <h1 className={`${showQueue ? 'text-5xl' : 'text-7xl md:text-8xl'} font-black text-white uppercase tracking-tighter italic leading-[0.85] transition-all`}>
                           {movie.title}
                        </h1>
                        <div className="flex flex-col gap-2 pt-2">
                           <div className="flex items-center gap-3 group cursor-pointer">
                              <Mic2 size={16} className="text-netflix-red" />
                              <p className="text-2xl font-black uppercase tracking-tight text-white/90 group-hover:text-netflix-red transition-colors">{movie.artist || "Artiste Inconnu"}</p>
                           </div>
                           <div className="flex items-center gap-3 opacity-60">
                              <Activity size={14} className="text-zinc-500" />
                              <p className="text-xs font-black uppercase tracking-widest italic text-zinc-400">Produced by {movie.composer || "Studio Master"}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* TRANSPORT BAR */}
                  <div className="space-y-12">
                     <audio ref={audioRef} src={movie.videoUrl} autoPlay />

                     <div className="space-y-6">
                        <div className="relative group/range h-2">
                           <input
                              type="range"
                              min="0"
                              max={duration || 100}
                              value={currentTime}
                              onChange={handleSeek}
                              className="absolute inset-0 w-full h-full bg-white/5 rounded-full appearance-none cursor-pointer accent-netflix-red z-10"
                           />
                           <div className="absolute inset-0 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-netflix-red transition-all shadow-[0_0_15px_rgba(229,9,20,0.8)]" style={{ width: `${(currentTime / duration) * 100}%` }} />
                           </div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase">
                           <span>{formatTime(currentTime)}</span>
                           <span>{formatTime(duration)}</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between">
                        <button className="text-zinc-600 hover:text-white transition-all"><Shuffle size={20} /></button>
                        <button className="text-white/80 hover:text-white transition-all hover:scale-110"><SkipBack size={32} fill="currentColor" /></button>

                        <button
                           onClick={togglePlay}
                           className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 hover:bg-netflix-red hover:text-white transition-all shadow-[0_20px_60px_rgba(0,0,0,0.5)] active:scale-95 group/play"
                        >
                           {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
                        </button>

                        <button className="text-white/80 hover:text-white transition-all hover:scale-110"><SkipForward size={32} fill="currentColor" /></button>
                        <button
                           onClick={() => isInMyList(movie.id) ? removeFromMyList(movie.id) : addToMyList(movie.id)}
                           className={`transition-all hover:scale-110 ${isInMyList(movie.id) ? 'text-netflix-red' : 'text-zinc-600 hover:text-white'}`}
                        >
                           <Heart size={24} fill={isInMyList(movie.id) ? "currentColor" : "none"} />
                        </button>
                     </div>

                     <div className="flex items-center justify-between pt-12 border-t border-white/5">
                        <div className="flex items-center gap-6 flex-1 max-w-xs">
                           <Volume2 size={18} className="text-zinc-500" />
                           <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-zinc-700 w-3/4" />
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <button className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition"><Repeat size={18} /></button>
                           <button className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition"><MoreHorizontal size={18} /></button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* FINE TECH QUEUE */}
               {showQueue && (
                  <div className="w-full lg:w-1/3 h-[700px] bg-black/40 backdrop-blur-3xl rounded-[50px] border border-white/10 p-12 flex flex-col shadow-2xl animate-pop-out overflow-hidden relative">
                     <div className="flex items-center justify-between mb-12 shrink-0">
                        <h3 className="text-sm font-black uppercase tracking-[0.5em] text-white italic">Master Session</h3>
                        <button onClick={() => setShowQueue(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
                     </div>
                     <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                        {allMedia.filter(m => m.type === 'music' && m.id !== id).map((m, i) => (
                           <div
                              key={`queue-${m.id}`}
                              className="flex items-center gap-6 group cursor-pointer p-4 rounded-3xl hover:bg-white/5 transition-all duration-500"
                              onClick={() => navigate(`/watch/${m.id}`)}
                           >
                              <span className="text-xs font-black text-zinc-800 italic group-hover:text-netflix-red transition-colors">0{i + 1}</span>
                              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                                 <img src={m.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="font-black text-xs uppercase truncate tracking-tighter leading-none mb-1">{m.title}</p>
                                 <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest truncate">{m.artist}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

            </div>
         </div>
      );
   }

   // Pour les séries, utiliser l'épisode actuel
   const videoSource = currentEpisode?.videoUrl || movie.videoUrl;
   const videoPoster = currentEpisode?.thumbnailUrl || movie.backdropUrl;

   // Récupérer tous les épisodes de la saison actuelle pour le sélecteur
   const currentSeasonEpisodes = movie.type === 'series' && seasonNumber && movie.seasons
      ? movie.seasons.find(s => s.number === seasonNumber)?.episodes || []
      : [];

   const handleEpisodeClick = (episode: Episode) => {
      navigate(`/watch/${movie.id}?season=${seasonNumber}&episode=${episode.number}`);
   };

   return (
      <div className="bg-black w-full h-screen">
         <VideoPlayer
            src={videoSource}
            poster={videoPoster}
            title={currentEpisode ? `${movie.title} - S${seasonNumber}E${currentEpisode.number}` : movie.title}
            initialTime={initialProgress?.time || 0}
            onTimeUpdate={(t, d) => {
               setCurrentTime(t);
               setDuration(d);
            }}
            chapters={currentEpisode?.chapters || movie.chapters}
            episodes={currentSeasonEpisodes}
            currentEpisodeId={currentEpisode?.id}
            onEpisodeClick={handleEpisodeClick}
         />
      </div>
   );
};

export default Player;
