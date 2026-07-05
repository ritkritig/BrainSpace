import { useState } from 'react';
import {
  HiOutlineCog6Tooth,
  HiOutlineUser,
  HiOutlineSwatch,
  HiOutlineInformationCircle,
  HiOutlineSun,
  HiOutlineMoon,
} from 'react-icons/hi2';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      await authService.updateProfile({ name: name.trim() });
      updateUser({ ...user, name: name.trim() });
      addToast('Profile updated', 'success');
    } catch {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="page-container settings-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            <HiOutlineCog6Tooth className="page-title-icon" />
            Settings
          </h1>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <HiOutlineUser className="settings-card-icon" />
            <h2 className="settings-card-title">Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="settings-card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">
                Name
              </label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-email">
                Email
              </label>
              <input
                id="settings-email"
                type="email"
                className="form-input form-input-readonly"
                value={user?.email || ''}
                readOnly
                disabled
              />
            </div>
            <div className="settings-card-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || name.trim() === (user?.name || '')}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Appearance Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <HiOutlineSwatch className="settings-card-icon" />
            <h2 className="settings-card-title">Appearance</h2>
          </div>
          <div className="settings-card-body">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Dark Mode</span>
                <span className="settings-row-description">
                  Switch between light and dark themes
                </span>
              </div>
              <button
                type="button"
                className={`toggle-switch ${isDark ? 'active' : ''}`}
                onClick={toggleTheme}
                role="switch"
                aria-checked={isDark}
                aria-label="Toggle dark mode"
              >
                <span className="toggle-switch-thumb">
                  {isDark ? (
                    <HiOutlineMoon className="toggle-switch-icon" />
                  ) : (
                    <HiOutlineSun className="toggle-switch-icon" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <HiOutlineInformationCircle className="settings-card-icon" />
            <h2 className="settings-card-title">About</h2>
          </div>
          <div className="settings-card-body">
            <div className="about-info">
              <div className="about-row">
                <span className="about-label">App Name</span>
                <span className="about-value">BrainSpace</span>
              </div>
              <div className="about-row">
                <span className="about-label">Version</span>
                <span className="about-value">1.0.0</span>
              </div>
              <div className="about-row about-footer">
                <span className="about-value">
                  Built with ❤️ using MERN Stack
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
