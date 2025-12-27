import React, { useMemo } from 'react';
import { useStore } from '../services/store';
import { MOCK_MOVIES } from '../services/mockData';
import Row from '../components/Row';
import { WifiOff, Download, Sparkles } from 'lucide-react';

const OfflineLibrary: React.FC = () => {
    const { customContent } = useStore();
    const allMedia = useMemo(() => [...MOCK_MOVIES, ...customContent], [customContent]);

    // Note: Dans une vraie PWA, on filtrerait dynamiquement via useCacheStatus
    // Mais ici, pour la démo, on simule que les contenus "Ma Liste" ou "Custom" sont prioritaires au cache
    // Ou on pourrait scanner réellement le cache. 

    // Pour l'instant, on affiche une sélection "Premium Offline"
    const offlineContent = allMedia.slice(0, 4);

    return (
        <div className="min-h-screen bg-[#141414] pt-32 pb-20 px-6 md:px-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-netflix-red">
                        <WifiOff size={24} />
                        <span className="text-sm font-black uppercase tracking-[0.3em] italic">Mode Nomade</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic text-white leading-none">
                        Bibliothèque <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/50 to-transparent">Hors-Ligne</span>
                    </h1>
                    <p className="text-zinc-500 max-w-xl font-bold uppercase text-xs tracking-widest leading-relaxed">
                        Vos contenus favoris, stockés localement sur votre appareil.
                        Regardez vos films et séries sans consommer de données et sans connexion internet.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-[30px] border border-white/10 shadow-2xl">
                    <div className="w-12 h-12 bg-netflix-red/10 rounded-2xl flex items-center justify-center border border-netflix-red/20 shadow-[0_0_30px_rgba(229,9,20,0.2)]">
                        <Download className="text-netflix-red animate-bounce" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Capacité Locale</p>
                        <p className="text-lg font-black text-white italic tracking-tight">4.2 GB de Films Prêts</p>
                    </div>
                </div>
            </div>

            <div className="space-y-16">
                <Row title="Films & Séries Disponibles" movies={offlineContent} />

                {offlineContent.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-50">
                        <Sparkles size={64} className="mb-6 text-zinc-700" />
                        <p className="text-xl font-black uppercase tracking-tighter">Aucun contenu hors-ligne pour le moment</p>
                        <p className="text-xs font-bold text-zinc-500 mt-2 uppercase tracking-widest">Lancez une vidéo pour qu'elle soit automatiquement mise en cache</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfflineLibrary;
