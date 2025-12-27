
import React, { useRef, useState } from 'react';
import { Movie } from '../types';
import { ChevronLeft, ChevronRight, Play, Plus, ChevronDown, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../services/store';

interface RowProps {
  title: string;
  movies: Movie[];
  variant?: 'tall' | 'wide' | 'top10';
  onOpenModal?: (movie: Movie) => void;
}

const Row: React.FC<RowProps> = ({ title, movies, variant = 'wide', onOpenModal }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      if (direction === 'right') setIsMoved(true);
      if (direction === 'left' && scrollTo <= 0) setIsMoved(false);
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-8 md:space-y-12 pl-6 md:pl-16 group/row relative">
      <div className="flex items-center gap-8">
        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter italic">{title}</h2>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      <div className="relative">
        <button
          onClick={() => handleScroll('left')}
          className={`absolute left-[-2rem] top-0 bottom-0 z-[70] bg-black/80 w-14 opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center my-auto ${!isMoved && 'hidden'}`}
          style={{ height: '100%' }}
        >
          <ChevronLeft className="w-10 h-10 text-white" />
        </button>

        <div
          ref={rowRef}
          className="flex items-center gap-6 md:gap-12 overflow-x-scroll no-scrollbar scroll-smooth py-6 md:py-10"
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              variant={variant}
              rank={variant === 'top10' ? index + 1 : undefined}
              onOpenModal={onOpenModal}
            />
          ))}
        </div>

        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-0 bottom-0 z-[70] bg-black/80 w-14 opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center my-auto"
          style={{ height: '100%' }}
        >
          <ChevronRight className="w-10 h-10 text-white" />
        </button>
      </div>
    </div>
  );
};

import { useCacheStatus } from '../hooks/useCacheStatus';

const MovieCard: React.FC<{ movie: Movie; variant: 'tall' | 'wide' | 'top10'; rank?: number; onOpenModal?: (movie: Movie) => void }> = ({ movie, variant, rank, onOpenModal }) => {
  const navigate = useNavigate();
  const { addToMyList, isInMyList, removeFromMyList, addToHistory, currentProfile, viewProgress } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const isOfflineReady = useCacheStatus([movie.videoUrl, movie.backdropUrl, movie.thumbnailUrl]);

  const handleMouseEnter = () => {
    const timer = setTimeout(() => setIsHovered(true), 400); // 400ms delay like Netflix
    setHoverTimeout(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsHovered(false);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pour les séries, rediriger vers la page détail
    if (movie.type === 'series') {
      navigate(`/series/${movie.id}`);
    } else {
      addToHistory(movie.id);
      navigate(`/watch/${movie.id}`);
    }
  };

  const handleListToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    isInMyList(movie.id) ? removeFromMyList(movie.id) : addToMyList(movie.id);
  };

  const cardStyles = {
    tall: 'w-[160px] md:w-[200px] h-[240px] md:h-[300px]',
    wide: 'w-[200px] md:w-[280px] h-[110px] md:h-[160px]',
    top10: 'w-[200px] md:w-[280px] h-[150px] md:h-[220px] ml-16'
  };

  const imageSrc = variant === 'tall' ? movie.thumbnailUrl : movie.backdropUrl;

  return (
    <div
      className={`relative flex-none ${cardStyles[variant]}`} // Removed group/card to avoid conflicts
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rank Number for Top 10 */}
      {rank !== undefined && (
        <span className="absolute left-[-50px] top-0 bottom-0 text-[180px] font-black text-black tracking-tighter drop-shadow-lg z-0"
          style={{ WebkitTextStroke: '4px #595959' }}>
          {rank}
        </span>
      )}

      {/* Main Card Content */}
      <div
        className={`bg-[#141414] rounded-md overflow-hidden transition-all duration-300 ease-in-out origin-center ${isHovered
          ? 'absolute top-[-50px] left-[-20px] w-[140%] h-auto z-[99] shadow-2xl scale-110'
          : 'w-full h-full z-10'
          }`}
      >
        <div className="relative aspect-video w-full h-full" onClick={handlePlay}>
          <img
            src={imageSrc}
            alt={movie.title}
            className="w-full h-full object-cover rounded-t-md"
            loading="lazy"
          />

          {/* Title Overlay (Premium) */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex items-end">
            <h3 className="text-white font-black uppercase italic leading-none text-xs md:text-sm tracking-tighter line-clamp-2 drop-shadow-2xl font-bebas">
              {movie.title}
            </h3>
          </div>

          {/* Offline Badge */}
          {isOfflineReady && (
            <div className="absolute top-2 right-2 bg-netflix-red/90 text-white p-1 rounded-full shadow-lg border border-white/20">
              <Download size={10} className="md:w-3 md:h-3" />
            </div>
          )}
          {/* Progress Bar Overlay */}
          {(() => {
            if (!currentProfile) return null;
            const progress = viewProgress[`${currentProfile.id}_${movie.id}`];
            if (!progress || progress.time <= 0) return null;
            const percent = (progress.time / progress.duration) * 100;
            return (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div className="h-full bg-netflix-red" style={{ width: `${percent}%` }} />
              </div>
            );
          })()}
        </div>

        {/* Hover Info Section */}
        {isHovered && (
          <div className="p-4 bg-[#141414] shadow-lg rounded-b-md animate-fade-in space-y-3">
            <h4 className="text-white font-black text-sm uppercase italic tracking-tighter">{movie.title}</h4>

            {/* Action Bar */}
            <div className="flex items-center gap-2">
              <button onClick={handlePlay} className="bg-white p-2 rounded-full hover:bg-gray-200 transition ring-1 ring-white">
                <Play size={16} fill="black" className="text-black" />
              </button>
              <button onClick={handleListToggle} className="border-2 border-gray-500 hover:border-white p-2 rounded-full text-white bg-[#2a2a2a]/60 hover:bg-[#2a2a2a] transition">
                {isInMyList(movie.id) ? <span className="font-bold text-[10px]">✓</span> : <Plus size={16} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onOpenModal && onOpenModal(movie); }}
                className="border-2 border-gray-500 hover:border-white p-2 rounded-full text-white bg-[#2a2a2a]/60 hover:bg-[#2a2a2a] transition ml-auto"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
              <span className="text-[#46d369]">{movie.matchPercentage}% recommandé</span>
              <span className="border border-gray-500 px-1 text-[10px] text-gray-400 uppercase">{movie.rating}</span>
              <span>{movie.duration}</span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 text-[10px] text-white">
              {movie.genre?.slice(0, 3).map((g, i) => (
                <span key={i} className="flex items-center">
                  {i > 0 && <span className="text-gray-600 mr-2">•</span>}
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Row;
