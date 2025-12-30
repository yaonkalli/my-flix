
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Sparkles, Play, Info, Loader2 } from 'lucide-react';
import { Movie } from '../types';
import { useStore } from '../services/store';
import { MOCK_MOVIES } from '../services/mockData';
import { generateJSON, AIError } from '../services/ai';
import { useNavigate } from 'react-router-dom';

interface AISearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenInfo: (movie: Movie) => void;
}

const AISearchModal: React.FC<AISearchModalProps> = ({ isOpen, onClose, onOpenInfo }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const { customContent, geminiKey, setSettingsOpen } = useStore();
    const navigate = useNavigate();
    const searchInProgressRef = useRef(false);

    const allMedia = useMemo(() => [...MOCK_MOVIES, ...customContent], [customContent]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            if (searchInProgressRef.current) return;

            searchInProgressRef.current = true;
            setIsSearching(true);
            try {
                const catalog = allMedia.map(m => ({ id: m.id, title: m.title, genre: m.genre || [], description: m.description }));

                const prompt = `L'utilisateur cherche : "${query}".
        Voici le catalogue Myflix : ${JSON.stringify(catalog)}.
        Analyse la recherche sémantiquement (ambiance, thèmes, mots-clés).
        Retourne UNIQUEMENT un JSON contenant une liste d'IDs des 5 meilleurs résultats par pertinence.
        Schema: { "ids": ["id1", "id2"] }
        Si aucun ne correspond, liste vide.`;

                const data = await generateJSON(geminiKey, prompt);

                let ids: string[] = [];
                if (data.ids && Array.isArray(data.ids)) {
                    ids = data.ids;
                } else if (typeof data === 'object') {
                    // Try to find any array
                    const possibleArray = Object.values(data).find(v => Array.isArray(v));
                    if (possibleArray) ids = possibleArray as string[];
                }

                const filtered = allMedia.filter(m => ids.includes(m.id));
                setResults(filtered);
            } catch (err: any) {
                console.error("AI Search Error:", err);
                if (err instanceof AIError && err.code === "MYFLIX_CONFIG_REQUIRED") {
                    setSettingsOpen(true);
                    setQuery('');
                    alert("Veuillez configurer votre clé API pour la recherche IA.");
                }
            } finally {
                setIsSearching(false);
                searchInProgressRef.current = false;
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [query, allMedia, geminiKey]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex flex-col items-center bg-black/95 backdrop-blur-3xl animate-fade-in p-4 md:p-20">
            <div className="w-full max-w-5xl">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-netflix-red/20 rounded-xl flex items-center justify-center border border-netflix-red/30 shadow-[0_0_20px_rgba(229,9,20,0.3)]">
                            <Sparkles className="text-netflix-red animate-pulse" />
                        </div>
                        <span className="text-4xl font-black uppercase tracking-tighter italic bg-gradient-to-r from-netflix-red via-purple-500 to-blue-500 bg-clip-text text-transparent">
                            Recherche Magique IA
                        </span>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={32} />
                    </button>
                </div>

                <div className="relative group mb-20">
                    <div className="absolute -inset-1 bg-gradient-to-r from-netflix-red via-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000" />
                    <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 flex items-center gap-6">
                        <Search className="text-zinc-500 w-8 h-8" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Cherchez par ambiance, thème ou titre... (ex: 'un film futuriste sombre')"
                            className="bg-transparent border-none outline-none w-full text-2xl md:text-3xl font-bold placeholder:text-zinc-700"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {isSearching && <Loader2 className="animate-spin text-netflix-red" size={32} />}
                    </div>
                </div>

                {results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 animate-pop-in">
                        {results.map(movie => (
                            <div key={movie.id} className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-105 active:scale-95 border border-white/5">
                                <img src={movie.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                    <p className="font-black uppercase tracking-tighter italic text-sm mb-4 leading-none">{movie.title}</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/watch/${movie.id}`)}
                                            className="bg-white text-black p-2 rounded-full hover:bg-netflix-red hover:text-white transition-all shadow-xl"
                                        >
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                        <button
                                            onClick={() => onOpenInfo(movie)}
                                            className="bg-zinc-800/80 backdrop-blur-md text-white p-2 rounded-full hover:bg-zinc-700 transition"
                                        >
                                            <Info size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query && !isSearching ? (
                    <div className="text-center py-20 space-y-6 animate-fade-in">
                        <div className="text-zinc-700 font-brand text-6xl opacity-20">NO RESULTS</div>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest italic">L'IA n'a pas trouvé de correspondance exacte dans votre catalogue.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AISearchModal;
