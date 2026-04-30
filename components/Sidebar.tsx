import { ICONS, VIEW_GROUPS } from '../constants';
import { ViewType } from '../types';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  view,
  setView,
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
  isDarkMode,
  setIsDarkMode
}) => {
  // Helper to find which group a view belongs to
  const getActiveGroup = (currentView: ViewType) => {
    return Object.entries(VIEW_GROUPS).find(([_, group]) => 
      group.views.some(v => v.id === currentView)
    )?.[0] || 'overview';
  };

  const activeGroup = getActiveGroup(view);

  const menuItems = Object.entries(VIEW_GROUPS).map(([id, group]) => ({
    id,
    label: group.label,
    icon: ICONS[group.icon as keyof typeof ICONS](),
    defaultView: group.views[0].id as ViewType
  }));

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-950/20 backdrop-blur-md z-40 transition-opacity duration-500 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`
        fixed z-50
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        flex flex-col
        lg:top-6 lg:left-6 lg:bottom-6
        inset-y-0 left-0
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        ${isOpen ? 'translate-x-0 opacity-100 w-64' : '-translate-x-full lg:translate-x-0'}
        bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl
        border border-white/40 dark:border-slate-800/50
        lg:rounded-[1.5rem] shadow-2xl shadow-indigo-500/10
      `}>
        {/* Toggle Button Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
            rounded-full items-center justify-center text-slate-400 hover:text-indigo-600 transition-all z-50
            ${isCollapsed ? 'rotate-180' : ''}
          `}
        >
          <ICONS.ChevronLeft />
        </button>

        <div className={`p-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-2xl text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-violet-600 tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
                Finanza
              </h1>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ICONS.Close />
            </button>
          )}
        </div>

        <nav className={`flex-1 overflow-y-auto py-2 ${isCollapsed ? 'px-2' : 'px-5'} scrollbar-none transition-all`}>
          <div className={`${isCollapsed ? 'space-y-1' : 'space-y-3'}`}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setView(item.defaultView); setIsOpen(false); }}
                title={isCollapsed ? item.label : ''}
                className={`
                  w-full flex items-center transition-all duration-300 group relative
                  ${isCollapsed ? 'justify-center py-3 px-0 rounded-xl' : 'gap-3 px-4 py-3.5 rounded-2xl'}
                  ${activeGroup === item.id
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-300'
                  }
                `}
              >
                <div className={`flex flex-col items-center gap-1 transition-transform duration-300 ${activeGroup === item.id ? 'scale-110' : 'group-hover:scale-110'} flex-shrink-0`}>
                  <div className="scale-110">
                    {item.icon}
                  </div>
                  {isCollapsed && (
                    <span className="text-[7px] font-black uppercase tracking-tight opacity-60 whitespace-nowrap mt-1 max-w-[64px] truncate px-0.5">
                      {item.label}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-[13px] font-black whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-300 tracking-tighter uppercase">
                    {item.label}
                  </span>
                )}
                {isCollapsed && activeGroup === item.id && (
                  <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className={`p-6 mt-auto transition-all ${isCollapsed ? 'px-2' : 'px-6'}`}>
          {!isCollapsed && (
            <div className="px-4 flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between opacity-50">
                <span className="text-[8px] font-black text-slate-400 tracking-tighter">Finanza v2.5</span>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
