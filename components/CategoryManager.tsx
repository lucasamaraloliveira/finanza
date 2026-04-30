
import React, { useState } from 'react';
import { CategoryConfig } from '../types';
import { PRESET_COLORS, ICONS } from '../constants';

interface CategoryManagerProps {
  categories: CategoryConfig[];
  onUpdate: (categories: CategoryConfig[]) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onUpdate, isDarkMode, setIsDarkMode }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✨');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const addCategory = () => {
    if (!name) return;
    
    const isColorUsed = categories.some(c => c.hex === selectedColor.hex);
    if (isColorUsed) {
      alert("Esta cor já está sendo usada por outra categoria! Escolha uma cor diferente para manter a distinção visual.");
      return;
    }

    const newCat: CategoryConfig = {
      id: name,
      label: name,
      icon,
      color: selectedColor.bg,
      hex: selectedColor.hex,
      isSystem: false
    };

    onUpdate([...categories, newCat]);
    setName('');
  };

  const removeCategory = (id: string) => {
    onUpdate(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Aparência</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escolha o seu estilo visual</p>
            </div>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-600'}`}>
                  {isDarkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">
                    Modo {isDarkMode ? 'Escuro' : 'Claro'}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">Clique para alternar o tema</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isDarkMode ? 'left-7' : 'left-1'}`} />
              </div>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Nova Categoria</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personalize seus lançamentos</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome</label>
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Ex: Jogos, Investimento..."
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ícone (Emoji)</label>
              <input 
                type="text" value={icon} onChange={e => setIcon(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-2xl text-center"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cor Exclusiva</label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map(color => {
                  const isUsed = categories.some(c => c.hex === color.hex);
                  return (
                    <button
                      key={color.hex}
                      onClick={() => !isUsed && setSelectedColor(color)}
                      disabled={isUsed}
                      className={`
                        h-10 rounded-xl transition-all relative flex items-center justify-center
                        ${color.bg} ${selectedColor.hex === color.hex ? 'ring-4 ring-indigo-500/30 scale-110 z-10' : ''}
                        ${isUsed ? 'opacity-20 cursor-not-allowed grayscale' : 'hover:scale-105'}
                      `}
                    >
                      {selectedColor.hex === color.hex && <span className="text-white text-xs font-black">✓</span>}
                      {isUsed && <span className="text-white/40 text-[8px] font-black uppercase">Uso</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={addCategory}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              Criar Categoria
            </button>
          </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800">
               <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Minhas Categorias</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`${cat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm`}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 dark:text-slate-100 text-sm">{cat.label}</p>
                      {cat.isSystem && <span className="text-[8px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">Sistema</span>}
                    </div>
                  </div>
                  {!cat.isSystem && (
                    <button onClick={() => removeCategory(cat.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                      <ICONS.Trash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
