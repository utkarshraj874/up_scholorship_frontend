import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import DocumentUploadModal from './DocumentUploadModal';

const DOCUMENT_DEFINITIONS = [
  {
    category: 'aadhaar_card',
    title: 'Aadhaar Card',
    description: 'Mandatory for demographic and biometric OTP authentication on UP Scholarship portal.',
    mandatory: true,
  },
  {
    category: 'tenth_marksheet',
    title: 'Class 10th (High School) Marksheet',
    description: 'Used as official proof of Date of Birth, Board roll number, and student name.',
    mandatory: true,
  },
  {
    category: 'twelfth_marksheet',
    title: 'Class 12th (Intermediate) Marksheet',
    description: 'Verification of eligibility marks and qualifying examination for B.Tech admission.',
    mandatory: true,
  },
  {
    category: 'income_certificate',
    title: 'Income Certificate (आय प्रमाण पत्र)',
    description: 'Must be issued by UP e-District within the last 3 financial years (<= ₹2.0L or ₹2.5L).',
    mandatory: true,
  },
  {
    category: 'category_certificate',
    title: 'Category / Caste Certificate (जाति प्रमाण पत्र)',
    description: 'Mandatory for OBC, SC, and ST students applying for fee reimbursement and quota.',
    mandatory: false,
  },
  {
    category: 'domicile_certificate',
    title: 'UP Domicile Certificate (निवास प्रमाण पत्र)',
    description: 'Proof that the student is an official resident/domicile of Uttar Pradesh.',
    mandatory: true,
  },
  {
    category: 'bank_passbook',
    title: 'Bank Passbook (NPCI Aadhar Linked)',
    description: 'Bank account in student name with active NPCI/DBT mapping for scholarship disbursement.',
    mandatory: true,
  },
  {
    category: 'ration_card',
    title: 'Ration Card / FCS ID',
    description: 'Supporting family verification document as required under latest UP guidelines.',
    mandatory: false,
  },
  {
    category: 'profile_photo',
    title: 'Passport Size Photograph',
    description: 'Recent clear photograph in white background (JPG/PNG).',
    mandatory: true,
  },
];

