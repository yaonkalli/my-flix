import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Key } from 'lucide-react';
import { useStore } from '../services/store';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { openaiKey, setOpenaiKey, geminiKey, setGeminiKey, aiProvider, setAiProvider } = useStore();
    const [tempOpenai, setTempOpenai] = useState(openaiKey);
    const [tempGemini, setTempGemini] = useState(geminiKey);
    const [tempProvider, setTempProvider] = useState(aiProvider);
    const [showSuccess, setShowSuccess] = useState(false);

    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTempOpenai(openaiKey);
            setTempGemini(geminiKey);
            setTempProvider(aiProvider);
            setTestStatus('idle');
            setTestMessage('');
        }
    }, [isOpen, openaiKey, geminiKey, aiProvider]);

    if (!isOpen) return null;

    const handleSave = () => {
        setOpenaiKey(tempOpenai);
        setGeminiKey(tempGemini);
        setAiProvider(tempProvider);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
        }, 1200);
    };

    const handleRestore = () => {
        setTempOpenai("sk-proj-DEMO");
        setTempGemini("AIzaSyBt5BWJcWY8e6u7MUj2lASFXWQPdeNRt2k");
    };

    const testConnection = async () => {
        setTestStatus('loading');
        setTestMessage('Communication...');
        try {
            if (tempProvider === 'openai') {
                const { OpenAI } = await import('openai');
                const openai = new OpenAI({ apiKey: tempOpenai, dangerouslyAllowBrowser: true, maxRetries: 0 });
                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: "Hello" }],
                });
                if (response.choices[0].message.content) {
                    setTestStatus('success');
                    setTestMessage(`✓ GPT-4o-mini Opérationnel`);
                }
            } else {
                const { GoogleGenAI } = await import('@google/genai');
                const client = new GoogleGenAI({ apiKey: tempGemini });
                const result = await client.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [{ role: 'user', parts: [{ text: "Hello" }] }]
                } as any);
                const responseText = (result as any).text ? (result as any).text : (result as any).candidates?.[0]?.content?.parts?.[0]?.text;
                if (responseText) {
                    setTestStatus('success');
                    setTestMessage(`✓ Gemini 2.0 Flash Établi`);
                }
            }
        } catch (err: any) {
            console.error("Test error detail:", err);
            setTestStatus('error');
            const msg = err.message?.includes('429') ? 'Quota atteint' :
                err.message?.includes('404') ? 'Modèle non trouvé (404)' :
                    err.message?.includes('403') ? 'Clé invalide (403)' : 'Erreur de connexion';
            setTestMessage(msg);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-zinc-900/40 border border-white/20 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-3xl animate-slide-up">

                {/* Background Glows */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-netflix-red/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">IA Architecture</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Configuration Master V3</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all duration-300"
                        >
                            <X className="w-6 h-6 text-zinc-400 hover:text-white" />
                        </button>
                    </div>

                    {/* Dual Provider Selection */}
                    <div className="grid grid-cols-2 p-1.5 bg-black/60 rounded-[1.5rem] border border-white/5 relative">
                        {/* Shifting background */}
                        <div
                            className={`absolute inset-1.5 w-[calc(50%-0.375rem)] bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl transition-all duration-500 ease-out shadow-xl ${tempProvider === 'openai' ? 'translate-x-full' : 'translate-x-0'}`}
                        />

                        <button
                            onClick={() => { setTempProvider('gemini'); setTestStatus('idle'); setTestMessage(''); }}
                            className={`relative z-10 flex flex-col items-center py-4 transition-all duration-500 ${tempProvider === 'gemini' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <span className="text-[11px] font-black uppercase tracking-widest">Google Gemini</span>
                            <span className="text-[8px] font-medium opacity-60 uppercase">Tier Gratuit</span>
                        </button>

                        <button
                            onClick={() => { setTempProvider('openai'); setTestStatus('idle'); setTestMessage(''); }}
                            className={`relative z-10 flex flex-col items-center py-4 transition-all duration-500 ${tempProvider === 'openai' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <span className="text-[11px] font-black uppercase tracking-widest">OpenAI GPT-4</span>
                            <span className="text-[8px] font-medium opacity-60 uppercase">Tier Premium</span>
                        </button>
                    </div>

                    {/* Quota Warning for Gemini */}
                    {tempProvider === 'gemini' && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
                            <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-amber-500 text-xs">⚠</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Quota Limité</p>
                                <p className="text-[11px] text-amber-500/80 leading-relaxed">
                                    Le tier gratuit Gemini a des quotas limités. Si vous recevez une erreur 429, basculez vers OpenAI ou attendez quelques minutes.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="group animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2 px-1">
                                <Key size={12} className="text-netflix-red" />
                                {tempProvider === 'gemini' ? 'Token Google Cloud' : 'Secret Key OpenAI'}
                            </label>

                            <div className="relative">
                                <input
                                    type="password"
                                    value={tempProvider === 'gemini' ? tempGemini : tempOpenai}
                                    onChange={(e) => tempProvider === 'gemini' ? setTempGemini(e.target.value) : setTempOpenai(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none focus:border-white/30 transition-all duration-300 backdrop-blur-xl group-hover:border-white/20"
                                    placeholder={tempProvider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
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
                                    href={tempProvider === 'gemini' ? "https://aistudio.google.com/app/apikey" : "https://platform.openai.com/api-keys"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-netflix-red transition-colors duration-300 underline underline-offset-4"
                                >
                                    Générer une clé
                                </a>
                            </div>
                        </div>

                        {/* Connection Diagnostic */}
                        <div className="bg-black/40 rounded-3xl p-6 border border-white/5 flex items-center justify-between backdrop-blur-xl hover:border-white/10 transition-all duration-500">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Diagnostic Système</h3>
                                <p className={`text-xs font-bold ${testStatus === 'success' ? 'text-green-500' : testStatus === 'error' ? 'text-red-500' : 'text-zinc-500'}`}>
                                    {testMessage || "Prêt pour calibration"}
                                </p>
                            </div>
                            <button
                                onClick={testConnection}
                                disabled={testStatus === 'loading'}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${testStatus === 'loading' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {testStatus === 'loading' ? 'Calibration...' : 'Tester Flux'}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <button
                            onClick={handleRestore}
                            className="bg-white/5 text-zinc-500 p-4 rounded-[1.25rem] hover:bg-white/10 hover:text-white transition-all duration-300 group"
                            title="Reset Factory"
                        >
                            <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform duration-500" />
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-white text-black py-4 rounded-[1.25rem] text-[12px] font-black uppercase tracking-tighter hover:bg-netflix-red hover:text-white transition-all duration-500 flex items-center justify-center gap-3 active:scale-[0.98] shadow-2xl overflow-hidden group relative"
                        >
                            <div className="absolute inset-0 bg-white group-hover:bg-netflix-red transition-colors duration-500" />
                            <span className="relative z-10 flex items-center gap-2">
                                {showSuccess ? (
                                    <>Chargé avec succès</>
                                ) : (
                                    <><Save size={16} /> Appliquer les Correctifs</>
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
