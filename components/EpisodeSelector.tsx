import React from 'react';
import { Episode } from '../types';
import { Play, Clock } from 'lucide-react';

interface EpisodeSelectorProps {
    episodes: Episode[];
    currentEpisodeId?: string;
    onEpisodeClick: (episode: Episode) => void;
    onClose: () => void;
}

const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({ episodes, currentEpisodeId, onEpisodeClick, onClose }) => {
    return (
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 animate-slide-in-right overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">Épisodes</h3>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <p className="text-xs text-white/50 font-bold uppercase tracking-widest">
                    {episodes.length} épisodes dans cette saison
                </p>
            </div>

            {/* Episodes List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
                {episodes.map((episode) => {
                    const isActive = episode.id === currentEpisodeId;

                    return (
                        <button
                            key={episode.id}
                            onClick={() => {
                                onEpisodeClick(episode);
                                onClose();
                            }}
                            className={`w-full text-left rounded-xl transition-all group overflow-hidden border ${isActive
                                    ? 'bg-white/10 border-netflix-red shadow-lg'
                                    : 'bg-white/5 border-transparent hover:bg-white/10'
                                }`}
                        >
                            <div className="flex gap-3 p-3">
                                {/* Thumbnail */}
                                <div className="relative w-32 aspect-video flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                                    <img
                                        src={episode.thumbnailUrl}
                                        alt={episode.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {isActive && (
                                        <div className="absolute inset-0 bg-netflix-red/40 flex items-center justify-center">
                                            <Play size={20} fill="white" className="text-white" />
                                        </div>
                                    )}
                                    <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-black">
                                        {episode.number}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className={`font-black text-sm mb-1 truncate ${isActive ? 'text-netflix-red' : 'text-white'
                                        }`}>
                                        {episode.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-white/50">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                                            {episode.duration}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Description reveal for active or hover */}
                            <div className={`px-3 pb-3 transition-all duration-300 ${isActive ? 'block' : 'hidden group-hover:block'
                                }`}>
                                <p className="text-[11px] text-white/60 line-clamp-2 leading-tight">
                                    {episode.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default EpisodeSelector;