export default function DocumentsView({ user, onShowToast }) {
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalCategory, setModalCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments(user?.id);
      const docMap = {};
      if (Array.isArray(data)) {
        data.forEach((doc) => {
          docMap[doc.category] = doc;
        });
      }
      setDocuments(docMap);
    } catch (err) {
      console.error(err);
      onShowToast({ type: 'error', message: 'Failed to load documents' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpload = (category) => {
    setModalCategory(category);
    setIsModalOpen(true);
  };

  const handleViewFile = async (category) => {
    setActionLoading(category);
    try {
      const res = await api.getDocumentFileUrl(category, user?.id);
      if (res && res.file_url) {
        window.open(res.file_url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('File URL not generated');
      }
    } catch (err) {
      onShowToast({ type: 'error', message: err.message || 'Could not open file URL' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete this document?`)) return;
    setActionLoading(category);
    try {
      await api.deleteDocument(category, user?.id);
      onShowToast({ type: 'success', message: 'Document deleted successfully' });
      loadDocuments();
    } catch (err) {
      onShowToast({ type: 'error', message: err.message || 'Failed to delete document' });
    } finally {
      setActionLoading(null);
    }
  };

  const uploadedCount = Object.keys(documents).length;
  const totalCount = DOCUMENT_DEFINITIONS.length;

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
        <RefreshCw className="spin" size={28} style={{ margin: '0 auto 12px' }} />
        <p>Loading document repository...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header & Progress */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
            UP Scholarship Document Vault
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: 2 }}>
            Upload, inspect, and manage the 9 required certificates and records for IIIT Ranchi verification.
          </p>
        </div>

        {/* Progress Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#ffffff',
            padding: '8px 16px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
              Documents Uploaded
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {uploadedCount} / {totalCount}
            </div>
          </div>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: uploadedCount >= 7 ? '#ecfdf5' : '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {uploadedCount >= 7 ? (
              <CheckCircle2 size={20} color="#10b981" />
            ) : (
              <Clock size={20} color="#f59e0b" />
            )}
          </div>
        </div>
      </div>

      {/* Grid of Documents */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 20,
        }}
      >
        {DOCUMENT_DEFINITIONS.map((def) => {
          const doc = documents[def.category];
          const isUploaded = Boolean(doc);
          const isVerified = doc?.status === 'verified';
          const needsCorrection = doc?.status === 'correction_required';

          const cardBorderColor = !isUploaded
            ? '#cbd5e1'
            : isVerified
            ? '#10b981'
            : needsCorrection
            ? '#f59e0b'
            : '#3b82f6';

          return (
            <div
              key={def.category}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${cardBorderColor}`,
              }}
            >
              <div>
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: isVerified
                          ? '#ecfdf5'
                          : needsCorrection
                          ? '#fffbeb'
                          : isUploaded
                          ? '#eff6ff'
                          : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isVerified ? (
                        <CheckCircle2 size={20} color="#10b981" />
                      ) : needsCorrection ? (
                        <AlertCircle size={20} color="#f59e0b" />
                      ) : isUploaded ? (
                        <FileCheck size={20} color="#3b82f6" />
                      ) : (
                        <FileText size={20} color="#94a3b8" />
                      )}
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: '0.96rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          lineHeight: 1.3,
                        }}
                      >
                        {def.title}
                      </h4>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: def.mandatory ? '#2563eb' : '#64748b',
                        }}
                      >
                        {def.mandatory ? '• Mandatory' : '• Category / Scheme Specific'}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 9999,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: !isUploaded
                        ? '#f1f5f9'
                        : isVerified
                        ? '#ecfdf5'
                        : needsCorrection
                        ? '#fef2f2'
                        : '#eff6ff',
                      color: !isUploaded
                        ? '#64748b'
                        : isVerified
                        ? '#059669'
                        : needsCorrection
                        ? '#dc2626'
                        : '#2563eb',
                      border: !isUploaded
                        ? '1px solid #cbd5e1'
                        : isVerified
                        ? '1px solid #a7f3d0'
                        : needsCorrection
                        ? '1px solid #fecaca'
                        : '1px solid #bfdbfe',
                    }}
                  >
                    {!isUploaded
                      ? 'Pending'
                      : isVerified
                      ? 'Verified ✓'
                      : needsCorrection
                      ? 'Correction Needed ⚠️'
                      : 'Under Review'}
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 12 }}>
                  {def.description}
                </p>

                {/* Coordinator Suggestion Alert */}
                {needsCorrection && doc.admin_remarks && (
                  <div
                    style={{
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 8,
                      padding: '10px 12px',
                      fontSize: '0.78rem',
                      color: '#92400e',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <AlertCircle size={15} color="#d97706" />
                      <span>Coordinator Suggestion / Correction:</span>
                    </div>
                    <div style={{ lineHeight: 1.4 }}>{doc.admin_remarks}</div>
                    <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: 4 }}>
                      Please click <strong>Replace</strong> below to upload the corrected document.
                    </div>
                  </div>
                )}

                {/* Verified Alert */}
                {isVerified && (
                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: '0.76rem',
                      color: '#166534',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <CheckCircle2 size={15} color="#16a34a" />
                    <span>Document verified & approved by Scholarship Coordinator</span>
                  </div>
                )}

                {/* Metadata Details if Uploaded */}
                {isUploaded && (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      padding: '10px 12px',
                      fontSize: '0.78rem',
                      color: '#334155',
                      marginBottom: 16,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                      File: {doc.file_name} ({(doc.file_size / 1024).toFixed(1)} KB)
                    </div>
                    {doc.aadhaar_number && <div>Aadhaar: **** **** {doc.aadhaar_number.slice(-4)}</div>}
                    {doc.tenth_roll_number && (
                      <div>
                        10th Roll: {doc.tenth_roll_number} ({doc.tenth_board}, {doc.tenth_percentage}%)
                      </div>
                    )}
                    {doc.twelfth_roll_number && (
                      <div>
                        12th Roll: {doc.twelfth_roll_number} ({doc.twelfth_board}, {doc.twelfth_percentage}%)
                      </div>
                    )}
                    {doc.document_number && <div>Doc No: {doc.document_number}</div>}
                    {doc.total_income && <div>Income: ₹{Number(doc.total_income).toLocaleString()}</div>}
                    {doc.bank_account_number && (
                      <div>
                        A/C: ****{doc.bank_account_number.slice(-4)} ({doc.bank_name}, IFSC: {doc.bank_ifsc})
                      </div>
                    )}
                    {doc.domicile_state && <div>State: {doc.domicile_state}</div>}
                    {doc.ration_card_number && <div>Ration No: {doc.ration_card_number}</div>}
                  </div>
                )}
              </div>


              {/* Actions Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                {isUploaded ? (
                  <>
                    <button
                      onClick={() => handleViewFile(def.category)}
                      className="btn btn-outline-primary"
                      style={{ flex: 1, padding: '7px 12px', fontSize: '0.8rem' }}
                      disabled={actionLoading === def.category}
                    >
                      <ExternalLink size={14} />
                      <span>{actionLoading === def.category ? 'Opening...' : 'View File'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenUpload(def.category)}
                      className="btn btn-secondary"
                      style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                      title="Replace Document"
                    >
                      <Upload size={14} />
                      <span>Replace</span>
                    </button>

                    <button
                      onClick={() => handleDelete(def.category)}
                      className="btn btn-danger"
                      style={{ padding: '7px 10px', fontSize: '0.8rem' }}
                      title="Delete"
                      disabled={actionLoading === def.category}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenUpload(def.category)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '8px 14px', fontSize: '0.84rem' }}
                  >
                    <Upload size={15} />
                    <span>Upload Document</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={modalCategory}
        existingDoc={documents[modalCategory]}
        userId={user?.id}
        onSuccess={loadDocuments}
        onShowToast={onShowToast}
      />
    </div>
  );
}
