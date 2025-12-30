
import React, { useState } from 'react';
import { MessageSquare, Send, X, Bot, Loader2, AlertCircle } from 'lucide-react';
import { generateCompletion, AIError } from '../services/ai';
import { useStore } from '../services/store';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'error', text: string }[]>([
    { role: 'assistant', text: 'Salut ! Je suis ton assistant Myflix. Dis-moi ce que tu veux regarder.' }
  ]);
  const [loading, setLoading] = useState(false);
  const { customContent, geminiKey, activeTrack, setSettingsOpen } = useStore();

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
        const systemPrompt = `IDENTITÉ : Tu es le Concierge Myflix, assistant IA premium spécialisé dans les recommandations de contenu.

BIBLIOTHÈQUE DISPONIBLE : ${customContent.map(m => `"${m.title}" (${m.type})`).join(', ') || 'Aucun contenu pour le moment'}.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT en Français
2. Sois concis (max 3 phrases)
3. Recommande SEULEMENT des contenus de la bibliothèque ci-dessus
4. Si la bibliothèque est vide, suggère d'ajouter du contenu via le Studio
5. Utilise un ton élégant et professionnel (comme un concierge de luxe)
6. Si la question est hors contexte Myflix, ramène poliment vers le cinéma/séries/musique

COMPORTEMENT :
- Pour une recherche : Analyse l'ambiance/thème demandé et recommande le meilleur match
- Pour une question générale : Guide l'utilisateur vers les fonctionnalités Myflix
- Toujours terminer par une suggestion d'action concrète`;

        const text = await generateCompletion(geminiKey, userMsg, systemPrompt);
        setMessages(prev => [...prev, { role: 'assistant', text }]);

    } catch (err: any) {
      console.error("AI Error:", err);
      if (err instanceof AIError && err.code === "MYFLIX_CONFIG_REQUIRED") {
        setMessages(prev => [...prev, {
          role: 'error',
          text: "Clé API manquante ou invalide. Veuillez configurer l'IA."
        }]);
        setSettingsOpen(true);
      } else {
        setMessages(prev => [...prev, {
          role: 'error',
          text: err?.message || "Problème de connexion AI."
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const containerBottom = activeTrack ? 'bottom-24 md:bottom-28' : 'bottom-6';

  return (
    <div className={`fixed ${containerBottom} right-6 z-[90] transition-all duration-500`}>
      {isOpen ? (
        <div className="bg-zinc-900/95 backdrop-blur-2xl border border-white/10 w-80 md:w-96 h-[340px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-pop-out">
          <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-4 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <span className="font-semibold text-sm text-white">Assistant Myflix</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] ${m.role === 'user' ? 'bg-netflix-red text-white' :
                  m.role === 'error' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                    'bg-zinc-800 text-gray-200'
                  }`}>
                  {m.role === 'error' && <AlertCircle size={12} className="inline mr-2 mb-0.5" />}
                  <span style={{ whiteSpace: 'pre-line' }}>{m.text}</span>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-zinc-800 p-2 rounded-2xl"><Loader2 className="w-4 h-4 animate-spin text-netflix-red" /></div></div>}
          </div>

          <div className="p-3 border-t border-white/5 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !loading && handleSend()}
              disabled={loading}
              placeholder="Question..."
              className="flex-1 bg-zinc-800 border-none rounded-xl px-4 py-2 text-xs outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-netflix-red p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
              {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-4 rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
        >
          <MessageSquare className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
};

export default AIChat;
