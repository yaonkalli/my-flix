
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
      <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 z-20 pointer-events-none pb-8 md:pb-16 pt-32">
        <div className="max-w-4xl space-y-4 md:space-y-6 animate-fade-in pointer-events-auto">

          {movie.recommendationReason && (
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl border border-white/10 px-6 py-2.5 rounded-2xl w-fit animate-fade-in-down shadow-[0_20px_50px_rgba(0,0,0,0.5)] group/reco border-l-netflix-red border-l-2">
              <div className="relative">
                <Sparkles size={18} className="text-netflix-red animate-pulse" />
                <div className="absolute inset-0 bg-netflix-red blur-xl opacity-20 scale-150 animate-pulse" />
              </div>
              <p className="text-white/90 text-[13px] md:text-sm font-black italic tracking-tight uppercase">
                {movie.recommendationReason}
              </p>
            </div>
          )}

          {/* Title - Reduced size for better fitting */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase leading-[0.9] tracking-tight drop-shadow-2xl">
            {movie.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex items-center gap-4 text-sm md:text-lg font-medium text-white shadow-black drop-shadow-md">
            <span className="text-[#46d369] font-bold">{movie.matchPercentage}% recommandé</span>
            <span className="text-gray-300">{movie.year}</span>
            <span className="border border-gray-400 px-2 py-0.5 text-xs rounded-sm bg-black/20 backdrop-blur-sm uppercase">{movie.rating}</span>
            <span className="text-gray-300">{movie.duration}</span>
          </div>

          {/* Description */}
          <p className="hidden md:block text-base md:text-xl text-white shadow-black drop-shadow-md line-clamp-2 font-medium max-w-2xl">
            {movie.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => navigate(`/watch/${movie.id}`)}
              className="bg-white text-black px-8 py-3 md:px-10 md:py-4 rounded md:rounded-md font-bold text-lg flex items-center gap-3 hover:bg-white/90 transition-all active:scale-95 shadow-xl"
            >
              <Play className="w-6 h-6 fill-black" /> Lecture
            </button>

            <button
              onClick={() => onOpenModal && onOpenModal(movie)}
              className="bg-[gray]/40 text-white px-8 py-3 md:px-10 md:py-4 rounded md:rounded-md font-bold text-lg flex items-center gap-3 hover:bg-[gray]/50 transition-all backdrop-blur-md"
            >
              <Info className="w-6 h-6" /> Plus d'infos
            </button>
          </div>
        </div>
      </div>

      {/* Side Audio Control */}
      {showVideo && (
        <div className="absolute right-0 bottom-[30%] md:bottom-[25%] flex items-center z-30">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 border-l hover:border-l-2 border-white/50 bg-black/10 hover:bg-black/30 backdrop-blur-sm text-white transition-all pr-12 pl-4 rounded-l-full"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <div className="w-24 h-1 bg-white/20 absolute right-0 bottom-0" />
        </div>
      )}
    </div>
  );
};

export default Hero;
