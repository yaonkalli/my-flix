import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { Users, Film, Activity, Upload, Trash2, Edit, MoreVertical, Search, Bell, Menu, Shield, PlusCircle } from 'lucide-react';
import { useStore } from '../services/store';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'content' | 'users'>('stats');
  const { customContent, removeCustomMedia } = useStore();
  const navigate = useNavigate();

  const data = [
    { name: 'Jan', users: 400, views: 240, revenue: 1200 },
    { name: 'Feb', users: 300, views: 139, revenue: 900 },
    { name: 'Mar', users: 200, views: 980, revenue: 1500 },
    { name: 'Apr', users: 278, views: 390, revenue: 1100 },
    { name: 'May', users: 189, views: 480, revenue: 1800 },
    { name: 'Jun', users: 239, views: 380, revenue: 2100 },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex font-sans">
      
      {/* Modern Sidebar */}
      <aside className="w-72 bg-black border-r border-white/5 hidden md:flex flex-col relative z-20">
        <div className="p-8 flex items-center gap-3">
           <div className="w-8 h-8 bg-netflix-red rounded flex items-center justify-center shadow-red-600/20 shadow-lg">
             <Shield className="w-5 h-5 text-white" />
           </div>
          <div>
            <h1 className="text-netflix-red text-2xl font-brand tracking-wide leading-none">MYFLIX</h1>
            <span className="text-[9px] text-gray-500 tracking-widest uppercase block mt-1">Console Master</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem 
            icon={<Activity />} 
            label="Vue d'ensemble" 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
          />
          <NavItem 
            icon={<Film />} 
            label="Ma Bibliothèque" 
            active={activeTab === 'content'} 
            onClick={() => setActiveTab('content')} 
          />
          <NavItem 
            icon={<Users />} 
            label="Utilisateurs" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')} 
          />
        </nav>

        <div className="p-6 border-t border-white/5">
           <button onClick={() => navigate('/')} className="text-xs font-black uppercase tracking-widest text-gray-600 hover:text-white transition flex items-center gap-2">
             ← Quitter Console
           </button>
        </div>
      </aside>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f0f0f]">
        
        <header className="h-20 border-b border-white/5 bg-black/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
            <h2 className="text-lg font-black uppercase tracking-widest text-white italic">{activeTab === 'stats' ? 'Tableau de Bord' : 'Gestionnaire Library'}</h2>
            <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                   <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                   <input 
                    type="text" 
                    placeholder="Filtrer..." 
                    className="bg-[#1f1f1f] border border-white/5 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:outline-none w-64 transition-all"
                   />
                </div>
                <div className="w-10 h-10 rounded-xl bg-netflix-red flex items-center justify-center border border-white/20 shadow-lg">A</div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar">
          
          {activeTab === 'stats' && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard title="Total Library" value={customContent.length.toString()} change="Masters" isPos={true} />
                 <StatCard title="Heures Studio" value="124h" change="+12%" isPos={true} />
                 <StatCard title="Qualité Master" value="Hi-Fi" change="24-bit" isPos={true} />
              </div>

              <div className="grid grid-cols-1 gap-8">
                 <div className="bg-[#141414] border border-white/5 p-8 rounded-[40px] shadow-2xl">
                    <h3 className="font-black uppercase tracking-widest text-[10px] text-zinc-500 mb-8">Flux d'utilisation Studio</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#E50914" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                          <XAxis dataKey="name" stroke="#444" tick={{fill: '#555', fontSize: 10}} tickLine={false} axisLine={false} />
                          <YAxis stroke="#444" tick={{fill: '#555', fontSize: 10}} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', color: '#fff' }} />
                          <Area type="monotone" dataKey="revenue" stroke="#E50914" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="max-w-7xl mx-auto animate-fade-in">
               <div className="flex justify-between items-end mb-10">
                  <div className="space-y-4">
                     <h3 className="text-4xl font-black uppercase tracking-tighter italic">Library <span className="text-zinc-700">Storage</span></h3>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{customContent.length} Masters Enregistrés</p>
                  </div>
                  <button onClick={() => navigate('/studio')} className="bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-netflix-red hover:text-white transition shadow-2xl">
                    <PlusCircle className="w-4 h-4" /> Nouveau Master
                  </button>
               </div>

               <div className="bg-black border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                  {customContent.length === 0 ? (
                    <div className="p-20 text-center text-zinc-700 font-black uppercase tracking-[0.5em] text-xs">Bibliothèque Vide</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-[#1a1a1a] text-zinc-600 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                            <th className="px-8 py-6">Piste / Film</th>
                            <th className="px-8 py-6">Catégorie</th>
                            <th className="px-8 py-6">Identifiant AI</th>
                            <th className="px-8 py-6 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {customContent.map((movie) => (
                            <tr key={movie.id} className="hover:bg-white/[0.02] transition group">
                                <td className="px-8 py-6">
                                  <div className="flex items-center gap-5">
                                      <img src={movie.thumbnailUrl} alt="" className="w-14 h-14 object-cover rounded-xl shadow-2xl border border-white/10" />
                                      <div>
                                        <p className="font-black text-white text-sm uppercase tracking-tight">{movie.title}</p>
                                        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">{movie.year}</p>
                                      </div>
                                  </div>
                                </td>
                                <td className="px-8 py-6">
                                  <span className="px-3 py-1 bg-zinc-900 text-zinc-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5">{movie.type}</span>
                                </td>
                                <td className="px-8 py-6 text-[10px] text-zinc-600 font-mono">{movie.id}</td>
                                <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="p-3 bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition"><Edit className="w-4 h-4" /></button>
                                      <button onClick={() => removeCustomMedia(movie.id)} className="p-3 bg-zinc-900 rounded-xl text-zinc-400 hover:text-netflix-red transition"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Sub-components
const NavItem: React.FC<{icon: React.ReactNode, label: string, active: boolean, onClick: () => void}> = ({ icon, label, active, onClick }) => (
   <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-zinc-900 text-white shadow-xl border border-white/10' : 'text-zinc-600 hover:text-zinc-300'}`}>
      {/* Fix: use React.ReactElement<any> to allow the 'size' prop when cloning the icon component */}
      {React.cloneElement(icon as React.ReactElement<any>, { size: 18, className: active ? 'text-netflix-red' : '' })}
      <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
   </button>
);

const StatCard: React.FC<{title: string, value: string, change: string, isPos: boolean}> = ({ title, value, change, isPos }) => (
   <div className="bg-[#141414] border border-white/5 p-8 rounded-[35px] hover:border-white/10 transition shadow-2xl">
      <h3 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] mb-4">{title}</h3>
      <div className="flex items-end justify-between">
         <p className="text-4xl font-black text-white italic tracking-tighter">{value}</p>
         <span className="text-[9px] font-black uppercase tracking-widest text-netflix-red">{change}</span>
      </div>
   </div>
);

export default Admin;