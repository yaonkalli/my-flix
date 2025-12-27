import React from 'react';
import { Episode } from '../types';
import EpisodeCard from './EpisodeCard';

interface EpisodeGridProps {
    episodes: Episode[];
    seasonNumber: number;
    onPlayEpisode: (episode: Episode) => void;
    progressData?: Record<string, number>; // episodeId -> progress percentage
}

const EpisodeGrid: React.FC<EpisodeGridProps> = ({ episodes, seasonNumber, onPlayEpisode, progressData = {} }) => {
    if (episodes.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
                    Aucun épisode disponible pour cette saison
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {episodes.map((episode) => (
                <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    seasonNumber={seasonNumber}
                    onPlay={onPlayEpisode}
                    progress={progressData[episode.id] || 0}
                />
            ))}
        </div>
    );
};

export default EpisodeGrid;
