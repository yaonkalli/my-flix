
// [AI UPDATE] Page Studio - Intégration IA Avancée
// Utilisation de Gemini 2.0 Flash pour l'analyse visuelle et métadonnées

import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import {
   Sparkles, Trash2, Loader2, Upload, X, Music, Film, RefreshCcw, ArrowRight, AlertTriangle, Edit3, Layers, Zap, User, Mic2, ArrowLeft, Camera
} from 'lucide-react';
import { useStore } from '../services/store';
import { Link } from 'react-router-dom';
import { OpenAI } from 'openai';
import { callGemini } from '../services/ai';
import { Movie, MediaType } from '../types';

import { config } from '../config';

const Studio: React.FC = () => {
   const { addCustomMedia, customContent, removeCustomMedia, openaiKey, geminiKey, aiProvider, setSettingsOpen } = useStore();
   const [analyzing, setAnalyzing] = useState(false);
   const [dragActive, setDragActive] = useState(false);
   const [status, setStatus] = useState<string>('');
   const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

   const [pendingMedia, setPendingMedia] = useState<Partial<Movie> | null>(null);
   const [candidates, setCandidates] = useState<string[]>([]);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const processingRef = useRef(false);
   const aiSelectionInProgressRef = useRef(false);

   const getAIInstance = () => {
      if (aiProvider === 'openai') {
         return openaiKey ? new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true, maxRetries: 0 }) : null;
      }
      return null;
   };

   const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
      else if (e.type === "dragleave") setDragActive(false);
   };

   const extractFrames = (file: File, count: number = 8): Promise<string[]> => {
      return new Promise((resolve) => {
         const video = document.createElement('video');
         video.preload = 'metadata';
         video.src = URL.createObjectURL(file);
         video.muted = true;

         const frames: string[] = [];

         video.onloadedmetadata = async () => {
            const duration = video.duration;
            // Capture frames at specific intervals: 10%, 20%... 80%
            const timestamps = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map(p => p * duration);

            for (const time of timestamps) {
               video.currentTime = time;
               await new Promise<void>((r) => {
                  const onSeeked = () => {
                     video.removeEventListener('seeked', onSeeked);
                     r();
                  };
                  video.addEventListener('seeked', onSeeked);
               });

               const canvas = document.createElement('canvas');
               canvas.width = video.videoWidth;
               canvas.height = video.videoHeight;
               const ctx = canvas.getContext('2d');
               ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
               frames.push(canvas.toDataURL('image/jpeg', 0.8));
            }

            URL.revokeObjectURL(video.src);
            resolve(frames);
         };

         video.onerror = () => {
            console.warn("Decode error for preview.");
            URL.revokeObjectURL(video.src);
            resolve([]);
         }
      });
   };

   const pickBestCoverWithAI = async (currentCandidates: string[] = candidates) => {
      if (!currentCandidates.length) return;

      // Protection anti-spam: ignorer si une sélection IA est déjà en cours
      if (aiSelectionInProgressRef.current) {
         console.log('Sélection IA déjà en cours, requête ignorée');
         return;
      }

      aiSelectionInProgressRef.current = true;
      setStatus('Analyse IA Best Shot...');
      const hasAI = aiProvider === 'openai' ? !!openaiKey : !!geminiKey;
      if (!hasAI) {
         aiSelectionInProgressRef.current = false;
         return;
      }

      const ai = getAIInstance();

      try {
         if (aiProvider === 'openai' && ai instanceof OpenAI) {
            const response = await ai.chat.completions.create({
               model: "gpt-4o-mini",
               messages: [
                  {
                     role: "system",
                     content: "Analyze these frames from a video. Pick the single most iconic, sharp, and high-quality frame to use as a movie poster. Avoid blurry or generic frames. Return ONLY a JSON object: { \"bestIndex\": number }."
                  },
                  {
                     role: "user",
                     content: [
                        ...currentCandidates.map((base64, idx) => ({
                           type: "image_url" as const,
                           image_url: { url: base64, detail: "low" as const }
                        })),
                        { type: "text", text: "Which frame index (0-7) is the best cinematic cover?" }
                     ]
                  }
               ],
               response_format: { type: "json_object" }
            });

            const data = JSON.parse(response.choices[0].message.content || '{"bestIndex": 0}');
            const bestIndex = (typeof data.bestIndex === 'number') ? data.bestIndex : 0;
            if (currentCandidates[bestIndex]) {
               setPendingMedia(prev => prev ? ({ ...prev, thumbnailUrl: currentCandidates[bestIndex], backdropUrl: currentCandidates[bestIndex] }) : prev);
            }
         } else {
            console.log("Studio Gemini Selection triggered");
            const imageParts = currentCandidates.map(base64 => ({
               inlineData: { data: base64.split(',')[1], mimeType: "image/jpeg" }
            }));
            // Pass parts directly. callGemini is now smart enough to wrap them in a User Content object.
            const text = await callGemini(geminiKey || '', [
               ...imageParts,
               "Analyze these images. Return ONLY a JSON: { \"bestIndex\": number } for the best cinematic frame. No markdown."
            ], { model: "gemini-2.0-flash", isJson: true }); // Updated model name to stable version

            const data = JSON.parse(text);
            const bestIndex = (typeof data.bestIndex === 'number') ? data.bestIndex : 0;
            if (currentCandidates[bestIndex]) {
               setPendingMedia(prev => prev ? ({ ...prev, thumbnailUrl: currentCandidates[bestIndex], backdropUrl: currentCandidates[bestIndex] }) : prev);
            }
         }
      } catch (err) {
         console.error("AI Selection failed", err);
      } finally {
         setStatus('');
         aiSelectionInProgressRef.current = false;
      }
   }

   const processFile = async (file: File) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setAnalyzing(true);
      setIsQuotaExceeded(false);
      setCandidates([]);
      setStatus('Analyse Expert...');

      // 1. Extract Frames if video
      let extractedCandidates: string[] = [];
      if (file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.avi')) {
         setStatus('Détection des moments forts...');
         extractedCandidates = await extractFrames(file, 8);
         setCandidates(extractedCandidates);
      }

      // Keep track of the current file for rescan
      (window as any)._currentStudioFile = file;
      const hasAI = aiProvider === 'openai' ? !!openaiKey : !!geminiKey;

      if (!hasAI) {
         fallbackMaster(file, extractedCandidates[0] || '');
         return;
      }

      const ai = getAIInstance();

      try {
         let data: any = {};
         if (aiProvider === 'openai' && ai instanceof OpenAI) {
            const response = await ai.chat.completions.create({
               model: "gpt-4o-mini",
               messages: [
                  {
                     role: "system",
                     content: "Tu es un expert en cinéma. Analyse le média et retourne un JSON détaillé EN FRANÇAIS. IMPORTANT: Si tu ne reconnais pas ce contenu comme une œuvre publique commerciale, décris uniquement ce que tu vois de manière factuelle sans inventer de métadonnées (acteurs, pitch fictionnel). Champ 'type': 'movie', 'series', 'music'. Champ 'rating': '16+', 'Tous', '12+'. Ajoute 'recommendationReason' (phrase commençant par 'Parce que vous aimez...'). Si film/musique, ajoute 'chapters' [{time_en_secondes, title}]. Si série, ajoute 'seasons' [{number, episodes: [{number, title, description, duration, chapters: [{time, title}]}]}]"
                  },
                  {
                     role: "user", content: [
                        { type: "text", text: `Fichier: ${file.name}. Retourne JSON: {title, artist, year, genre, rating, type, posterQuery, backdropQuery, description, recommendationReason, chapters, seasons}` },
                        ...extractedCandidates.slice(0, 4).map(b => ({ type: "image_url" as const, image_url: { url: b, detail: "low" as const } }))
                     ]
                  }
               ],
               response_format: { type: "json_object" }
            });
            data = JSON.parse(response.choices[0].message.content || '{}');
         } else {
            console.log("Studio Gemini Metadata Analysis triggered");
            const promptParts: any[] = [`Tu es un expert en cinéma. Analyse "${file.name}". 
            IMPORTANT: Si tu ne reconnais pas ce contenu comme une œuvre commerciale publique (film, série, musique connue), décris UNIQUEMENT ce que tu vois visuellement de manière factuelle. N'invente jamais d'acteurs, de réalisateurs ou d'années si c'est un contenu personnel. 
            Réponds EN FRANÇAIS. 
            Si c'est un contenu privé, utilise 'type': 'movie' par défaut et 'genre': ['Privé'].
            Si œuvre connue: Classifie 'movie', 'series', 'music' et ajoute 'recommendationReason'.
            Si film/musique, génère 'chapters' [{time (secondes), title}]. 
            Si série, génère 'seasons' [{number, episodes: [{number, title, description, duration, chapters: [{time, title}]}]}].
            Retourne UNIQUEMENT un JSON: {title, artist, year, genre, rating, type, posterQuery, backdropQuery, description, recommendationReason, chapters, seasons}. Pas de markdown.`];
            if (extractedCandidates.length > 0) {
               promptParts.push(...extractedCandidates.slice(0, 4).map(b => ({ inlineData: { data: b.split(',')[1], mimeType: "image/jpeg" } })));
            }
            const text = await callGemini(geminiKey || '', promptParts, { model: "gemini-2.0-flash", isJson: true }); // Updated model name to stable version
            data = JSON.parse(text);
         }

         const salt = Math.random().toString(36).substring(7);
         const getUnsplash = (q: string, s: string) => `https://images.unsplash.com/featured/${s}?${encodeURIComponent(q || 'cinema')},${salt}`;

         setPendingMedia({
            id: `custom_${Date.now()}`,
            title: data.title || file.name,
            artist: data.artist || "Indépendant",
            composer: data.composer || "Studio Master",
            description: data.description || "Analyse terminée.",
            year: parseInt(data.year) || 2025,
            duration: data.duration || (file.type.startsWith('audio/') ? "Hi-Fi" : "2h 15m"),
            genre: Array.isArray(data.genre) ? data.genre : (data.genre ? [data.genre] : ["Studio"]),
            type: data.type || (file.type.startsWith('audio/') ? 'music' : selectedType),
            videoUrl: URL.createObjectURL(file),
            thumbnailUrl: extractedCandidates[0] || getUnsplash(data.posterQuery, '800x1200'),
            backdropUrl: extractedCandidates[0] || getUnsplash(data.backdropQuery, '1600x900'),
            rating: data.rating || "Tous",
            matchPercentage: Math.floor(Math.random() * 20) + 80,
            isCustom: true,
            recommendationReason: data.recommendationReason,
            chapters: data.chapters,
            seasons: data.seasons
         });

         // If we have candidates, let's auto-pick the best one in the background
         // Augmenté le délai pour éviter le spam de requêtes
         if (extractedCandidates.length > 0) {
            setTimeout(() => pickBestCoverWithAI(extractedCandidates), 800);
         }

         setStatus('Master Prêt');
      } catch (err: any) {
         console.error("AI processing error:", err);
         if (err.message === "MYFLIX_CONFIG_REQUIRED") {
             setSettingsOpen(true);
             alert("Veuillez configurer votre clé API pour utiliser le Studio.");
         } else if (err?.status === 429 || err?.message?.includes('429')) {
             setIsQuotaExceeded(true);
         }
         fallbackMaster(file, extractedCandidates[0]);
      } finally {
         setAnalyzing(false);
         setTimeout(() => { processingRef.current = false; }, 500);
      }
   };

   const fallbackMaster = (file: File, autoThumbnail: string = '') => {
      const isAudio = file.type.startsWith('audio/');
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      const salt = Math.random().toString(36).substring(7);

      const finalThumbnail = autoThumbnail || `https://images.unsplash.com/featured/800x1200?${isAudio ? 'album,art' : 'movie'},${salt}`;
      const finalBackdrop = autoThumbnail || `https://images.unsplash.com/featured/1600x900?${isAudio ? 'abstract,music' : 'cinematic'},${salt}`;

      setPendingMedia({
         id: `manual_${Date.now()}`,
         title: cleanName,
         artist: "Indépendant",
         composer: "Auto-Production",
         description: "Mastering Myflix par défaut.",
         year: 2024,
         duration: isAudio ? "Hi-Fi" : "4K",
         genre: ["Master"],
         type: isAudio ? 'music' : 'movie',
         videoUrl: URL.createObjectURL(file),
         thumbnailUrl: finalThumbnail,
         backdropUrl: finalBackdrop,
         rating: "G",
         isCustom: true
      });
      setAnalyzing(false);
      processingRef.current = false;
   };

   const handleRescan = async () => {
      const file = (window as any)._currentStudioFile;
      if (!file) return;

      setStatus('Nouveau Scan Aléatoire...');
      // Use random offsets for rescan
      const duration = await new Promise<number>((res) => {
         const v = document.createElement('video');
         v.src = URL.createObjectURL(file);
         v.onloadedmetadata = () => res(v.duration);
      });

      const randomTimes = Array.from({ length: 8 }, () => Math.random() * duration);

      const newFrames = await new Promise<string[]>((resolve) => {
         const video = document.createElement('video');
         video.src = URL.createObjectURL(file);
         video.muted = true;
         const frames: string[] = [];

         video.onloadedmetadata = async () => {
            for (const time of randomTimes) {
               video.currentTime = time;
               await new Promise<void>((r) => {
                  const onSeeked = () => { video.removeEventListener('seeked', onSeeked); r(); };
                  video.addEventListener('seeked', onSeeked);
               });
               const canvas = document.createElement('canvas');
               canvas.width = video.videoWidth;
               canvas.height = video.videoHeight;
               canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
               frames.push(canvas.toDataURL('image/jpeg', 0.8));
            }
            resolve(frames);
         };
      });

      setCandidates(newFrames);
      setStatus('Nouveau Master prêt');
      // Auto-repick
      pickBestCoverWithAI(newFrames);
   };

   const [selectedType, setSelectedType] = useState<MediaType>('movie');

   return (
      <div className="min-h-screen bg-[#141414] text-white selection:bg-netflix-red">
         <Navbar />
         <div className="pt-20 px-4 md:px-12 max-w-[1600px] mx-auto pb-20">
            {/* Clean Netflix-style Header */}
            <header className="mb-8 pt-6">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <Link to="/browse" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all border border-white/5 group">
                           <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold italic tracking-tighter">Studio Master</h1>
                     </div>
                     <p className="text-sm text-gray-400">Importe et gère ton contenu personnel avec l'IA</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-netflix-red/10 flex items-center justify-center text-netflix-red group-hover:scale-110 transition-transform">
                           <Layers size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-0.5">Bibliothèque</p>
                           <p className="text-lg font-black text-white leading-none">{customContent.length} <span className="text-[10px] text-zinc-600">MÉDIAS</span></p>
                        </div>
                     </div>
                  </div>
               </div>
            </header>

            {/* Content Type Selector */}
            <div className="flex gap-2 mb-8 bg-zinc-900/50 p-1.5 rounded-2xl w-fit border border-white/5">
               {[
                  { type: 'movie' as MediaType, label: 'Films', icon: Film },
                  { type: 'series' as MediaType, label: 'Séries', icon: Layers },
                  { type: 'music' as MediaType, label: 'Audio', icon: Music }
               ].map(({ type, label, icon: Icon }) => (
                  <button
                     key={type}
                     onClick={() => setSelectedType(type)}
                     className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-tighter transition-all flex items-center gap-3 ${selectedType === type
                        ? 'bg-white text-black shadow-xl scale-105'
                        : 'text-zinc-500 hover:text-white'
                        }`}
                  >
                     <Icon size={18} />
                     {label}
                  </button>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               {/* Upload Zone */}
               <div className="lg:col-span-1">
                  {!pendingMedia ? (
                     <div
                        className={`relative bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] border-2 border-dashed transition-all duration-700 cursor-pointer group overflow-hidden ${dragActive ? 'border-netflix-red bg-netflix-red/10 scale-[1.02] shadow-[0_0_60px_rgba(229,9,20,0.2)]' : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                           }`}
                        style={{ minHeight: '500px' }}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
                        onClick={() => !analyzing && fileInputRef.current?.click()}
                     >
                        <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} accept="video/*,audio/*,.avi,.mkv" />

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                           <div className={`w-28 h-28 rounded-[2rem] bg-zinc-800/50 backdrop-blur-2xl flex items-center justify-center mb-10 transition-all duration-700 shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 ${dragActive ? 'bg-netflix-red text-white -rotate-12 scale-110' : 'group-hover:rotate-6 group-hover:scale-105 group-hover:bg-zinc-700/50'}`}>
                              {analyzing ? (
                                 <Loader2 className="w-12 h-12 text-netflix-red animate-spin" />
                              ) : (
                                 <Upload className="w-12 h-12 text-zinc-500 group-hover:text-white transition-colors" />
                              )}
                           </div>

                           <h3 className="text-3xl font-black mb-4 italic tracking-tighter">
                              {analyzing ? 'Analyse par l\'IA...' : dragActive ? 'Relâchez maintenant' : 'Charger un Médias'}
                           </h3>
                           <p className="text-zinc-400 mb-8 font-medium leading-relaxed max-w-xs mx-auto">
                              Importez vos fichiers pour un mastering Myflix complet avec génération de cover IA.
                           </p>
                           <div className="flex flex-wrap justify-center gap-3">
                              {['MP4', 'AVI', 'MKV', 'MP3', 'FLAC'].map(f => (
                                 <span key={f} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-white/5 group-hover:border-white/10 transition-all">{f}</span>
                              ))}
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="bg-zinc-900/60 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-slide-up relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative z-10">
                           <div className="flex items-center justify-between mb-10">
                              <h3 className="text-2xl font-black italic tracking-tighter">Mastering Métadonnées</h3>
                              <button
                                 onClick={() => setPendingMedia(null)}
                                 className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                              >
                                 <X size={24} />
                              </button>
                           </div>

                           <div className="space-y-8">
                              <div>
                                 <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Focus Médias</label>
                                 <div className="grid grid-cols-3 gap-3">
                                    {(['movie', 'series', 'music'] as MediaType[]).map(t => (
                                       <button
                                          key={t}
                                          onClick={() => setPendingMedia({ ...pendingMedia, type: t })}
                                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${pendingMedia.type === t ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-white/5 hover:border-white/10'}`}
                                       >
                                          {t}
                                       </button>
                                    ))}
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Titre du Projet</label>
                                    <input
                                       type="text"
                                       value={pendingMedia.title}
                                       onChange={e => setPendingMedia({ ...pendingMedia, title: e.target.value })}
                                       className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-netflix-red/50 transition-all placeholder:text-zinc-700"
                                    />
                                 </div>

                                 <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Crédit Artistique</label>
                                    <input
                                       type="text"
                                       value={pendingMedia.artist}
                                       onChange={e => setPendingMedia({ ...pendingMedia, artist: e.target.value })}
                                       className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-netflix-red/50 transition-all"
                                    />
                                 </div>

                                 <div className="grid grid-cols-2 gap-6">
                                    <div>
                                       <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Sortie</label>
                                       <input
                                          type="number"
                                          value={pendingMedia.year}
                                          onChange={e => setPendingMedia({ ...pendingMedia, year: parseInt(e.target.value) })}
                                          className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-netflix-red/50 transition-all"
                                       />
                                    </div>
                                    <div>
                                       <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Certification</label>
                                       <select
                                          value={pendingMedia.rating}
                                          onChange={e => setPendingMedia({ ...pendingMedia, rating: e.target.value })}
                                          className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-netflix-red/50 transition-all appearance-none cursor-pointer"
                                       >
                                          <option value="G">TOUT PUBLIC</option>
                                          <option value="PG">ACCORD PARENTAL</option>
                                          <option value="R">RESTREINT 16+</option>
                                          <option value="NC-17">ADULTE 18+</option>
                                       </select>
                                    </div>
                                 </div>

                                 <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Synopsis / Bio</label>
                                    <textarea
                                       value={pendingMedia.description}
                                       onChange={e => setPendingMedia({ ...pendingMedia, description: e.target.value })}
                                       className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-netflix-red/50 transition-all resize-none"
                                       rows={4}
                                    />
                                 </div>
                              </div>

                              <button
                                 onClick={async () => {
                                    const mediaToAdd = { ...pendingMedia, type: pendingMedia.type || selectedType } as Movie;
                                    const file = (window as any)._currentStudioFile;
                                    await addCustomMedia(mediaToAdd, file);
                                    setPendingMedia(null);
                                    document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' });
                                 }}
                                 className="group w-full bg-white hover:bg-netflix-red text-black hover:text-white font-black uppercase tracking-[0.2em] py-5 rounded-[2rem] transition-all shadow-[0_30px_60px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 text-xs"
                              >
                                 Finaliser le Master <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                              </button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Preview / Library */}
               <div className="lg:col-span-2 space-y-10">
                  {pendingMedia ? (
                     <div className="space-y-8 animate-fade-in">
                        {/* Visualizer Section */}
                        <div className="bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)] group/master relative">
                           <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/10 to-transparent opacity-0 group-hover/master:opacity-100 transition-opacity duration-1000" />
                           <div className="relative aspect-video bg-black group/viz overflow-hidden">
                              {pendingMedia.type !== 'music' ? (
                                 candidates.length > 0 ? (
                                    <video
                                       src={pendingMedia.videoUrl}
                                       className="w-full h-full object-contain"
                                       controls
                                       poster={pendingMedia.backdropUrl}
                                    />
                                 ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/50 backdrop-blur-3xl p-12 text-center relative overflow-hidden">
                                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                       <div className="w-32 h-32 rounded-full bg-zinc-800/50 flex items-center justify-center mb-8 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                          <AlertTriangle size={64} className="text-zinc-600 animate-pulse" />
                                       </div>
                                       <h3 className="text-2xl font-black italic mb-3 tracking-tighter">Flux Vidéo Non Décodable</h3>
                                       <p className="text-sm text-zinc-500 max-w-sm leading-relaxed font-bold">
                                          Le navigateur ne peut pas lire ce codec (AVI/DIVX). <br />
                                          <span className="text-netflix-red">Myflix Master</span> va tout de même générer vos pochettes via l'IA.
                                       </p>
                                    </div>
                                 )
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black relative">
                                    <img src={pendingMedia.thumbnailUrl} className="w-72 h-72 object-cover rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-float" alt="" />
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                                    <div className="absolute bottom-10 left-10 flex gap-4">
                                       <div className="w-2 h-20 bg-white/20 rounded-full animate-pulse self-end" />
                                       <div className="w-2 h-32 bg-netflix-red rounded-full animate-pulse self-end delay-75" />
                                       <div className="w-2 h-24 bg-white/20 rounded-full animate-pulse self-end delay-150" />
                                    </div>
                                 </div>
                              )}
                              <div className="absolute top-8 left-8 z-10">
                                 <div className={`flex items-center gap-3 ${candidates.length > 0 ? 'bg-netflix-red/20' : 'bg-zinc-800/50'} backdrop-blur-xl border border-white/10 pl-3 pr-5 py-2 rounded-full shadow-2xl`}>
                                    <div className={`w-2.5 h-2.5 ${candidates.length > 0 ? 'bg-netflix-red' : 'bg-yellow-500'} rounded-full animate-pulse`} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                       {candidates.length > 0 ? 'Monitor Master Direct' : 'Mode Backup IA Actif'}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="p-10 bg-gradient-to-b from-zinc-900 via-zinc-900 to-black">
                              <div className="flex justify-between items-start mb-6">
                                 <div>
                                    <h2 className="text-4xl font-black mb-2 italic tracking-tighter">{pendingMedia.title}</h2>
                                    <div className="flex items-center gap-3">
                                       <span className="text-zinc-400 font-bold">{pendingMedia.artist}</span>
                                       <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                       <span className="text-zinc-500 font-bold">{pendingMedia.year}</span>
                                       <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                       <div className="flex gap-1">
                                          {pendingMedia.genre?.map(g => (
                                             <span key={g} className="text-[10px] font-black uppercase tracking-widest bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{g}</span>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-xl">
                                    <span className="text-xs uppercase font-black text-zinc-400 tracking-widest">{pendingMedia.rating}</span>
                                 </div>
                              </div>
                              <p className="text-zinc-500 leading-relaxed max-w-3xl font-medium">{pendingMedia.description}</p>
                           </div>
                        </div>

                        {/* Cover Selection System */}
                        <div className="bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-800 shadow-2xl">
                           <div className="flex items-center justify-between mb-10">
                              <div>
                                 <h3 className="text-2xl font-black italic tracking-tighter mb-1">Système de Cover Intelligent</h3>
                                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Sélectionnez le meilleur visuel pour votre bibliothèque</p>
                              </div>
                              <div className="flex gap-4">
                                 <input
                                    type="file"
                                    id="custom-cover"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                       const file = e.target.files?.[0];
                                       if (file) {
                                          const url = URL.createObjectURL(file);
                                          setPendingMedia({ ...pendingMedia, thumbnailUrl: url, backdropUrl: url });
                                       }
                                    }}
                                 />
                                 <button
                                    onClick={() => document.getElementById('custom-cover')?.click()}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-2xl transition-all flex items-center gap-3 border border-white/5 active:scale-95"
                                 >
                                    <Upload size={14} /> Upload Manuel
                                 </button>
                                 <button
                                    onClick={handleRescan}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-2xl transition-all flex items-center gap-3 border border-white/5 active:scale-95"
                                 >
                                    <Camera size={14} /> Scanner Auto
                                 </button>
                                 <button
                                    onClick={() => pickBestCoverWithAI()}
                                    disabled={status.includes('IA')}
                                    className="bg-white text-black hover:bg-netflix-red hover:text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-2xl transition-all flex items-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50"
                                 >
                                    <Sparkles size={14} className={status.includes('IA') ? 'animate-spin' : ''} />
                                    {status.includes('IA') ? 'Analyse...' : 'Suggestion IA'}
                                 </button>
                              </div>
                           </div>

                           {candidates.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                 {candidates.map((img, i) => (
                                    <div
                                       key={i}
                                       onClick={() => setPendingMedia({ ...pendingMedia, thumbnailUrl: img, backdropUrl: img })}
                                       className={`relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all duration-300 group ${pendingMedia.thumbnailUrl === img ? 'border-netflix-red scale-105 shadow-[0_0_40px_rgba(229,9,20,0.4)]' : 'border-zinc-800 hover:border-zinc-600'}`}
                                    >
                                       <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Frame ${i}`} />
                                       <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${pendingMedia.thumbnailUrl === img ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-500 ${pendingMedia.thumbnailUrl === img ? 'bg-netflix-red scale-110' : 'bg-white/20 backdrop-blur-md rotate-12 group-hover:rotate-0'}`}>
                                             <Sparkles size={20} className="text-white" />
                                          </div>
                                       </div>
                                       <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-xl rounded-lg text-[10px] font-black uppercase tracking-tighter text-white/70">
                                          Capture #{i + 1}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600 space-y-3">
                                 <RefreshCcw size={24} className="animate-spin opacity-20" />
                                 <p className="text-xs font-black uppercase tracking-[0.2em] italic">Extraction des captures en cours...</p>
                              </div>
                           )}
                        </div>
                     </div>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center bg-zinc-900 rounded-[3rem] border border-zinc-800 min-h-[500px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="text-center space-y-6 relative z-10 px-20">
                           <div className="w-24 h-24 bg-zinc-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl group-hover:rotate-12 transition-transform duration-700">
                              <Layers size={48} className="text-zinc-700 group-hover:text-netflix-red transition-colors" />
                           </div>
                           <h4 className="text-2xl font-black italic tracking-tighter">Visualiseur Studio</h4>
                           <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                              Une fois votre média importé, il apparaîtra ici pour un traitement complet.
                              L'IA extraira automatiquement les meilleures images pour votre cover.
                           </p>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Media Library - Grid View */}
            {customContent.length > 0 && (
               <div className="mt-20 scroll-mt-24" id="library-section">
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                     <h2 className="text-3xl font-black italic tracking-tighter">Ma Bibliothèque Master</h2>
                     <div className="flex gap-3">
                        <button className="px-6 py-2.5 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-netflix-red hover:text-white transition-all shadow-xl">
                           Tout ({customContent.length})
                        </button>
                        <button className="px-6 py-2.5 bg-zinc-900 text-zinc-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all border border-white/5">
                           Films
                        </button>
                        <button className="px-6 py-2.5 bg-zinc-900 text-zinc-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all border border-white/5">
                           Séries
                        </button>
                        <button className="px-6 py-2.5 bg-zinc-900 text-zinc-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all border border-white/5">
                           Audio
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                     {customContent.map((media) => (
                        <div key={media.id} className="group relative bg-zinc-900 rounded-[1.5rem] overflow-hidden border border-zinc-800 hover:border-netflix-red/50 transition-all duration-500 cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                           <div className="relative aspect-[2/3] overflow-hidden">
                              <img src={media.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={media.title} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                              {/* Quick actions on hover */}
                              <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       removeCustomMedia(media.id);
                                    }}
                                    className="w-10 h-10 bg-black/80 backdrop-blur-xl rounded-2xl flex items-center justify-center hover:bg-netflix-red transition-all shadow-2xl active:scale-90"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>

                              {/* Media Type Badge */}
                              <div className="absolute bottom-4 left-4 flex gap-2">
                                 <div className="bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                    {media.type === 'music' ? <Music size={12} className="text-netflix-red" /> : <Film size={12} className="text-netflix-red" />}
                                    <span className="text-[9px] font-black uppercase tracking-widest">{media.type}</span>
                                 </div>
                                 <div className="bg-netflix-red px-2 py-1.5 rounded-xl flex items-center">
                                    <Zap size={10} className="text-white fill-white" />
                                 </div>
                              </div>
                           </div>

                           <div className="p-5">
                              <h3 className="font-black italic text-sm truncate mb-1.5 tracking-tighter">{media.title}</h3>
                              <div className="flex items-center justify-between">
                                 <p className="text-[10px] text-zinc-500 font-bold uppercase truncate max-w-[70%]">{media.artist}</p>
                                 <span className="text-[9px] font-black text-zinc-700">{media.year}</span>
                              </div>
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

export default Studio;
