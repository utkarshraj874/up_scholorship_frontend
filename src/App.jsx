import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import DocumentsView from './components/DocumentsView';
import GuidelinesView from './components/GuidelinesView';
import AdminView from './components/AdminView';
import HelpDeskView from './components/HelpDeskView';
import Toast from './components/Toast';
import { api } from './services/api';
import { GraduationCap, ShieldCheck, FileText, UserCheck, ArrowRight, Lock } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const showToast = (toastObj) => {
    setToast(toastObj);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const initAuth = async () => {
    const token = localStorage.getItem('scholarship_token');
    if (token) {
      try {
        const userData = await api.getMe();
        setUser(userData);
        if (userData.role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab((prev) => (prev === 'admin' ? 'profile' : prev));
        }
      } catch (err) {
        console.error('Session expired or invalid', err);
        localStorage.removeItem('scholarship_token');
        setUser(null);
      }
    }
    setInitializing(false);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('profile');
    }
    showToast({
      type: 'success',
      message: `Welcome, ${userData.name || (userData.role === 'admin' ? 'Coordinator' : 'Student')}!`,
    });
    initAuth();
  };


  const handleLogout = () => {
    localStorage.removeItem('scholarship_token');
    setUser(null);
    showToast({ type: 'info', message: 'Logged out successfully' });
  };

  if (initializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: '#2563eb',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GraduationCap size={30} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>IIIT Ranchi UP Scholarship Portal</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onShowToast={showToast}
      />


      {/* Main Content Area */}
      <main className="main-content">
        {!user ? (
          /* Unauthenticated Landing / Call to Action */
          <div
            style={{
              maxWidth: 880,
              margin: '32px auto',
              textAlign: 'center',
            }}
          >
            <div
              className="card"
              style={{
                padding: '48px 32px',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                border: '1.5px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 14,
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <GraduationCap size={34} color="#2563eb" />
              </div>

              <div style={{ display: 'inline-block', marginBottom: 12 }}>
                <span className="badge badge-primary">
                  IIIT Ranchi Scholarship Cell • UP Domicile Scheme
                </span>
              </div>

              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.25,
                  marginBottom: 14,
                }}
              >
                UP Scholarship Facilitation Portal
              </h1>

              <p
                style={{
                  fontSize: '1rem',
                  color: '#475569',
                  maxWidth: 640,
                  margin: '0 auto 28px',
                  lineHeight: 1.6,
                }}
              >
                Designed by the <strong>IIIT Ranchi Scholarship Coordinator</strong> to assist peers and juniors in managing student profile records, uploading the 9 mandatory UP Scholarship documents, and avoiding form fill-up errors.
              </p>

              {/* Feature Highlights */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                  textAlign: 'left',
                  margin: '0 auto 32px',
                  maxWidth: 720,
                }}
              >
                <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <UserCheck size={20} color="#2563eb" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                    Student Academic Profile
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                    Store roll number, department, semester, board percentages, and family income.
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <FileText size={20} color="#10b981" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                    Document Repository
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                    Manage and inspect all 9 mandatory certificates: Aadhaar, Marksheets, Income, Passbook.
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <ShieldCheck size={20} color="#f59e0b" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                    Coordinator Guidance
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                    Master data, non-refundable fee guidelines, and NPCI bank seeding verification.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '12px 28px', fontSize: '0.96rem' }}
                >
                  <Lock size={16} />
                  <span>Login / Register to Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Views */
          <div>
            {activeTab === 'admin' && (

              <AdminView user={user} onShowToast={showToast} />
            )}

            {activeTab === 'help' && (
              <HelpDeskView user={user} onShowToast={showToast} />
            )}

            {activeTab === 'profile' && (
              <ProfileView user={user} onShowToast={showToast} />
            )}

            {activeTab === 'documents' && (
              <DocumentsView user={user} onShowToast={showToast} />
            )}

            {activeTab === 'guide' && (
              <GuidelinesView />
            )}
          </div>

        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          padding: '24px 20px',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: '#64748b',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <strong>Indian Institute of Information Technology Ranchi</strong> • UP Postmatric Scholarship Facilitation System
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
            Maintained by Scholarship Coordinator for peers & juniors • Connected to FastAPI & Supabase Storage
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Global Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
