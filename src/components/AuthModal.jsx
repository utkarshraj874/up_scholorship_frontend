import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // 'student' or 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!formData.name.trim()) throw new Error('Please enter your full name');
        if (!formData.email.trim()) throw new Error('Please enter your email');
        if (!formData.password || formData.password.length < 6)
          throw new Error('Password must be at least 6 characters');

        await api.register(formData.name, formData.email, formData.password, formData.role);
        // After registration, auto-login
        const loginRes = await api.login(formData.email, formData.password);
        localStorage.setItem('scholarship_token', loginRes.access_token);
        onAuthSuccess(loginRes.user || { email: formData.email, name: formData.name, role: formData.role });
      } else {
        if (!formData.email.trim() || !formData.password)
          throw new Error('Please enter email and password');

        const loginRes = await api.login(formData.email, formData.password);
        localStorage.setItem('scholarship_token', loginRes.access_token);
        onAuthSuccess(loginRes.user || { email: formData.email });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setFormData({ name: '', email, password, role: 'student' });
    setIsRegister(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              {isRegister ? 'Create Account' : 'Login to UP Scholarship Portal'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
              {isRegister
                ? 'Register as a Student or Scholarship Coordinator / Admin'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Role Selection on Registration */}
            {isRegister && (
              <div className="form-group">
                <label className="form-label">I want to register as:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'student' })}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: formData.role === 'student' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: formData.role === 'student' ? '#eff6ff' : '#ffffff',
                      color: formData.role === 'student' ? '#1d4ed8' : '#475569',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <GraduationCap size={16} />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: formData.role === 'admin' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: formData.role === 'admin' ? '#eff6ff' : '#ffffff',
                      color: formData.role === 'admin' ? '#1d4ed8' : '#475569',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>Admin / Coordinator</span>
                  </button>
                </div>
              </div>
            )}

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: 12, top: 12 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                    placeholder={formData.role === 'admin' ? 'e.g. Scholarship Coordinator' : 'e.g. Priya Sharma'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: 12, top: 12 }}
                />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="e.g. yourname@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: 12, top: 12 }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Quick Demo Credentials */}
            {!isRegister && (
              <div
                style={{
                  marginTop: 18,
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Quick Fill Test Accounts:
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@iiitranchi.ac.in', 'AdminPass@123')}
                    style={{
                      fontSize: '0.75rem',
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid #93c5fd',
                      background: '#eff6ff',
                      cursor: 'pointer',
                      color: '#1d4ed8',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>Admin: admin@iiitranchi.ac.in</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('priya.iiitr@gmail.com', 'StrongPassword@123')}
                    style={{
                      fontSize: '0.75rem',
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      cursor: 'pointer',
                      color: '#475569',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <GraduationCap size={13} />
                    <span>Student: priya.iiitr@gmail.com</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#2563eb',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              <span>{loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
