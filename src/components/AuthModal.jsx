import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  // mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // 'student' or 'admin'
  });
  const [adminPasskey, setAdminPasskey] = useState('');
  const [forgotData, setForgotData] = useState({
    email: '',
    otp: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(''); // success/info messages for forgot flow
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  if (!isOpen) return null;

  const resetAllState = () => {
    setFormData({ name: '', email: '', password: '', role: 'student' });
    setAdminPasskey('');
    setForgotData({ email: '', otp: '', newPassword: '' });
    setError('');
    setInfo('');
    setOtpSent(false);
    setLoading(false);
    setShowPassword(false);
    setShowNewPassword(false);
  };

  const handleClose = () => {
    resetAllState();
    setMode('login');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!formData.name.trim()) throw new Error('Please enter your full name');
        if (!formData.email.trim()) throw new Error('Please enter your email');
        if (!formData.password || formData.password.length < 6)
          throw new Error('Password must be at least 6 characters');
        if (formData.role === 'admin' && !adminPasskey.trim())
          throw new Error('Enter the admin registration key');

        await api.register(
          formData.name,
          formData.email,
          formData.password,
          formData.role,
          adminPasskey,
        );
        // After registration, auto-login
        const loginRes = await api.login(formData.email, formData.password);
        localStorage.setItem('scholarship_token', loginRes.access_token);
        onAuthSuccess(loginRes.user || { email: formData.email, name: formData.name, role: formData.role });
      } else if (mode === 'login') {
        if (!formData.email.trim() || !formData.password)
          throw new Error('Please enter email and password');
        const loginRes = await api.login(formData.email, formData.password);
        localStorage.setItem('scholarship_token', loginRes.access_token);
        onAuthSuccess(loginRes.user || { email: formData.email });
      }
      handleClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      // Step 1: request OTP if we haven't sent it yet (otp field empty)
      if (!otpSent) {
        await api.forgotPassword(forgotData.email);
        setOtpSent(true);
        setInfo('If the email matches an account and delivery is configured, you will receive a reset code. Check your inbox or spam folder.');
      } else {
        if (!/^\d{6}$/.test(forgotData.otp)) {
          throw new Error('Enter the 6-digit reset code from your email.');
        }
        if (forgotData.newPassword.length < 6) {
          throw new Error('Your new password must be at least 6 characters.');
        }
        // Step 2: reset password using OTP and new password
        await api.resetPassword(forgotData.email, forgotData.otp, forgotData.newPassword);
        setInfo('Password reset successful. You can now log in.');
        // Switch back to login mode automatically after short delay
        setTimeout(() => {
          setMode('login');
          resetAllState();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setFormData({ name: '', email, password, role: 'student' });
    setMode('login');
  };

  // Render helpers
  const renderPasswordToggle = (visible, setVisible) => (
    <button
      type="button"
      className="password-toggle"
      onClick={() => setVisible(!visible)}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  const renderLoginRegisterForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {error && (
          <div
            role="alert"
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
        {mode === 'register' && (
          <div className="form-group">
            <label className="form-label">I want to register as:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, role: 'student' });
                  setAdminPasskey('');
                }}
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

        {mode === 'register' && formData.role === 'admin' && (
          <div className="form-group">
            <label className="form-label" htmlFor="admin-registration-key">
              Admin Registration Key
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                id="admin-registration-key"
                type="password"
                className="form-input"
                style={{ paddingLeft: 38 }}
                autoComplete="off"
                value={adminPasskey}
                onChange={(e) => setAdminPasskey(e.target.value)}
                placeholder="Enter the key provided by your administrator"
                required
              />
            </div>
            <p className="form-hint">Required to create an admin account.</p>
          </div>
        )}

        {mode === 'register' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
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

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
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

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              style={{ paddingLeft: 38, paddingRight: 38 }}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            {renderPasswordToggle(showPassword, setShowPassword)}
          </div>
        </div>

        {/* Forgot password link – only in login mode */}
        {mode === 'login' && (
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setError('');
                setInfo('');
                setForgotData({ email: formData.email, otp: '', newPassword: '' });
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Quick Demo Credentials */}
        {mode === 'login' && (
          <div>
            <div style={{ marginTop: 18, padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Quick Fill Test Accounts:</div>
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
          </div>
        )}
      </div>
      <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'register' ? 'login' : 'register');
            setAdminPasskey('');
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
          {mode === 'register' ? 'Already have an account? Login' : "Don't have an account? Sign up"}
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <span>{loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );

  const renderForgotForm = () => (
    <form onSubmit={handleForgotSubmit}>
      <div className="modal-body">
        {error && (
          <div
            role="alert"
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
        {info && (
          <div
            role="status"
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.85rem',
              marginBottom: 16,
            }}
          >
            <span>{info}</span>
          </div>
        )}
        {/* Email field */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="email"
              className="form-input"
              style={{ paddingLeft: 38 }}
              placeholder="e.g. yourname@gmail.com"
              value={forgotData.email}
              onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
              readOnly={otpSent}
              required
            />
          </div>
        </div>
        {otpSent && (
          <button
            type="button"
            onClick={() => {
              setForgotData({ email: '', otp: '', newPassword: '' });
              setOtpSent(false);
              setInfo('');
              setError('');
            }}
            style={{
              marginTop: -10,
              marginBottom: 12,
              padding: 0,
              border: 0,
              color: '#2563eb',
              background: 'transparent',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Use a different email address
          </button>
        )}
        {/* If OTP has been sent, show OTP and new password fields */}
        {otpSent && (
          <>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">OTP (sent to email)</label>
              <input
                type="text"
                className="form-input"
                placeholder="6‑digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={forgotData.otp}
                onChange={(e) => setForgotData({ ...forgotData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                required
              />
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                  placeholder="••••••••"
                  value={forgotData.newPassword}
                  onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                  required
                />
                {renderPasswordToggle(showNewPassword, setShowNewPassword)}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError('');
            setInfo('');
            setOtpSent(false);
            setForgotData({ email: '', otp: '', newPassword: '' });
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#2563eb',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <span>{loading ? 'Please wait...' : otpSent ? 'Reset Password' : 'Send reset code'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              {mode === 'login'
                ? 'Login to UP Scholarship Portal'
                : mode === 'register'
                ? 'Create Account'
                : 'Forgot Password'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
              {mode === 'login'
                ? 'Enter your credentials to access your dashboard'
                : mode === 'register'
                ? 'Register as a Student or Scholarship Coordinator / Admin'
                : 'Enter your email to receive an OTP, then reset your password'}
            </p>
          </div>
          <button
            onClick={handleClose}
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
        {mode === 'forgot' ? renderForgotForm() : renderLoginRegisterForm()}
      </div>
    </div>
  );
}
