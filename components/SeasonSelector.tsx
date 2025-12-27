import React from 'react';

interface SeasonSelectorProps {
    seasons: number[];
    currentSeason: number;
    onSeasonChange: (season: number) => void;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({ seasons, currentSeason, onSeasonChange }) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {seasons.map((season) => (
                <button
                    key={season}
                    onClick={() => onSeasonChange(season)}
                    className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-tighter whitespace-nowrap transition-all ${currentSeason === season
                            ? 'bg-white text-black shadow-xl scale-105'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-sm border border-white/10'
                        }`}
                >
                    Saison {season}
                </button>
            ))}
        </div>
    );
};

export default SeasonSelector;
