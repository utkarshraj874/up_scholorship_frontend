import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#10b981" />,
    error: <AlertCircle size={18} color="#ef4444" />,
    info: <Info size={18} color="#2563eb" />,
  };

  const bgColors = {
    success: '#ecfdf5',
    error: '#fef2f2',
    info: '#eff6ff',
  };

  const borderColors = {
    success: '#a7f3d0',
    error: '#fecaca',
    info: '#bfdbfe',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        backgroundColor: bgColors[toast.type] || '#ffffff',
        border: `1.5px solid ${borderColors[toast.type] || '#e2e8f0'}`,
        borderRadius: 12,
        padding: '14px 18px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 420,
        animation: 'slideUp 0.25s ease-out',
      }}
    >
      {icons[toast.type] || icons.info}
      <div style={{ flex: 1, fontSize: '0.88rem', fontWeight: 500, color: '#0f172a' }}>
        {toast.message}
      </div>
      <button
        onClick={onClose}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 4,
          color: '#64748b',
          display: 'flex',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
