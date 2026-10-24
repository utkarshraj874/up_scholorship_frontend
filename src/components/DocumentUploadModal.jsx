import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
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

export default function DocumentUploadModal({
  isOpen,
  onClose,
  category,
  existingDoc,
  userId,
  onSuccess,
  onShowToast,
}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Category specific fields
  const [details, setDetails] = useState({
    // aadhaar
    aadhaar_number: existingDoc?.aadhaar_number || '',
    // 10th
    tenth_roll_number: existingDoc?.tenth_roll_number || '',
    tenth_board: existingDoc?.tenth_board || 'CBSE',
    tenth_passing_year: existingDoc?.tenth_passing_year || 2021,
    tenth_percentage: existingDoc?.tenth_percentage || '',
    // 12th
    twelfth_roll_number: existingDoc?.twelfth_roll_number || '',
    twelfth_board: existingDoc?.twelfth_board || 'CBSE',
    twelfth_passing_year: existingDoc?.twelfth_passing_year || 2023,
    twelfth_percentage: existingDoc?.twelfth_percentage || '',
    // income
    document_number: existingDoc?.document_number || '',
    issue_date: existingDoc?.issue_date || '',
    total_income: existingDoc?.total_income || '',
    // caste
    certificate_category: existingDoc?.certificate_category || 'OBC',
    // domicile
    domicile_state: existingDoc?.domicile_state || 'Uttar Pradesh',
    // bank
    bank_account_number: existingDoc?.bank_account_number || '',
    bank_ifsc: existingDoc?.bank_ifsc || '',
    bank_name: existingDoc?.bank_name || '',
    bank_branch: existingDoc?.bank_branch || '',
    // ration
    ration_card_number: existingDoc?.ration_card_number || '',
  });

  if (!isOpen || !category) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5 MB');
        return;
      }
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowed.includes(selected.type)) {
        setError('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !existingDoc) {
      setError('Please choose a file to upload');
      return;
    }
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      if (userId) formData.append('user_id', userId);
      formData.append('category', category);

      // Clean category specific payload
      const payload = {};

      if (category === 'aadhaar_card') {
        if (!details.aadhaar_number) throw new Error('Aadhaar Number is required');
        payload.aadhaar_number = details.aadhaar_number;
      } else if (category === 'tenth_marksheet') {
        if (!details.tenth_roll_number) throw new Error('10th Roll Number is required');
        if (!details.tenth_percentage) throw new Error('10th Percentage is required');
        payload.tenth_roll_number = details.tenth_roll_number;
        payload.tenth_board = details.tenth_board;
        payload.tenth_passing_year = parseInt(details.tenth_passing_year, 10);
        payload.tenth_percentage = parseFloat(details.tenth_percentage);
      } else if (category === 'twelfth_marksheet') {
        if (!details.twelfth_roll_number) throw new Error('12th Roll Number is required');
        if (!details.twelfth_percentage) throw new Error('12th Percentage is required');
        payload.twelfth_roll_number = details.twelfth_roll_number;
        payload.twelfth_board = details.twelfth_board;
        payload.twelfth_passing_year = parseInt(details.twelfth_passing_year, 10);
        payload.twelfth_percentage = parseFloat(details.twelfth_percentage);
      } else if (category === 'income_certificate') {
        if (!details.document_number) throw new Error('Certificate Number is required');
        if (!details.issue_date) throw new Error('Issue Date is required');
        if (!details.total_income) throw new Error('Total Income amount is required');
        payload.document_number = details.document_number;
        payload.issue_date = details.issue_date;
        payload.total_income = parseFloat(details.total_income);
      } else if (category === 'category_certificate') {
        if (!details.document_number) throw new Error('Certificate Number is required');
        if (!details.issue_date) throw new Error('Issue Date is required');
        payload.document_number = details.document_number;
        payload.issue_date = details.issue_date;
        payload.certificate_category = details.certificate_category;
      } else if (category === 'domicile_certificate') {
        if (!details.document_number) throw new Error('Certificate Number is required');
        if (!details.issue_date) throw new Error('Issue Date is required');
        payload.document_number = details.document_number;
        payload.issue_date = details.issue_date;
        payload.domicile_state = details.domicile_state;
      } else if (category === 'bank_passbook') {
        if (!details.bank_account_number) throw new Error('Bank Account Number is required');
        if (!details.bank_ifsc) throw new Error('IFSC Code is required');
        if (!details.bank_name) throw new Error('Bank Name is required');
        if (!details.bank_branch) throw new Error('Branch Name is required');
        payload.bank_account_number = details.bank_account_number;
        payload.bank_ifsc = details.bank_ifsc.toUpperCase();
        payload.bank_name = details.bank_name;
        payload.bank_branch = details.bank_branch;
      } else if (category === 'ration_card') {
        if (!details.ration_card_number) throw new Error('Ration Card Number is required');
        payload.ration_card_number = details.ration_card_number;
      }

      formData.append('details', JSON.stringify(payload));
      if (file) {
        formData.append('file', file);
      }

      await api.uploadDocument(formData);
      onShowToast({
        type: 'success',
        message: `${DOCUMENT_LABELS[category] || category} uploaded successfully!`,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Upload {DOCUMENT_LABELS[category] || category}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
              Supported file types: PDF, JPG, PNG (Max 5 MB)
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

            {/* Dynamic Category Fields */}
            {category === 'aadhaar_card' && (
              <div className="form-group">
                <label className="form-label">12-Digit Aadhaar Number</label>
                <input
                  type="text"
                  maxLength={12}
                  className="form-input"
                  placeholder="e.g. 123456789012"
                  value={details.aadhaar_number}
                  onChange={(e) => setDetails({ ...details, aadhaar_number: e.target.value })}
                  required
                />
              </div>
            )}

            {category === 'tenth_marksheet' && (
              <>
                <div className="form-group">
                  <label className="form-label">10th Board Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1265893"
                    value={details.tenth_roll_number}
                    onChange={(e) => setDetails({ ...details, tenth_roll_number: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Board</label>
                    <select
                      className="form-select"
                      value={details.tenth_board}
                      onChange={(e) => setDetails({ ...details, tenth_board: e.target.value })}
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="UP Board">UP Board</option>
                      <option value="ICSE">ICSE</option>
                      <option value="Other">Other State Board</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Passing Year</label>
                    <input
                      type="number"
                      className="form-input"
                      value={details.tenth_passing_year}
                      onChange={(e) => setDetails({ ...details, tenth_passing_year: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 88.50"
                    value={details.tenth_percentage}
                    onChange={(e) => setDetails({ ...details, tenth_percentage: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {category === 'twelfth_marksheet' && (
              <>
                <div className="form-group">
                  <label className="form-label">12th Board Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2365893"
                    value={details.twelfth_roll_number}
                    onChange={(e) => setDetails({ ...details, twelfth_roll_number: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Board</label>
                    <select
                      className="form-select"
                      value={details.twelfth_board}
                      onChange={(e) => setDetails({ ...details, twelfth_board: e.target.value })}
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="UP Board">UP Board</option>
                      <option value="ICSE">ICSE</option>
                      <option value="Other">Other State Board</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Passing Year</label>
                    <input
                      type="number"
                      className="form-input"
                      value={details.twelfth_passing_year}
                      onChange={(e) => setDetails({ ...details, twelfth_passing_year: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 91.20"
                    value={details.twelfth_percentage}
                    onChange={(e) => setDetails({ ...details, twelfth_percentage: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {category === 'income_certificate' && (
              <>
                <div className="form-group">
                  <label className="form-label">Income Certificate / Application No.</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2315800045"
                    value={details.document_number}
                    onChange={(e) => setDetails({ ...details, document_number: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={details.issue_date}
                      onChange={(e) => setDetails({ ...details, issue_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Annual Income (₹)</label>
                    <input
                      type="number"
                      step="100"
                      className="form-input"
                      placeholder="e.g. 180000"
                      value={details.total_income}
                      onChange={(e) => setDetails({ ...details, total_income: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {category === 'category_certificate' && (
              <>
                <div className="form-group">
                  <label className="form-label">Caste Certificate Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2316800078"
                    value={details.document_number}
                    onChange={(e) => setDetails({ ...details, document_number: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={details.issue_date}
                      onChange={(e) => setDetails({ ...details, issue_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={details.certificate_category}
                      onChange={(e) => setDetails({ ...details, certificate_category: e.target.value })}
                    >
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {category === 'domicile_certificate' && (
              <>
                <div className="form-group">
                  <label className="form-label">Domicile Certificate Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2314500099"
                    value={details.document_number}
                    onChange={(e) => setDetails({ ...details, document_number: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={details.issue_date}
                      onChange={(e) => setDetails({ ...details, issue_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Domicile State</label>
                    <input
                      type="text"
                      className="form-input"
                      value={details.domicile_state}
                      onChange={(e) => setDetails({ ...details, domicile_state: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {category === 'bank_passbook' && (
              <>
                <div className="form-group">
                  <label className="form-label">Bank Account Number (in Student's Name)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 50100234567890"
                    value={details.bank_account_number}
                    onChange={(e) => setDetails({ ...details, bank_account_number: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">IFSC Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. PUNB0123400"
                      value={details.bank_ifsc}
                      onChange={(e) => setDetails({ ...details, bank_ifsc: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bank Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Punjab National Bank"
                      value={details.bank_name}
                      onChange={(e) => setDetails({ ...details, bank_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Branch Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Main Road Branch"
                    value={details.bank_branch}
                    onChange={(e) => setDetails({ ...details, bank_branch: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {category === 'ration_card' && (
              <div className="form-group">
                <label className="form-label">Ration Card Number / FCS ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 109283746501"
                  value={details.ration_card_number}
                  onChange={(e) => setDetails({ ...details, ration_card_number: e.target.value })}
                  required
                />
              </div>
            )}

            {/* File Upload Input */}
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">
                Select File (PDF, JPG, or PNG, max 5 MB)
              </label>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 10,
                  padding: 24,
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                }}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <input
                  type="file"
                  id="file-upload-input"
                  style={{ display: 'none' }}
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                />
                <Upload size={32} color="#64748b" style={{ margin: '0 auto 8px' }} />
                {file ? (
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ) : existingDoc ? (
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                      Currently uploaded: {existingDoc.file_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#2563eb', marginTop: 4 }}>
                      Click to choose a replacement file
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2563eb' }}>
                      Click to browse or drag file here
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                      PDF, JPG, or PNG up to 5MB
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              <Upload size={16} />
              <span>{uploading ? 'Uploading...' : 'Save & Upload'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
