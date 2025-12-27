import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Plus, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import SeasonSelector from '../components/SeasonSelector';
import EpisodeGrid from '../components/EpisodeGrid';
import { useStore } from '../services/store';
import { MOCK_MOVIES } from '../services/mockData';
import { Episode } from '../types';

const SeriesDetail: React.FC = () => {
    const { seriesId } = useParams<{ seriesId: string }>();
    const navigate = useNavigate();
    const { customContent, myList, addToMyList, removeFromMyList, isInMyList } = useStore();

    const allMedia = [...MOCK_MOVIES, ...customContent];
    const series = allMedia.find(m => m.id === seriesId && m.type === 'series');

    const [currentSeason, setCurrentSeason] = useState(1);

    if (!series || !series.seasons) {
        return (
            <div className="min-h-screen bg-[#141414] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Série introuvable</h2>
                    <button
                        onClick={() => navigate('/browse/series')}
                        className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-netflix-red hover:text-white transition-all"
                    >
                        Retour aux séries
                    </button>
                </div>
            </div>
        );
    }

    const seasonNumbers = series.seasons.map(s => s.number).sort((a, b) => a - b);
    const currentSeasonData = series.seasons.find(s => s.number === currentSeason);
    const isInList = isInMyList(series.id);

    const handlePlayEpisode = (episode: Episode) => {
        navigate(`/watch/${series.id}?season=${currentSeason}&episode=${episode.number}`);
    };

    const handleToggleList = () => {
        if (isInList) {
            removeFromMyList(series.id);
        } else {
            addToMyList(series.id);
        }
    };

    return (
        <div className="min-h-screen bg-[#141414] text-white pb-20">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={series.backdropUrl || series.thumbnailUrl}
                        alt={series.title}
                        className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-0 w-full h-[40%] bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-12 md:pb-20 pt-32">
                    <div className="max-w-4xl space-y-6">
                        <button
                            onClick={() => navigate('/browse/series')}
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft size={20} />
                            <span className="text-sm font-bold uppercase tracking-widest">Retour aux séries</span>
                        </button>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tight drop-shadow-2xl">
                            {series.title}
                        </h1>

                        <div className="flex items-center gap-4 text-sm md:text-lg font-medium">
                            <span className="text-[#46d369] font-bold">{series.matchPercentage}% recommandé</span>
                            <span className="text-gray-300">{series.year}</span>
                            <span className="border border-gray-400 px-2 py-0.5 text-xs rounded-sm bg-black/20 backdrop-blur-sm uppercase">
                                {series.rating}
                            </span>
                            <span className="text-gray-300">{series.seasons.length} saison{series.seasons.length > 1 ? 's' : ''}</span>
                        </div>

                        <p className="text-base md:text-xl text-white max-w-2xl line-clamp-3">
                            {series.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <button
                                onClick={() => handlePlayEpisode(currentSeasonData?.episodes[0] || {} as Episode)}
                                className="bg-white text-black px-8 py-3 md:px-10 md:py-4 rounded-md font-bold text-lg flex items-center gap-3 hover:bg-white/90 transition-all active:scale-95 shadow-xl"
                            >
                                <Play className="w-6 h-6 fill-black" /> Lecture
                            </button>

                            <button
                                onClick={handleToggleList}
                                className="bg-[gray]/40 text-white p-3 md:p-4 rounded-md hover:bg-[gray]/50 transition-all backdrop-blur-md"
                            >
                                {isInList ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Episodes Section */}
            <div className="px-6 md:px-16 -mt-20 relative z-20">
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-6">Épisodes</h2>
                    <SeasonSelector
                        seasons={seasonNumbers}
                        currentSeason={currentSeason}
                        onSeasonChange={setCurrentSeason}
                    />
                </div>

                {currentSeasonData && (
                    <EpisodeGrid
                        episodes={currentSeasonData.episodes}
                        seasonNumber={currentSeason}
                        onPlayEpisode={handlePlayEpisode}
                    />
                )}
            </div>
        </div>
    );
};

export default SeriesDetail;
