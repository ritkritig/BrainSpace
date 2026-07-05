import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineSquares2X2,
  HiOutlineDocumentText,
  HiOutlineBookmarkSquare,
  HiOutlineArchiveBox,
  HiOutlineFolderOpen,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineSparkles,
  HiOutlineXMark,
} from 'react-icons/hi2';

const navItems = [
  { to: '/', icon: HiOutlineSquares2X2, label: 'Dashboard' },
  { to: '/notes', icon: HiOutlineDocumentText, label: 'All Notes' },
  { to: '/pinned', icon: HiOutlineBookmarkSquare, label: 'Pinned Notes' },
  { to: '/archived', icon: HiOutlineArchiveBox, label: 'Archived Notes' },
  { to: '/folders', icon: HiOutlineFolderOpen, label: 'Folders' },
  { to: '/settings', icon: HiOutlineCog6Tooth, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col
          bg-white dark:bg-dark-850 border-r border-slate-200 dark:border-slate-700/60
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative
        `}
      >
        {/* ─── Brand Header ─────────────────────────────── */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-100 dark:border-slate-700/40 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md flex-shrink-0">
            <HiOutlineSparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold font-display text-slate-800 dark:text-white truncate">
              BrainSpace
            </span>
          )}
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Navigation Links ──────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* ─── Collapse Toggle (desktop only) ──────────── */}
        <div className="hidden lg:block px-3 pb-2">
          <button
            onClick={onToggleCollapse}
            className="nav-link w-full justify-center"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <HiOutlineChevronDoubleRight className="w-5 h-5" />
            ) : (
              <>
                <HiOutlineChevronDoubleLeft className="w-5 h-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* ─── User Info + Logout ────────────────────────── */}
        <div className={`border-t border-slate-100 dark:border-slate-700/40 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`nav-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:text-red-400 ${collapsed ? 'justify-center px-2' : ''}`}
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
