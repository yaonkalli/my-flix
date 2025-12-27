
import React, { useState, useMemo } from 'react';
import { useStore } from '../services/store';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X } from 'lucide-react';
import { Profile } from '../types';

const Profiles: React.FC = () => {
  const { user, selectProfile, addProfile } = useStore();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');

  // Liste curatée d'avatars représentatifs (Styles Africains)
  // Utilisation de paramètres spécifiques : teints foncés, coiffures spécifiques (afro, dreads, etc.)
  const avatarOptions = useMemo(() => {
    const seeds = [
      { seed: 'Aoki', top: 'afro', skin: '614335' },
      { seed: 'Zuri', top: 'dreads', skin: 'ae5d29' },
      { seed: 'Kofi', top: 'shortCurly', skin: '614335' },
      { seed: 'Nala', top: 'hijab', skin: 'ae5d29' },
      { seed: 'Tunde', top: 'shaved', skin: '614335' },
      { seed: 'Imani', top: 'kinky', skin: 'ae5d29' },
      { seed: 'Jabari', top: 'shortFlat', skin: '614335' },
      { seed: 'Zola', top: 'bigHair', skin: 'ae5d29' },
      { seed: 'Malik', top: 'frizzle', skin: '614335' },
      { seed: 'Binti', top: 'bun', skin: 'ae5d29' },
      { seed: 'Kwame', top: 'shortWaved', skin: '614335' },
      { seed: 'Sia', top: 'curly', skin: 'ae5d29' },
    ];

    return seeds.map((config, i) => ({
      id: i,
      url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${config.seed}&skinColor=${config.skin}&top=${config.top}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
    }));
  }, []);

  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0].url);

  const handleSelect = (profile: Profile) => {
    selectProfile(profile);
    navigate('/browse');
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && selectedAvatar) {
      addProfile(newName.trim(), selectedAvatar);
      setNewName('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans overflow-hidden">

      {!showAddModal ? (
        <div className="w-full max-w-5xl px-6 animate-fade-in flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-medium mb-16 tracking-tight text-zinc-200">Qui regarde ?</h1>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {user.profiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => handleSelect(profile)}
                className="group flex flex-col items-center gap-4 cursor-pointer"
              >
                <div className="relative w-28 h-28 md:w-44 md:h-44 rounded-xl overflow-hidden border-4 border-transparent group-hover:border-white transition-all duration-300 shadow-xl">
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-zinc-500 group-hover:text-white transition-colors text-lg font-medium">
                  {profile.name}
                </span>
              </div>
            ))}

            <div
              onClick={() => setShowAddModal(true)}
              className="group flex flex-col items-center gap-4 cursor-pointer"
            >
              <div className="w-28 h-28 md:w-44 md:h-44 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 transition-all border-4 border-transparent group-hover:border-zinc-500">
                <Plus className="w-12 h-12 text-zinc-600 group-hover:text-zinc-300 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-zinc-600 group-hover:text-zinc-400 text-lg font-medium">Ajouter</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl px-6 animate-pop-out">
          <div className="bg-zinc-900 rounded-[40px] p-8 md:p-12 shadow-2xl space-y-10 border border-white/5">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold tracking-tight">Nouveau Profil</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white transition">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Nom du profil</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Ex: Kouamé, Fatou, Solo..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-xl outline-none focus:border-netflix-red transition-all placeholder:text-zinc-800"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Choisir ton identité visuelle</label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {avatarOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedAvatar(opt.url)}
                      className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-4 transition-all hover:scale-110 active:scale-95 ${selectedAvatar === opt.url ? 'border-netflix-red shadow-[0_0_20px_rgba(229,9,20,0.5)] z-10' : 'border-transparent opacity-40 hover:opacity-100'
                        }`}
                    >
                      <img src={opt.url} className="w-full h-full object-cover" alt="Avatar Option" />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full bg-white text-black py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.3em] hover:bg-netflix-red hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-3 shadow-xl"
              >
                C'est parti <Check size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles;
