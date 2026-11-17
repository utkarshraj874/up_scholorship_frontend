import { useState } from 'react';
import {
  BookOpen,
  FileText,
  GraduationCap,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  User,
  Users,
  X,
  Bot,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const studentNavigation = [
  { id: 'profile', label: 'Student profile', icon: User },
  { id: 'documents', label: 'Document vault', icon: FileText },
  { id: 'help', label: 'Help desk', icon: MessageSquare },
  { id: 'guide', label: 'Application guide', icon: BookOpen },
  { id: 'chat', label: 'Scholarship assistant', icon: Bot },
];

const adminNavigation = [
  { id: 'admin', label: 'Student verification', icon: Users },
  { id: 'help', label: 'Help desk', icon: MessageSquare },
  { id: 'guide', label: 'Application guide', icon: BookOpen },
  { id: 'chat', label: 'Scholarship assistant', icon: Bot },
];

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onShowToast,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const navigation = isAdmin ? adminNavigation : studentNavigation;

  const selectTab = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      <header className={`app-topbar${user ? ' app-topbar-authenticated' : ''}`}>
        {user ? (
          <>
            <button
              type="button"
              className="icon-button mobile-menu-button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="portal-sidebar"
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
            <div className="mobile-brand">
              <GraduationCap size={21} />
              <span>Scholarship portal</span>
            </div>
          </>
        ) : (
          <>
            <a className="guest-brand" href="/" aria-label="UP Scholarship Portal home">
              <span className="brand-mark"><GraduationCap size={22} /></span>
              <span>
                <strong>UP Scholarship Portal</strong>
                <small>IIIT Ranchi student facilitation</small>
              </span>
            </a>
            <button type="button" className="btn btn-primary" onClick={onOpenAuth}>
              <LogIn size={16} />
              <span>Login / Register</span>
            </button>
          </>
        )}
      </header>

      {user && (
        <>
          {mobileOpen && (
            <button
              type="button"
              className="sidebar-backdrop"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            />
          )}
          <aside
            id="portal-sidebar"
            className={`app-sidebar${mobileOpen ? ' app-sidebar-open' : ''}`}
            aria-label="Main navigation"
          >
            <div className="sidebar-brand">
              <span className={`brand-mark${isAdmin ? ' brand-mark-admin' : ''}`}>
                {isAdmin ? <ShieldCheck size={23} /> : <GraduationCap size={23} />}
              </span>
              <span className="sidebar-brand-copy">
                <strong>IIIT Ranchi</strong>
                <small>{isAdmin ? 'Coordinator desk' : 'UP Scholarship'}</small>
              </span>
              <button
                type="button"
                className="icon-button sidebar-close-button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={19} />
              </button>
            </div>

            <div className="sidebar-section-label">Workspace</div>
            <nav className="sidebar-navigation">
              {navigation.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`sidebar-link${activeTab === id ? ' sidebar-link-active' : ''}`}
                  onClick={() => selectTab(id)}
                  aria-current={activeTab === id ? 'page' : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className="sidebar-bottom">
              <div className="sidebar-user">
                <span className={`sidebar-avatar${isAdmin ? ' sidebar-avatar-admin' : ''}`}>
                  {user.name?.trim()?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="sidebar-user-copy">
                  <strong>{user.name || (isAdmin ? 'Coordinator' : 'Student')}</strong>
                  <small>{user.email}</small>
                </span>
              </div>
              <div className="sidebar-actions">
                <div className="sidebar-notifications">
                  <NotificationDropdown user={user} onShowToast={onShowToast} />
                  <span>Notifications</span>
                </div>
                <button type="button" className="sidebar-logout" onClick={onLogout}>
                  <LogOut size={17} />
                  <span>Sign out</span>
                </button>
              </div>
              <div className="sidebar-footnote">
                {isAdmin ? 'Student facilitation & verification' : 'Student facilitation portal'}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
