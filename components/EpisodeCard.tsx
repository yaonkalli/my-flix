import React from 'react';
import { Play, Clock, Info, Download } from 'lucide-react';
import { Episode } from '../types';
import { useCacheStatus } from '../hooks/useCacheStatus';

interface EpisodeCardProps {
    episode: Episode;
    seasonNumber: number;
    onPlay: (episode: Episode) => void;
    progress?: number; // 0-100
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, seasonNumber, onPlay, progress = 0 }) => {
    const isOfflineReady = useCacheStatus([episode.videoUrl, episode.thumbnailUrl]);

    return (
        <div className="group bg-zinc-900/40 hover:bg-zinc-800/60 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border border-white/5 hover:border-white/20 hover:scale-[1.02]">
            <div className="flex flex-col md:flex-row gap-4 p-4">
                {/* Thumbnail */}
                <div className="relative w-full md:w-48 aspect-video flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800">
                    <img
                        src={episode.thumbnailUrl}
                        alt={episode.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Offline Badge */}
                    {isOfflineReady && (
                        <div className="absolute top-2 right-2 bg-netflix-red/90 text-white p-1 rounded-full shadow-lg border border-white/20 z-10">
                            <Download size={10} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={() => onPlay(episode)}
                            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform"
                        >
                            <Play size={20} fill="black" className="text-black ml-1" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                            <div
                                className="h-full bg-netflix-red transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    {/* Episode Number Badge */}
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                            {episode.number}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-base md:text-lg font-black text-white leading-tight group-hover:text-netflix-red transition-colors">
                                {episode.number}. {episode.title}
                            </h3>
                            <span className="text-xs text-zinc-500 font-bold whitespace-nowrap flex items-center gap-1">
                                <Clock size={12} />
                                {episode.duration}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
                            {episode.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={() => onPlay(episode)}
                            className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-netflix-red hover:text-white transition-all active:scale-95"
                        >
                            <Play size={14} fill="currentColor" />
                            Lecture
                        </button>
                        <button className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/20 transition-all">
                            <Info size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EpisodeCard;
