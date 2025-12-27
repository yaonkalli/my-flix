
import React, { useState } from 'react';
import { X, Play, Plus, ThumbsUp, Volume2, Sparkles } from 'lucide-react';
import { Movie } from '../types';

interface InfoModalProps {
    movie: Movie | null;
    onClose: () => void;
    onPlay: (movie: Movie) => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ movie, onClose, onPlay }) => {
    const [selectedSeason, setSelectedSeason] = useState(1);

    if (!movie) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-[#181818] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl no-scrollbar scroll-smooth animate-pop-in">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-50 p-2 bg-[#181818] rounded-full text-white/70 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Hero Section */}
                <div className="relative aspect-video w-full">
                    <img
                        src={movie.backdropUrl || movie.thumbnailUrl}
                        className="w-full h-full object-cover"
                        alt={movie.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

                    <div className="absolute bottom-8 left-8 right-8 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">{movie.title}</h2>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onPlay(movie)}
                                className="bg-white text-black px-8 py-2 md:px-12 md:py-3 rounded md:rounded-md font-bold text-lg flex items-center gap-3 hover:bg-white/90 transition-all active:scale-95 shadow-xl"
                            >
                                <Play className="w-6 h-6 fill-black" /> Lecture
                            </button>
                            <button className="p-3 border-2 border-white/50 rounded-full text-white hover:border-white hover:bg-white/10 transition-all">
                                <Plus size={20} />
                            </button>
                            <button className="p-3 border-2 border-white/50 rounded-full text-white hover:border-white hover:bg-white/10 transition-all">
                                <ThumbsUp size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-4 text-sm md:text-lg font-medium text-white">
                            <span className="text-[#46d369] font-bold">{movie.matchPercentage}% recommandé</span>
                            <span className="text-gray-400">{movie.year}</span>
                            <span className="border border-gray-400 px-2 py-0.5 text-xs rounded-sm bg-black/20 uppercase">{movie.rating}</span>
                            <span className="text-gray-400">{movie.duration}</span>
                            <span className="border border-gray-400 px-2 py-0.5 text-xs rounded-sm bg-black/20 uppercase">{movie.type === 'series' ? 'Série' : 'Film'}</span>
                        </div>

                        {movie.recommendationReason && (
                            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                <Sparkles className="text-netflix-red w-5 h-5 shrink-0 mt-1" />
                                <p className="text-white text-sm italic font-medium">{movie.recommendationReason}</p>
                            </div>
                        )}

                        <p className="text-white text-lg leading-relaxed font-light">
                            {movie.description}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <span className="text-gray-500 text-sm">Genres : </span>
                            <span className="text-white text-sm">
                                {movie.genre?.join(', ')}
                            </span>
                        </div>
                        {movie.artist && (
                            <div>
                                <span className="text-gray-500 text-sm">Artiste : </span>
                                <span className="text-white text-sm">{movie.artist}</span>
                            </div>
                        )}
                        {movie.composer && (
                            <div>
                                <span className="text-gray-500 text-sm">Compositeur : </span>
                                <span className="text-white text-sm">{movie.composer}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Series Episodes Section */}
                {movie.type === 'series' && movie.seasons && movie.seasons.length > 0 && (
                    <div className="p-8 border-t border-zinc-800 space-y-8 bg-black/20">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Épisodes</h3>
                            <select
                                value={selectedSeason}
                                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                className="bg-zinc-900 text-white px-6 py-3 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-netflix-red font-bold text-sm appearance-none cursor-pointer hover:bg-zinc-800 transition-colors"
                            >
                                {movie.seasons.map(s => (
                                    <option key={s.number} value={s.number}>Saison {s.number}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            {movie.seasons.find(s => s.number === selectedSeason)?.episodes.map(ep => (
                                <div key={ep.id} className="group flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10"
                                    onClick={() => onPlay({ ...movie, videoUrl: ep.videoUrl, title: `${movie.title} - S${selectedSeason}E${ep.number}: ${ep.title}` })}
                                >
                                    <div className="hidden md:block w-8 text-3xl font-black text-zinc-700 group-hover:text-white transition-colors italic">{ep.number}</div>
                                    <div className="relative aspect-video w-full md:w-48 rounded-xl overflow-hidden shrink-0 shadow-2xl">
                                        <img src={ep.thumbnailUrl || movie.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl">
                                                <Play fill="black" size={20} className="ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xl font-bold text-white group-hover:text-netflix-red transition-colors">{ep.title}</h4>
                                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{ep.duration}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 line-clamp-2 font-light leading-relaxed">{ep.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfoModal;
