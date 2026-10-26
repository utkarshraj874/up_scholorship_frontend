import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileCheck2,
  FileText,
  GraduationCap,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import DocumentsView from './components/DocumentsView';
import GuidelinesView from './components/GuidelinesView';
import AdminView from './components/AdminView';
import HelpDeskView from './components/HelpDeskView';
import ChatbotView from './components/ChatbotView';
import Toast from './components/Toast';
import { api } from './services/api';

const portalFeatures = [
  {
    icon: UserRoundCheck,
    title: 'Keep your profile ready',
    description: 'Organize academic and personal details needed for your scholarship application.',
    tone: 'blue',
  },
  {
    icon: FileCheck2,
    title: 'Manage documents in one place',
    description: 'Upload and review the required certificates and application documents.',
    tone: 'green',
  },
  {
    icon: Bot,
    title: 'Get guided support',
    description: 'Find application guidance and ask the scholarship assistant your questions.',
    tone: 'violet',
  },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const token = localStorage.getItem('scholarship_token');
      if (token) {
        try {
          const userData = await api.getMe();
          if (!cancelled) {
            setUser(userData);
            setActiveTab(userData.role === 'admin' ? 'admin' : 'profile');
          }
        } catch (err) {
          console.error('Session expired or invalid', err);
          localStorage.removeItem('scholarship_token');
        }
      }
      if (!cancelled) setInitializing(false);
    };

    initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (toastObj) => {
    setToast(toastObj);
    window.setTimeout(() => setToast(null), 4000);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setActiveTab(userData.role === 'admin' ? 'admin' : 'profile');
    showToast({
      type: 'success',
      message: `Welcome, ${userData.name || (userData.role === 'admin' ? 'Coordinator' : 'Student')}!`,
    });
    api.getMe().then((authenticatedUser) => {
      setUser(authenticatedUser);
      setActiveTab(authenticatedUser.role === 'admin' ? 'admin' : 'profile');
    }).catch((err) => {
      console.error('Could not refresh authenticated user details', err);
      if (!userData.role) {
        showToast({ type: 'error', message: 'Signed in, but your account details could not be loaded.' });
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('scholarship_token');
    setUser(null);
    setActiveTab('profile');
    showToast({ type: 'info', message: 'Logged out successfully' });
  };

  if (initializing) {
    return (
      <div className="loading-screen">
        <div className="loading-mark"><GraduationCap size={30} /></div>
        <h1>UP Scholarship Portal</h1>
        <p>Preparing your workspace…</p>
      </div>
    );
  }

  return (
    <div className={`app-container${user ? ' app-has-sidebar' : ''}`}>
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onShowToast={showToast}
      />

      <main className={`main-content${user ? ' authenticated-content' : ' guest-content'}`}>
        {!user ? (
          <div className="landing-page">
            <section className="landing-hero">
              <div className="hero-copy">
                <span className="hero-eyebrow">
                  <ShieldCheck size={15} />
                  IIIT Ranchi · UP domicile scholarship support
                </span>
                <h1>
                  Your scholarship journey,
                  <span> clearly organized.</span>
                </h1>
                <p className="hero-description">
                  A student-first workspace to prepare your profile, keep documents together,
                  and get practical guidance for the UP Postmatric Scholarship process.
                </p>
                <div className="hero-actions">
                  <button type="button" className="btn btn-primary hero-primary-action" onClick={() => setIsAuthOpen(true)}>
                    Get started <ArrowRight size={17} />
                  </button>
                  <span className="hero-note">
                    <CheckCircle2 size={15} /> Guidance and document organization in one place
                  </span>
                </div>
              </div>
              <div className="hero-visual" aria-hidden="true">
                <div className="hero-orbit hero-orbit-one" />
                <div className="hero-orbit hero-orbit-two" />
                <div className="hero-icon-card">
                  <GraduationCap size={54} strokeWidth={1.6} />
                </div>
                <div className="hero-float-card hero-float-top">
                  <span className="hero-float-icon"><FileText size={17} /></span>
                  <span><strong>Documents</strong><small>Ready to organize</small></span>
                </div>
                <div className="hero-float-card hero-float-bottom">
                  <span className="hero-float-icon hero-float-success"><CheckCircle2 size={17} /></span>
                  <span><strong>One step at a time</strong><small>Stay on track</small></span>
                </div>
                <div className="hero-spark hero-spark-one" />
                <div className="hero-spark hero-spark-two" />
              </div>
            </section>

            <section className="feature-section" aria-labelledby="feature-heading">
              <div className="section-heading">
                <span className="section-kicker">A simpler way to prepare</span>
                <h2 id="feature-heading">Everything you need to stay organized</h2>
                <p>Bring the key parts of your scholarship preparation together in one helpful workspace.</p>
              </div>
              <div className="feature-grid">
                {portalFeatures.map(({ icon: Icon, title, description, tone }, index) => (
                  <article className="feature-card" key={title}>
                    <span className={`feature-icon feature-icon-${tone}`}><Icon size={21} /></span>
                    <span className="feature-number">0{index + 1}</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="landing-callout">
              <div className="callout-icon"><GraduationCap size={23} /></div>
              <div>
                <h2>Ready to get your details in order?</h2>
                <p>Create an account or sign in to continue to your student workspace.</p>
              </div>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAuthOpen(true)}>
                Open portal <ArrowRight size={16} />
              </button>
            </section>
          </div>
        ) : (
          <div className="workspace-content">
            {activeTab === 'admin' && <AdminView user={user} onShowToast={showToast} />}
            {activeTab === 'help' && <HelpDeskView user={user} onShowToast={showToast} />}
            {activeTab === 'profile' && <ProfileView user={user} onShowToast={showToast} />}
            {activeTab === 'documents' && <DocumentsView user={user} onShowToast={showToast} />}
            {activeTab === 'guide' && <GuidelinesView />}
            {activeTab === 'chat' && <ChatbotView user={user} onShowToast={showToast} />}
          </div>
        )}
      </main>

      <footer className={`app-footer${user ? ' authenticated-footer' : ''}`}>
        <strong>Indian Institute of Information Technology Ranchi</strong>
        <span>UP Postmatric Scholarship Facilitation System</span>
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
