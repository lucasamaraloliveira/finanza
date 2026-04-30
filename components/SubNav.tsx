
import React from 'react';
import { ViewType } from '../types';
import { VIEW_GROUPS, ICONS } from '../constants';

interface SubNavProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const SubNav: React.FC<SubNavProps> = ({ currentView, setView }) => {
  // Find which group the current view belongs to
  const groupKey = Object.entries(VIEW_GROUPS).find(([_, group]) => 
    group.views.some(v => v.id === currentView)
  )?.[0];

  if (!groupKey) return null;

  const group = VIEW_GROUPS[groupKey as keyof typeof VIEW_GROUPS];

  // Don't show sub-nav if there's only one view in the group
  if (group.views.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 p-1.5 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 w-fit">
      {group.views.map((v) => {
        const Icon = ICONS[v.icon as keyof typeof ICONS];
        const isActive = currentView === v.id;

        return (
          <button
            key={v.id}
            onClick={() => setView(v.id as ViewType)}
            className={`
              flex items-center gap-2 px-3 xl:px-4 py-2 rounded-xl text-[10px] xl:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0
              ${isActive 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }
            `}
          >
            <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
              <Icon />
            </span>
            {v.label}
          </button>
        );
      })}
    </div>
  );
};

export default SubNav;
