
import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Movie } from '../types';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  movie: Movie;
  variant?: 'cinema' | 'music';
  onOpenModal?: (movie: Movie) => void;
}

const Hero: React.FC<HeroProps> = ({ movie, variant = 'cinema', onOpenModal }) => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (variant === 'cinema' && movie.videoUrl) {
      timer = setTimeout(() => setShowVideo(true), 3000);
    }
    return () => clearTimeout(timer);
  }, [movie, variant]);

  return (
    <div className={`relative ${variant === 'music' ? 'h-[70vh]' : 'h-[85vh] md:h-[100vh]'} w-full bg-[#141414] overflow-hidden group`}>
      {/* Background Media */}
      <div className="absolute inset-0 w-full h-full">
        {showVideo && movie.videoUrl ? (
          <div className="w-full h-full relative animate-fade-in">
            <video
              ref={videoRef}
              src={movie.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted={isMuted}
              loop
              poster={movie.backdropUrl}
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        ) : (
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-top md:object-center transition-transform duration-[20s] scale-100 group-hover:scale-110"
          />
        )}

        {/* Cinematic Gradients - Netflix Style */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 z-20 pointer-events-none pb-12 md:pb-20 pt-32">
        <div className="max-w-4xl space-y-6 md:space-y-8 animate-fade-in pointer-events-auto">

          {movie.recommendationReason && (
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-3xl border border-white/10 px-5 py-2 rounded-full w-fit animate-fade-in-down shadow-2xl border-l-netflix-red border-l-2">
              <Sparkles size={14} className="text-netflix-red" />
              <p className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-widest">
                {movie.recommendationReason}
              </p>
            </div>
          )}

          {/* Title - Refined for better mobile fit */}
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase italic leading-[0.85] tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {movie.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 md:gap-5 text-[11px] md:text-lg font-bold text-white/70">
            <span className="text-[#46d369]">{movie.matchPercentage}% Adoré</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>{movie.year}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="border border-white/20 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest">{movie.rating}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>{movie.duration}</span>
          </div>

          {/* Description */}
          <p className="hidden md:block text-xl text-white/60 line-clamp-2 font-medium max-w-2xl leading-relaxed">
            {movie.description}
          </p>

          {/* Buttons - Round Full & Minimalist */}
          <div className="flex flex-wrap items-center gap-3 pt-6">
            <button
              onClick={() => navigate(`/watch/${movie.id}`)}
              className="bg-white text-black px-8 py-3.5 md:px-12 md:py-5 rounded-full font-black text-xs md:text-lg uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
            >
              <Play className="w-4 h-4 md:w-6 md:h-6 fill-black" /> Lecture
            </button>

            <button
              onClick={() => onOpenModal && onOpenModal(movie)}
              className="bg-white/10 text-white px-8 py-3.5 md:px-12 md:py-5 rounded-full font-black text-xs md:text-lg uppercase tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all backdrop-blur-xl border border-white/10 active:scale-95 shadow-2xl"
            >
              <Info className="w-4 h-4 md:w-6 md:h-6" /> Détails
            </button>
          </div>
        </div>
      </div>

      {/* Minimalist Audio Control */}
      {showVideo && (
        <div className="absolute right-6 bottom-32 md:right-16 md:bottom-24 flex items-center z-30 animate-fade-in">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-3xl text-white/50 hover:text-white transition-all flex items-center justify-center active:scale-90 shadow-2xl group"
          >
            {isMuted ? <VolumeX size={18} className="md:w-6 md:h-6" /> : <Volume2 size={18} className="md:w-6 md:h-6" />}
            <div className="absolute inset-0 rounded-full bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Hero;
