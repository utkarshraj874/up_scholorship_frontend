import React, { useState, useEffect } from 'react';
import {
  Users,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  X,
  FileText,
  ShieldCheck,
  Send,
  RefreshCw,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';

const DOCUMENT_LABELS = {
  aadhaar_card: 'Aadhaar Card',
  tenth_marksheet: 'Class 10th (High School) Marksheet',
  twelfth_marksheet: 'Class 12th (Intermediate) Marksheet',
  income_certificate: 'Income Certificate (आय प्रमाण पत्र)',
  category_certificate: 'Category / Caste Certificate (जाति प्रमाण पत्र)',
  domicile_certificate: 'UP Domicile Certificate (निवास प्रमाण पत्र)',
  bank_passbook: 'Bank Passbook (NPCI Aadhar Linked)',
  ration_card: 'Ration Card (राशन कार्ड)',
  profile_photo: 'Passport Size Photograph',
};

export default function AdminView({ user, onShowToast }) {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Inspection Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDocsData, setStudentDocsData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Review Form state: { [docId]: { status: 'verified' | 'correction_required', remarks: '' } }
  const [reviewForms, setReviewForms] = useState({});
  const [submittingReview, setSubmittingReview] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, studentsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminStudents(search),
      ]);
      setStats(statsData);
      setStudents(studentsData);
    } catch (err) {
      console.error(err);
      onShowToast({ type: 'error', message: err.message || 'Failed to load coordinator data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.getAdminStudents(search);
      setStudents(data);
    } catch (err) {
      onShowToast({ type: 'error', message: 'Failed to search students' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInspect = async (student) => {
    setSelectedStudent(student);
    setInspectLoading(true);
    setReviewForms({});
    try {
      const data = await api.getStudentDocuments(student.id);
      setStudentDocsData(data);
    } catch (err) {
      onShowToast({ type: 'error', message: 'Failed to load student documents' });
    } finally {
      setInspectLoading(false);
    }
  };

  const handleCloseInspect = () => {
    setSelectedStudent(null);
    setStudentDocsData(null);
    loadDashboardData();
  };

  const handleReviewChange = (docId, field, value) => {
    setReviewForms((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        [field]: value,
      },
    }));
  };

  const handleSubmitReview = async (docId, defaultStatus = 'verified') => {
    const formData = reviewForms[docId] || {};
    const status = formData.status || defaultStatus;
    const remarks = formData.remarks || '';

    if (status === 'correction_required' && !remarks.trim()) {
      onShowToast({
        type: 'error',
        message: 'Please provide a correction suggestion/remark for the student.',
      });
      return;
    }

    setSubmittingReview(docId);
    try {
      const updatedDoc = await api.reviewDocument(docId, status, remarks);
      onShowToast({
        type: 'success',
        message: `Document marked as ${status === 'verified' ? 'Verified' : 'Correction Required'}. Student has been notified.`,
      });

      // Update in-place
      setStudentDocsData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          documents: prev.documents.map((d) => (d.id === docId ? updatedDoc : d)),
        };
      });
    } catch (err) {
      onShowToast({ type: 'error', message: err.message || 'Failed to submit review' });
    } finally {
      setSubmittingReview(null);
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
        <RefreshCw className="spin" size={28} style={{ margin: '0 auto 12px' }} />
        <p>Loading Scholarship Coordinator Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
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
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                Scholarship Coordinator Desk
              </h2>
              <span
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 9999,
                }}
              >
                Admin Control
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#93c5fd', marginTop: 2 }}>
              Inspect student applications, verify submitted certificates, and give correction suggestions via direct notifications.
            </p>
          </div>
        </div>

        <button
          onClick={loadDashboardData}
          className="btn btn-secondary"
          style={{
            backgroundColor: '#1e293b',
            color: '#ffffff',
            border: '1px solid #334155',
            fontSize: '0.82rem',
            padding: '8px 14px',
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          <div className="card" style={{ borderLeft: '4px solid #2563eb', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                Total Students
              </span>
              <Users size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
              {stats.total_students}
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #3b82f6', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                Uploaded Documents
              </span>
              <FileText size={18} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
              {stats.total_documents}
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #10b981', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                Verified Documents
              </span>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: 6 }}>
              {stats.verified_documents}
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #f59e0b', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                Needs Correction
              </span>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: 6 }}>
              {stats.correction_required}
            </div>
          </div>
        </div>
      )}

      {/* Search & Student List */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Student Scholarship Applications
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
              Click on any student to view their uploaded files and provide feedback or verification.
            </p>
          </div>

          <form onSubmit={handleSearch} className="admin-search-form" style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: 12, top: 11 }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 36, width: 260, maxWidth: '100%', fontSize: '0.85rem' }}
                placeholder="Search by student name/email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.8rem' }}>
                <th style={{ padding: '12px 14px' }}>STUDENT</th>
                <th style={{ padding: '12px 14px' }}>ROLL NO & BRANCH</th>
                <th style={{ padding: '12px 14px' }}>CATEGORY & INCOME</th>
                <th style={{ padding: '12px 14px' }}>DOCUMENTS STATUS</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                    No student applications found.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '0.85rem',
                      color: '#1e293b',
                    }}
                  >
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.email}</div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      {s.profile?.registration_no ? (
                        <div>
                          <span style={{ fontWeight: 600 }}>{s.profile.registration_no}</span>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            {s.profile.department} (Sem {s.profile.semester})
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.78rem' }}>
                          Profile Pending
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '14px' }}>
                      {s.profile ? (
                        <div>
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                            {s.profile.category}
                          </span>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 4 }}>
                            ₹{Number(s.profile.family_income).toLocaleString()} / yr
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {s.documents_count} / 9
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {s.verified_count > 0 && (
                            <span
                              style={{
                                backgroundColor: '#ecfdf5',
                                color: '#059669',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 4,
                              }}
                            >
                              {s.verified_count} Verified
                            </span>
                          )}
                          {s.correction_count > 0 && (
                            <span
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 4,
                              }}
                            >
                              {s.correction_count} Needs Fix
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenInspect(s)}
                        className="btn btn-outline-primary"
                        style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                      >
                        <Eye size={14} />
                        <span>Inspect & Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Student Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={handleCloseInspect}>
          <div
            className="modal-container"
            style={{ maxWidth: 880, width: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Document Inspection • {selectedStudent.name}
                  </h3>
                  <span className="badge badge-primary">{selectedStudent.email}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
                  Review uploaded certificates, view signed PDF/Images, and submit suggestions or approval.
                </p>
              </div>
              <button
                onClick={handleCloseInspect}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {inspectLoading ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw className="spin" size={24} style={{ margin: '0 auto 12px' }} />
                  <p>Fetching student certificates...</p>
                </div>
              ) : !studentDocsData || studentDocsData.documents.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                  <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p>This student has not uploaded any documents yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {studentDocsData.documents.map((doc) => {
                    const currentReview = reviewForms[doc.id] || {
                      status: doc.status === 'submitted' ? 'verified' : doc.status,
                      remarks: doc.admin_remarks || '',
                    };

                    return (
                      <div
                        key={doc.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 10,
                          padding: 16,
                          backgroundColor: '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        }}
                      >
                        {/* Doc Header */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 12,
                            flexWrap: 'wrap',
                            gap: 10,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                backgroundColor: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <FileCheck size={18} color="#2563eb" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.96rem', color: '#0f172a' }}>
                                {DOCUMENT_LABELS[doc.category] || doc.category}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                File: {doc.file_name} ({(doc.file_size / 1024).toFixed(1)} KB) • Uploaded:{' '}
                                {new Date(doc.uploaded_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: 9999,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor:
                                  doc.status === 'verified'
                                    ? '#ecfdf5'
                                    : doc.status === 'correction_required'
                                    ? '#fee2e2'
                                    : '#f1f5f9',
                                color:
                                  doc.status === 'verified'
                                    ? '#059669'
                                    : doc.status === 'correction_required'
                                    ? '#b91c1c'
                                    : '#475569',
                              }}
                            >
                              {doc.status === 'verified'
                                ? 'Verified ✓'
                                : doc.status === 'correction_required'
                                ? 'Correction Needed ⚠️'
                                : 'Pending Review'}
                            </span>

                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.78rem',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                <ExternalLink size={14} />
                                <span>View File</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Metadata Details */}
                        <div
                          style={{
                            backgroundColor: '#f8fafc',
                            padding: '10px 14px',
                            borderRadius: 8,
                            fontSize: '0.8rem',
                            color: '#334155',
                            marginBottom: 14,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 8,
                          }}
                        >
                          {doc.aadhaar_number && (
                            <div>
                              <strong>Aadhaar No:</strong> {doc.aadhaar_number}
                            </div>
                          )}
                          {doc.tenth_roll_number && (
                            <div>
                              <strong>10th Roll:</strong> {doc.tenth_roll_number} ({doc.tenth_board},{' '}
                              {doc.tenth_percentage}%)
                            </div>
                          )}
                          {doc.twelfth_roll_number && (
                            <div>
                              <strong>12th Roll:</strong> {doc.twelfth_roll_number} ({doc.twelfth_board},{' '}
                              {doc.twelfth_percentage}%)
                            </div>
                          )}
                          {doc.document_number && (
                            <div>
                              <strong>Certificate No:</strong> {doc.document_number}
                            </div>
                          )}
                          {doc.issue_date && (
                            <div>
                              <strong>Issue Date:</strong> {doc.issue_date}
                            </div>
                          )}
                          {doc.total_income && (
                            <div>
                              <strong>Total Income:</strong> ₹{Number(doc.total_income).toLocaleString()}
                            </div>
                          )}
                          {doc.certificate_category && (
                            <div>
                              <strong>Caste/Category:</strong> {doc.certificate_category}
                            </div>
                          )}
                          {doc.domicile_state && (
                            <div>
                              <strong>Domicile State:</strong> {doc.domicile_state}
                            </div>
                          )}
                          {doc.bank_account_number && (
                            <div>
                              <strong>Bank A/C:</strong> {doc.bank_account_number} ({doc.bank_name}, IFSC:{' '}
                              {doc.bank_ifsc})
                            </div>
                          )}
                          {doc.ration_card_number && (
                            <div>
                              <strong>Ration No:</strong> {doc.ration_card_number}
                            </div>
                          )}
                        </div>

                        {/* Coordinator Review Action Box */}
                        <div
                          style={{
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                              Review Decision:
                            </span>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name={`decision-${doc.id}`}
                                value="verified"
                                checked={currentReview.status === 'verified'}
                                onChange={(e) => handleReviewChange(doc.id, 'status', e.target.value)}
                              />
                              <span style={{ color: '#059669', fontWeight: 600 }}>Approve / Verified</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name={`decision-${doc.id}`}
                                value="correction_required"
                                checked={currentReview.status === 'correction_required'}
                                onChange={(e) => handleReviewChange(doc.id, 'status', e.target.value)}
                              />
                              <span style={{ color: '#dc2626', fontWeight: 600 }}>Suggest Correction</span>
                            </label>
                          </div>

                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ flex: 1, fontSize: '0.82rem' }}
                              placeholder={
                                currentReview.status === 'correction_required'
                                  ? 'Enter specific correction instruction for student (e.g. Income certificate is expired, re-upload new one)...'
                                  : 'Optional verification note (e.g. Verified against UP e-District portal)...'
                              }
                              value={currentReview.remarks}
                              onChange={(e) => handleReviewChange(doc.id, 'remarks', e.target.value)}
                            />

                            <button
                              onClick={() => handleSubmitReview(doc.id, currentReview.status)}
                              className={`btn ${currentReview.status === 'correction_required' ? 'btn-danger' : 'btn-primary'}`}
                              style={{ padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                              disabled={submittingReview === doc.id}
                            >
                              <Send size={14} />
                              <span>{submittingReview === doc.id ? 'Saving...' : 'Submit & Notify'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseInspect} className="btn btn-secondary">
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
