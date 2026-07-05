import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { noteService, folderService } from '../services/api';
import NoteCard from '../components/NoteCard';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import {
  HiOutlineDocumentText,
  HiOutlineFolderOpen,
  HiOutlineBookmarkSquare,
  HiOutlineArchiveBox,
  HiOutlinePlus,
  HiOutlineSparkles,
} from 'react-icons/hi2';

const statConfig = [
  { key: 'totalNotes', label: 'Total Notes', icon: HiOutlineDocumentText, gradient: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', bgDark: 'dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' },
  { key: 'totalFolders', label: 'Total Folders', icon: HiOutlineFolderOpen, gradient: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', bgDark: 'dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'pinnedNotes', label: 'Pinned Notes', icon: HiOutlineBookmarkSquare, gradient: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50', bgDark: 'dark:bg-amber-900/20', textColor: 'text-amber-600 dark:text-amber-400' },
  { key: 'archivedNotes', label: 'Archived Notes', icon: HiOutlineArchiveBox, gradient: 'from-violet-500 to-violet-600', bgLight: 'bg-violet-50', bgDark: 'dark:bg-violet-900/20', textColor: 'text-violet-600 dark:text-violet-400' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [totalFolders, setTotalFolders] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, foldersRes] = await Promise.all([
        noteService.getStats(),
        folderService.getAll(),
      ]);
      setStats(statsRes.data.stats);
      setRecentNotes(statsRes.data.recentNotes || []);
      setTotalFolders(foldersRes.data.folders?.length || 0);
    } catch (err) {
      addToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePin = async (id) => {
    try {
      await noteService.pin(id);
      fetchData();
    } catch { addToast('Failed to update pin.', 'error'); }
  };

  const handleArchive = async (id) => {
    try {
      await noteService.archive(id);
      addToast('Note archived.', 'success');
      fetchData();
    } catch { addToast('Failed to archive.', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await noteService.delete(id);
      addToast('Note deleted.', 'success');
      fetchData();
    } catch { addToast('Failed to delete.', 'error'); }
  };

  const handleDuplicate = async (id) => {
    try {
      await noteService.duplicate(id);
      addToast('Note duplicated.', 'success');
      fetchData();
    } catch { addToast('Failed to duplicate.', 'error'); }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) return <DashboardSkeleton />;

  const statValues = {
    totalNotes: stats?.totalNotes || 0,
    totalFolders,
    pinnedNotes: stats?.pinnedNotes || 0,
    archivedNotes: stats?.archivedNotes || 0,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ─── Welcome Header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white font-display">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} <span className="inline-block animate-pulse-slow">👋</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{today}</p>
        </div>
        <button
          onClick={() => navigate('/notes/new')}
          className="btn btn-primary btn-md self-start sm:self-auto"
        >
          <HiOutlinePlus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* ─── Stats Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfig.map((cfg, idx) => (
          <div
            key={cfg.key}
            className="card-hover p-5 flex items-start justify-between"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{cfg.label}</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{statValues[cfg.key]}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl ${cfg.bgLight} ${cfg.bgDark} flex items-center justify-center`}>
              <cfg.icon className={`w-5 h-5 ${cfg.textColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Recent Notes ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white font-display flex items-center gap-2">
            <HiOutlineSparkles className="w-5 h-5 text-primary-500" />
            Recently Updated
          </h2>
          <button
            onClick={() => navigate('/notes')}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium"
          >
            View all →
          </button>
        </div>

        {recentNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onClick={(id) => navigate(`/notes/${id}`)}
                onPin={handlePin}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <HiOutlineDocumentText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-600 dark:text-slate-300 mb-2">No notes yet</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Create your first note to get started!</p>
            <button onClick={() => navigate('/notes/new')} className="btn btn-primary btn-sm">
              <HiOutlinePlus className="w-4 h-4" /> Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
