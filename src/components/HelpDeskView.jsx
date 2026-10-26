import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  User,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';

export default function HelpDeskView({ user, onShowToast }) {
  const isAdmin = user?.role === 'admin';

  // Student state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myQueries, setMyQueries] = useState([]);

  // Admin state
  const [adminQueries, setAdminQueries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyTexts, setReplyTexts] = useState({});
  const [replyingId, setReplyingId] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueries();
  }, [user, statusFilter]);

  const loadQueries = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const data = await api.getAllHelpQueries(statusFilter);
        setAdminQueries(data);
      } else {
        const data = await api.getMyHelpQueries();
        setMyQueries(data);
      }
    } catch (err) {
      console.error(err);
      onShowToast({ type: 'error', message: 'Failed to load help queries' });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      onShowToast({ type: 'error', message: 'Please enter both subject and message' });
      return;
    }

    setSubmitting(true);
    try {
      await api.createHelpQuery(subject, message);
      onShowToast({
        type: 'success',
        message: 'Your question has been sent to the Scholarship Coordinator.',
      });
      setSubject('');
      setMessage('');
      loadQueries();
    } catch (err) {
      onShowToast({ type: 'error', message: err.message || 'Failed to submit query' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminReply = async (queryId) => {
    const text = replyTexts[queryId] || '';
    if (!text.trim()) {
      onShowToast({ type: 'error', message: 'Please enter a reply message for the student' });
      return;
    }

    setReplyingId(queryId);
    try {
      await api.replyHelpQuery(queryId, text);
      onShowToast({
        type: 'success',
        message: 'Reply sent! Student has received a notification.',
      });
      setReplyTexts((prev) => ({ ...prev, [queryId]: '' }));
      loadQueries();
    } catch (err) {
      onShowToast({ type: 'error', message: err.message || 'Failed to send reply' });
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: isAdmin
            ? 'linear-gradient(135deg, #1e3a8a, #0f172a)'
            : 'linear-gradient(135deg, #0f172a, #1e293b)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isAdmin ? <ShieldCheck size={26} color="#ffffff" /> : <HelpCircle size={26} color="#ffffff" />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {isAdmin ? 'Student Help Desk • Coordinator Management' : 'Scholarship Help Desk • Ask Coordinator'}
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: 2 }}>
              {isAdmin
                ? 'Answer queries raised by juniors and students regarding form filling, DigiLocker, or NPCI seeding.'
                : 'Need guidance? Submit your query directly to the IIIT Ranchi Scholarship Coordinator.'}
            </p>
          </div>
        </div>

        <button
          onClick={loadQueries}
          className="btn btn-secondary"
          style={{
            backgroundColor: '#1e293b',
            color: '#ffffff',
            border: '1px solid #334155',
            fontSize: '0.82rem',
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Queries</span>
        </button>
      </div>

      {/* STUDENT VIEW */}
      {!isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 24 }}>
          {/* Query submission form */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
              Submit a Question to Coordinator
            </h3>

            <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Query Subject / Topic</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. DigiLocker OTP not syncing / NPCI bank seeding error"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Question / Problem</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Describe your issue with error codes or specifics so the coordinator can guide you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Send size={15} />
                <span>{submitting ? 'Submitting Question...' : 'Send to Coordinator'}</span>
              </button>
            </form>
          </div>

          {/* Student's Past Queries */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
              My Queries & Coordinator Answers
            </h3>

            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                <RefreshCw className="spin" size={24} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.84rem' }}>Loading queries...</p>
              </div>
            ) : myQueries.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.84rem' }}>You haven't asked any questions yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 460, overflowY: 'auto' }}>
                {myQueries.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: 14,
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                        {q.subject}
                      </span>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 9999,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: q.status === 'resolved' ? '#ecfdf5' : '#fffbeb',
                          color: q.status === 'resolved' ? '#059669' : '#d97706',
                          border: q.status === 'resolved' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                        }}
                      >
                        {q.status === 'resolved' ? 'Answered ✓' : 'Awaiting Reply'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, marginBottom: 10 }}>
                      {q.message}
                    </p>

                    {/* Admin Answer Box */}
                    {q.admin_reply ? (
                      <div
                        style={{
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: 8,
                          padding: '10px 12px',
                          fontSize: '0.8rem',
                          color: '#166534',
                        }}
                      >
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <CheckCircle2 size={15} color="#16a34a" />
                          <span>Coordinator Answer:</span>
                        </div>
                        <div style={{ lineHeight: 1.4 }}>{q.admin_reply}</div>
                        {q.replied_at && (
                          <div style={{ fontSize: '0.68rem', color: '#15803d', marginTop: 4 }}>
                            Replied on: {new Date(q.replied_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        <span>Submitted on {new Date(q.created_at).toLocaleDateString()} • Pending coordinator review</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN VIEW */}
      {isAdmin && (
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Student Help Requests ({adminQueries.length})
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
                Answer questions submitted by students. Your reply will automatically generate a student notification.
              </p>
            </div>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'open', 'resolved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    backgroundColor: statusFilter === tab ? '#2563eb' : '#ffffff',
                    color: statusFilter === tab ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'all' ? 'All Queries' : tab === 'open' ? 'Open Only' : 'Answered'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <RefreshCw className="spin" size={26} style={{ margin: '0 auto 12px' }} />
              <p>Loading student queries...</p>
            </div>
          ) : adminQueries.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
              <CheckCircle2 size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>No student queries matching this filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {adminQueries.map((q) => {
                const isOpen = q.status === 'open';

                return (
                  <div
                    key={q.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: 16,
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#2563eb',
                          }}
                        >
                          {q.student_name ? q.student_name[0].toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a' }}>
                            {q.student_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {q.student_email} • {new Date(q.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 9999,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: isOpen ? '#fffbeb' : '#ecfdf5',
                          color: isOpen ? '#b45309' : '#059669',
                          border: isOpen ? '1px solid #fde68a' : '1px solid #a7f3d0',
                        }}
                      >
                        {isOpen ? 'Needs Answer' : 'Resolved ✓'}
                      </span>
                    </div>

                    {/* Question details */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: 4 }}>
                        {q.subject}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>{q.message}</p>
                    </div>

                    {/* Existing reply if resolved */}
                    {q.admin_reply && (
                      <div
                        style={{
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: 8,
                          padding: '10px 14px',
                          fontSize: '0.82rem',
                          color: '#166534',
                          marginBottom: isOpen ? 12 : 0,
                        }}
                      >
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <CheckCircle2 size={15} color="#16a34a" />
                          <span>Coordinator Answer:</span>
                        </div>
                        <div style={{ lineHeight: 1.4 }}>{q.admin_reply}</div>
                        {q.replied_at && (
                          <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: 4 }}>
                            Sent: {new Date(q.replied_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reply input if open or updating */}
                    {isOpen && (
                      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ flex: 1, fontSize: '0.84rem' }}
                          placeholder="Type your resolution/answer for the student..."
                          value={replyTexts[q.id] || ''}
                          onChange={(e) =>
                            setReplyTexts({ ...replyTexts, [q.id]: e.target.value })
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleAdminReply(q.id)}
                        />
                        <button
                          onClick={() => handleAdminReply(q.id)}
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                          disabled={replyingId === q.id}
                        >
                          <Send size={14} />
                          <span>{replyingId === q.id ? 'Sending...' : 'Send Answer'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
