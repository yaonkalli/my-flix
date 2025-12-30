import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Key } from 'lucide-react';
import { useStore } from '../services/store';
import { generateCompletion, AIError } from '../services/ai';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { geminiKey, setGeminiKey } = useStore();
    const [tempKey, setTempKey] = useState(geminiKey);
    const [showSuccess, setShowSuccess] = useState(false);

    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTempKey(geminiKey);
            setTestStatus('idle');
            setTestMessage('');
        }
    }, [isOpen, geminiKey]);

    if (!isOpen) return null;

    const handleSave = () => {
        setGeminiKey(tempKey);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
        }, 1200);
    };

    const testConnection = async () => {
        setTestStatus('loading');
        setTestMessage('Calibration...');
        try {
            // Simple ping to check if key works
            await generateCompletion(tempKey, "Hello");
            setTestStatus('success');
            setTestMessage(`✓ Connexion Établie (Gemini 1.5)`);
        } catch (err: any) {
            console.error("Test error detail:", err);
            setTestStatus('error');
            const msg = err instanceof AIError ? "Clé invalide ou manquante" : "Erreur réseau ou quota";
            setTestMessage(msg);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-zinc-900/40 border border-white/20 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-3xl animate-slide-up">

                <div className="absolute -top-24 -right-24 w-64 h-64 bg-netflix-red/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">IA Config</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Moteur Gemini 1.5</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all duration-300"
                        >
                            <X className="w-6 h-6 text-zinc-400 hover:text-white" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="group animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2 px-1">
                                <Key size={12} className="text-netflix-red" />
                                Clé API Google Gemini
                            </label>

                            <div className="relative">
                                <input
                                    type="password"
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none focus:border-white/30 transition-all duration-300 backdrop-blur-xl group-hover:border-white/20"
                                    placeholder="AIzaSy..."
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full blur-[2px] ${testStatus === 'success' ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-3 px-1">
                                <p className="text-[10px] text-zinc-500 font-medium italic">
                                    Clé stockée localement (Local Database)
                                </p>
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-netflix-red transition-colors duration-300 underline underline-offset-4"
                                >
                                    Générer une clé
                                </a>
                            </div>
                        </div>

                        <div className="bg-black/40 rounded-3xl p-6 border border-white/5 flex items-center justify-between backdrop-blur-xl hover:border-white/10 transition-all duration-500">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">État du Service</h3>
                                <p className={`text-xs font-bold ${testStatus === 'success' ? 'text-green-500' : testStatus === 'error' ? 'text-red-500' : 'text-zinc-500'}`}>
                                    {testMessage || "En attente"}
                                </p>
                            </div>
                            <button
                                onClick={testConnection}
                                disabled={testStatus === 'loading'}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${testStatus === 'loading' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {testStatus === 'loading' ? 'Test...' : 'Vérifier'}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-white text-black py-4 rounded-[1.25rem] text-[12px] font-black uppercase tracking-tighter hover:bg-netflix-red hover:text-white transition-all duration-500 flex items-center justify-center gap-3 active:scale-[0.98] shadow-2xl overflow-hidden group relative"
                        >
                            <div className="absolute inset-0 bg-white group-hover:bg-netflix-red transition-colors duration-500" />
                            <span className="relative z-10 flex items-center gap-2">
                                {showSuccess ? (
                                    <>Configuration Sauvegardée</>
                                ) : (
                                    <><Save size={16} /> Enregistrer et Fermer</>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
