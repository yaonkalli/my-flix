
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  ArrowLeft, Loader2, RotateCcw, RotateCw, Settings,
  ChevronRight, Fullscreen, Subtitles, HelpCircle, AlertCircle, List, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChapterSelector from './ChapterSelector';
import EpisodeSelector from './EpisodeSelector';
import { Chapter, Episode } from '../types';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  initialTime?: number;
  onTimeUpdate?: (time: number, duration: number) => void;
  chapters?: Chapter[];
  episodes?: Episode[];
  currentEpisodeId?: string;
  onEpisodeClick?: (episode: Episode) => void;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  initialTime = 0,
  onTimeUpdate,
  chapters = [],
  episodes = [],
  currentEpisodeId,
  onEpisodeClick,
  title
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // HLS / Video Source Setup
  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setIsPlaying(false);
    setError(null);

    if (Hls.isSupported() && src.includes('.m3u8')) {
      hls = new Hls({ autoStartLoad: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isMounted.current) setIsLoading(false);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError("Erreur de flux HLS");
      });
    } else {
      video.src = src;
      video.oncanplay = () => {
        if (isMounted.current) setIsLoading(false);
      };
      video.onerror = () => {
        if (isMounted.current) {
          setIsLoading(false);
          setError("Ce format (AVI/XviD) n'est pas supporté nativement par votre navigateur.");
        }
      };
    }

    // Set initial time once
    const setLoadedTime = () => {
      if (initialTime > 0 && videoRef.current) {
        videoRef.current.currentTime = initialTime;
      }
    };
    video.addEventListener('loadedmetadata', setLoadedTime);

    return () => {
      if (hls) hls.destroy();
      video.removeEventListener('loadedmetadata', setLoadedTime);
      video.oncanplay = null;
      video.pause();
      video.src = "";
      video.load();
    };
  }, [src]);

  // Handle Controls Auto-Hide
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showChapters && !showEpisodes) setShowControls(false);
    }, 3000);
  };

  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (videoRef.current.paused) {
        await videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.warn("Playback error:", error);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(dur);
      if (dur > 0) setProgress((current / dur) * 100);
      if (onTimeUpdate) onTimeUpdate(current, dur);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const hours = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none cursor-none group/container"
      onMouseMove={(e) => {
        handleMouseMove();
        e.currentTarget.style.cursor = 'default';
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
          if (isPlaying && !showChapters && !showEpisodes) {
            e.currentTarget.style.cursor = 'none';
          }
        }, 3000);
      }}
      onClick={() => {
        handleMouseMove();
        setShowChapters(false);
        setShowEpisodes(false);
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
      />

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-3xl z-40 p-12 text-center animate-fade-in">
          <div className="w-24 h-24 bg-netflix-red/10 rounded-3xl flex items-center justify-center mb-8 border border-netflix-red/20 shadow-[0_0_50px_rgba(229,9,20,0.2)]">
            <AlertCircle size={48} className="text-netflix-red animate-pulse" />
          </div>
          <h2 className="text-3xl font-black italic mb-4 tracking-tighter">Format Non Supporté</h2>
          <p className="text-zinc-500 max-w-md mb-10 font-bold leading-relaxed">
            {error} <br />
            Pas d'inquiétude, vous pouvez toujours le lire avec un lecteur externe (VLC).
          </p>
          <a
            href={src}
            download
            className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-netflix-red hover:text-white transition-all shadow-2xl flex items-center gap-3 active:scale-95"
          >
            Ouvrir dans un lecteur externe <ChevronRight size={20} />
          </a>
          <button onClick={() => navigate(-1)} className="mt-8 text-zinc-600 hover:text-white font-bold transition-colors">
            Retour à la bibliothèque
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 p-8 flex items-center justify-between transition-opacity duration-500 z-30 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-6">
          <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="flex items-center gap-4 text-white group">
            <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xl font-bold">Retour</span>
          </button>
          {title && (
            <div className="h-8 w-[2px] bg-white/20" />
          )}
          {title && (
            <span className="text-xl font-black uppercase tracking-tighter italic text-white/90">{title}</span>
          )}
        </div>
      </div>

      {/* Center Controls (Skip/Play) */}
      <div className={`absolute inset-0 flex items-center justify-center gap-16 pointer-events-none transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={(e) => { e.stopPropagation(); skip(-10); }} className="pointer-events-auto text-white p-4 hover:bg-white/10 rounded-full transition-all group">
          <RotateCcw className="w-12 h-12" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="pointer-events-auto w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group shadow-2xl"
        >
          {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
        </button>

        <button onClick={(e) => { e.stopPropagation(); skip(10); }} className="pointer-events-auto text-white p-4 hover:bg-white/10 rounded-full transition-all group">
          <RotateCw className="w-12 h-12" />
        </button>
      </div>

      {/* Selectors Overlays */}
      {showChapters && chapters.length > 0 && (
        <div onClick={(e) => e.stopPropagation()}>
          <ChapterSelector
            chapters={chapters}
            currentTime={currentTime}
            onChapterClick={(t) => { if (videoRef.current) videoRef.current.currentTime = t; }}
            onClose={() => setShowChapters(false)}
          />
        </div>
      )}

      {showEpisodes && episodes.length > 0 && onEpisodeClick && (
        <div onClick={(e) => e.stopPropagation()}>
          <EpisodeSelector
            episodes={episodes}
            currentEpisodeId={currentEpisodeId}
            onEpisodeClick={onEpisodeClick}
            onClose={() => setShowEpisodes(false)}
          />
        </div>
      )}

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-8 pt-24 transition-all duration-500 z-30 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Progress Bar */}
        <div className="w-full mb-8 flex flex-col gap-2 group/progress">
          <div
            className="relative h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer group-hover/progress:h-2 transition-all"
            onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-netflix-red z-10"
              style={{ width: `${progress}%` }}
            />
            {/* Chapter Markers */}
            {chapters.map((ch, i) => (
              <div
                key={i}
                className="absolute top-0 w-0.5 h-full bg-white/40 z-20"
                style={{ left: `${(ch.time / (duration || 1)) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-black text-white/50 tracking-tighter italic">{formatTime(currentTime)}</span>
            <span className="text-sm font-black text-white/50 tracking-tighter italic">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Bottom Bar Icons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white hover:scale-110 transition-transform">
              {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current" />}
            </button>

            <button onClick={(e) => { e.stopPropagation(); skip(-10); }} className="text-white hover:text-netflix-red transition-colors">
              <RotateCcw className="w-7 h-7" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); skip(10); }} className="text-white hover:text-netflix-red transition-colors">
              <RotateCw className="w-7 h-7" />
            </button>

            <div className="flex items-center gap-5 group/volume ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newMute = !isMuted;
                  setIsMuted(newMute);
                  if (videoRef.current) videoRef.current.muted = newMute;
                }}
                className="text-white"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
              </button>
              <div className="w-0 group-hover/volume:w-32 transition-all duration-500 overflow-hidden flex items-center">
                <input
                  type="range"
                  min="0" max="1" step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    setIsMuted(v === 0);
                    if (videoRef.current) {
                      videoRef.current.volume = v;
                      videoRef.current.muted = v === 0;
                    }
                  }}
                  className="w-24 appearance-none bg-white/20 h-1 rounded-full accent-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10">
            {/* Chapters Trigger */}
            {chapters.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChapters(!showChapters);
                  setShowEpisodes(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${showChapters
                    ? 'bg-netflix-red border-netflix-red text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <List size={22} />
                <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Chapitres</span>
              </button>
            )}

            {/* Episodes Trigger */}
            {episodes.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEpisodes(!showEpisodes);
                  setShowChapters(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${showEpisodes
                    ? 'bg-netflix-red border-netflix-red text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Layers size={22} />
                <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Épisodes</span>
              </button>
            )}

            <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white hover:scale-110 transition-transform">
              {isFullscreen ? <Minimize className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

