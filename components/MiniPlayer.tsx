
import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../services/store';
import { Play, Pause, SkipForward, SkipBack, X, Maximize2, Volume2, VolumeX, Repeat, Shuffle, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MiniPlayer: React.FC = () => {
  const { activeTrack, isPlaying, setIsPlaying, setActiveTrack, customContent } = useStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p);
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playNext = () => {
    if (!activeTrack) return;
    const musicTracks = customContent.filter(m => m.type === 'music');
    const currentIndex = musicTracks.findIndex(m => m.id === activeTrack.id);
    const nextTrack = musicTracks[(currentIndex + 1) % musicTracks.length];
    if (nextTrack) {
      setActiveTrack(nextTrack);
      setIsPlaying(true);
    }
  };

  const playPrevious = () => {
    if (!activeTrack) return;
    const musicTracks = customContent.filter(m => m.type === 'music');
    const currentIndex = musicTracks.findIndex(m => m.id === activeTrack.id);
    const prevTrack = musicTracks[(currentIndex - 1 + musicTracks.length) % musicTracks.length];
    if (prevTrack) {
      setActiveTrack(prevTrack);
      setIsPlaying(true);
    }
  };

  if (!activeTrack) return null;

  if (isExpanded) {
    // Full-screen player
    return (
      <div className="fixed inset-0 z-[120] bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 text-white flex flex-col">
        <audio
          ref={audioRef}
          src={activeTrack.videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={playNext}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <button onClick={() => setIsExpanded(false)} className="text-white/70 hover:text-white transition-colors">
            <ChevronUp size={24} />
          </button>
          <h3 className="text-sm font-medium">En lecture</h3>
          <button onClick={() => setActiveTrack(null)} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center px-12">
          <div className="max-w-md w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
            <img src={activeTrack.thumbnailUrl} className="w-full h-full object-cover" alt={activeTrack.title} />
          </div>
        </div>

        {/* Track Info */}
        <div className="px-12 pb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{activeTrack.title}</h1>
          <p className="text-lg text-white/60">{activeTrack.artist || 'Artiste Inconnu'}</p>
        </div>

        {/* Progress Bar */}
        <div className="px-12 pb-4">
          <div
            className="h-1 bg-white/20 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/50 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-12 pb-12">
          <div className="flex items-center justify-center gap-8">
            <button className="text-white/70 hover:text-white transition-colors">
              <Shuffle size={20} />
            </button>
            <button onClick={playPrevious} className="text-white/70 hover:text-white transition-colors">
              <SkipBack size={28} fill="currentColor" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={playNext} className="text-white/70 hover:text-white transition-colors">
              <SkipForward size={28} fill="currentColor" />
            </button>
            <button className="text-white/70 hover:text-white transition-colors">
              <Repeat size={20} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={() => setIsMuted(!isMuted)} className="text-white/70 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-32 accent-white"
            />
          </div>
        </div>
      </div>
    );
  }

  // Mini player
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] w-[95%] max-w-4xl animate-pop-out">
      <audio
        ref={audioRef}
        src={activeTrack.videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
      />

      <div className="bg-zinc-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl px-6 py-4 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex items-center justify-between gap-6 group">

        {/* Progress Bar Background */}
        <div
          className="absolute top-0 left-8 right-8 h-[2px] bg-white/10 rounded-full overflow-hidden cursor-pointer"
          onClick={handleSeek}
        >
          <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-2xl border border-white/10 shrink-0 group/cover cursor-pointer" onClick={() => setIsExpanded(true)}>
            <img src={activeTrack.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-110" alt="" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
              <Maximize2 size={16} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm truncate text-white leading-none mb-1.5">{activeTrack.title}</h4>
            <p className="text-xs text-white/50 truncate">{activeTrack.artist || 'Artiste Inconnu'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={playPrevious} className="text-white/70 hover:text-white transition hidden sm:block">
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-90 transition-all shadow-xl"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
          <button onClick={playNext} className="text-white/70 hover:text-white transition hidden sm:block">
            <SkipForward size={20} />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setIsMuted(!isMuted)} className="text-white/70 hover:text-white transition">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 accent-white"
            />
          </div>

          <button onClick={() => setActiveTrack(null)} className="p-2 text-white/70 hover:text-white transition-colors ml-2">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
