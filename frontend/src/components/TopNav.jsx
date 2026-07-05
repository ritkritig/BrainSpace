import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineBars3,
} from 'react-icons/hi2';

export default function TopNav({ onToggleSidebar, onSearchClick }) {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-4 sm:px-6 bg-white/80 dark:bg-dark-850/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50">
      {/* Left: Mobile hamburger + Search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          aria-label="Toggle sidebar"
        >
          <HiOutlineBars3 className="w-5 h-5" />
        </button>

        <button
          onClick={onSearchClick}
          className="flex items-center gap-3 px-4 py-2 w-full max-w-md rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm cursor-pointer"
        >
          <HiOutlineMagnifyingGlass className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Search notes, folders, tags...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="hidden md:inline-flex ml-auto items-center gap-0.5 px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-[10px] font-mono text-slate-500 shadow-sm border border-slate-200 dark:border-slate-600">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Theme toggle + User */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <HiOutlineSun className="w-5 h-5 text-amber-400" />
          ) : (
            <HiOutlineMoon className="w-5 h-5" />
          )}
        </button>

        {user && (
          <div className="group relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer ring-2 ring-white dark:ring-dark-850 shadow-sm">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block">
              <div className="px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs shadow-lg whitespace-nowrap">
                {user.name}
                <div className="text-slate-400 text-[10px]">{user.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
