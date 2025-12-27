import React from 'react';
import { Chapter } from '../types';
import { Clock, Play } from 'lucide-react';

interface ChapterSelectorProps {
    chapters: Chapter[];
    currentTime: number;
    onChapterClick: (time: number) => void;
    onClose: () => void;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({ chapters, currentTime, onChapterClick, onClose }) => {
    const getCurrentChapter = () => {
        for (let i = chapters.length - 1; i >= 0; i--) {
            if (currentTime >= chapters[i].time) {
                return i;
            }
        }
        return 0;
    };

    const currentChapterIndex = getCurrentChapter();

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 animate-slide-in-right overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">Chapitres</h3>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <p className="text-xs text-white/50 font-bold uppercase tracking-widest">
                    {chapters.length} chapitres • Générés par IA
                </p>
            </div>

            {/* Chapters List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                {chapters.map((chapter, index) => {
                    const isActive = index === currentChapterIndex;
                    const isPast = currentTime > chapter.time;

                    return (
                        <button
                            key={index}
                            onClick={() => {
                                onChapterClick(chapter.time);
                                onClose();
                            }}
                            className={`w-full text-left p-4 rounded-xl transition-all group ${isActive
                                    ? 'bg-netflix-red text-white shadow-lg scale-105'
                                    : isPast
                                        ? 'bg-white/5 text-white/70 hover:bg-white/10'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Chapter Number */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-white/20' : 'bg-white/10'
                                    }`}>
                                    {isActive ? (
                                        <Play size={16} fill="white" className="text-white" />
                                    ) : (
                                        <span className="text-xs font-black">{index + 1}</span>
                                    )}
                                </div>

                                {/* Chapter Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-black text-sm mb-1 truncate ${isActive ? 'text-white' : ''
                                        }`}>
                                        {chapter.title}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="opacity-50" />
                                        <span className="text-xs font-bold opacity-70">
                                            {formatTime(chapter.time)}
                                        </span>
                                    </div>
                                </div>

                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ChapterSelector;
