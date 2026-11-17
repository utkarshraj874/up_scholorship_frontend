import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const registrationPattern = /^\d{4}UG\d{4}$/;
const identityFieldValidators = {
  registration_no: (value) => (
    registrationPattern.test(value) ? '' : 'Use the format 2024UG1035 (4 digits, UG, then 4 digits).'
  ),
  phone_no: (value) => (
    /^\d{10}$/.test(value) ? '' : 'Mobile number must contain exactly 10 digits.'
  ),
};

export default function ProfileView({ user, onShowToast }) {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    registration_no: '',
    category: 'General',
    department: 'Computer Science and Engineering',
    semester: 1,
    phone_no: '',
    tenth_percentage: '',
    twelfth_percentage: '',
    family_income: '',
    semester_result: '',
  });

  // Validation errors for client‑side checks
  const [validationErrors, setValidationErrors] = useState({});

  // Loading, saving, and profile existence flags
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const updateIdentityField = (field, value) => {
    let sanitizedValue = value;
    if (field === 'registration_no') {
      sanitizedValue = value.toUpperCase().replace(/[^0-9UG]/g, '').slice(0, 10);
    } else {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    setProfile((current) => ({ ...current, [field]: sanitizedValue }));
    setValidationErrors((current) => ({
      ...current,
      [field]: current[field] ? identityFieldValidators[field](sanitizedValue) : '',
    }));
  };

  const validateIdentityFields = () => {
    const errors = {
      registration_no: identityFieldValidators.registration_no(profile.registration_no),
      phone_no: identityFieldValidators.phone_no(profile.phone_no),
    };
    setValidationErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const data = await api.getMyProfile();
        if (!active) return;

        if (data) {
          setProfile({
            name: data.name || user?.name || '',
            registration_no: data.registration_no || '',
            category: data.category || 'General',
            department: data.department || 'Computer Science and Engineering',
            semester: data.semester || 1,
            phone_no: data.phone_no || '',
            tenth_percentage: data.tenth_percentage ?? '',
            twelfth_percentage: data.twelfth_percentage ?? '',
            family_income: data.family_income ?? '',
            semester_result: data.semester_result ?? '',
          });
          setHasProfile(true);
        } else {
          setProfile((prev) => ({ ...prev, name: user?.name || '' }));
          setHasProfile(false);
        }
      } catch (err) {
        if (active) {
          console.error(err);
          onShowToast({ type: 'error', message: 'Could not load profile' });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [onShowToast, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateIdentityFields()) return;
    setSaving(true);

    try {
      const payload = {
        name: profile.name,
        registration_no: profile.registration_no,
        category: profile.category,
        department: profile.department,
        semester: parseInt(profile.semester, 10),
        phone_no: profile.phone_no,
        tenth_percentage: parseFloat(profile.tenth_percentage),
        twelfth_percentage: parseFloat(profile.twelfth_percentage),
        family_income: parseFloat(profile.family_income),
        semester_result: profile.semester_result ? parseFloat(profile.semester_result) : null,
      };

      if (!payload.name) throw new Error('Name is required');
      if (!payload.registration_no) throw new Error('Registration number is required');
      if (!payload.phone_no) throw new Error('Phone number is required');
      if (isNaN(payload.tenth_percentage)) throw new Error('Valid 10th percentage is required');
      if (isNaN(payload.twelfth_percentage)) throw new Error('Valid 12th percentage is required');
      if (isNaN(payload.family_income)) throw new Error('Valid family income is required');

      await api.saveProfile(payload);
      setHasProfile(true);
      onShowToast({ type: 'success', message: 'Profile saved successfully!' });
    } catch (err) {
      onShowToast({ type: 'error', message: err.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  // UP Scholarship income threshold calculation
  const incomeVal = parseFloat(profile.family_income) || 0;
  const isSCST = ['SC', 'ST'].includes(profile.category?.toUpperCase());
  const maxIncome = isSCST ? 250000 : 200000;
  const isIncomeEligible = incomeVal > 0 && incomeVal <= maxIncome;

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
        <RefreshCw className="spin" size={28} style={{ margin: '0 auto 12px' }} />
        <p>Loading your student profile...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Banner */}
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
            Student Academic & Personal Profile
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: 2 }}>
            Manage the primary student details required for UP Scholarship registration and college record verification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {hasProfile ? (
            <span className="badge badge-success">
              <CheckCircle2 size={14} /> Profile Active
            </span>
          ) : (
            <span className="badge badge-warning">
              <AlertTriangle size={14} /> Profile Incomplete
            </span>
          )}
        </div>
      </div>

      <div className="profile-layout">
        {/* Form Card */}
        <div className="card profile-form-card">
          <form onSubmit={handleSave}>
            <div className="profile-fields-grid">
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Full Name (as per 10th Marksheet)</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Manish Kumar"
                  required
                />
              </div>

              {/* College Registration Number */}
              <div className="form-group">
                <label className="form-label">IIIT Ranchi Registration No. / Roll No.</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.registration_no}
                  onChange={(e) => updateIdentityField('registration_no', e.target.value)}
                  onBlur={() => setValidationErrors((current) => ({
                    ...current,
                    registration_no: identityFieldValidators.registration_no(profile.registration_no),
                  }))}
                  placeholder="e.g. 2024UG1035"
                  maxLength={10}
                  aria-invalid={Boolean(validationErrors.registration_no)}
                  aria-describedby="registration-no-hint registration-no-error"
                  required
                />
                <p className="form-hint" id="registration-no-hint">Required format: 2024UG1035.</p>
                {validationErrors.registration_no && (
                  <p className="form-error" id="registration-no-error">{validationErrors.registration_no}</p>
                )}
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <select
                  className="form-select"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering (CSE)</option>
                  <option value="Electronics and Communication Engineering">Electronics and Communication Engineering (ECE)</option>
                  <option value="Data Science and Artificial Intelligence">Data Science & AI</option>
                  <option value="Embedded Systems and IoT">Embedded Systems & IoT</option>
                </select>
              </div>

              {/* Semester */}
              <div className="form-group">
                <label className="form-label">Current Semester</label>
                <select
                  className="form-select"
                  value={profile.semester}
                  onChange={(e) => setProfile({ ...profile, semester: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s} ({Math.ceil(s / 2)} Year)
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={profile.category}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC (Other Backward Class)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                  <option value="Minority">Minority</option>
                </select>
              </div>

              {/* Phone No */}
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={profile.phone_no}
                  onChange={(e) => updateIdentityField('phone_no', e.target.value)}
                  onBlur={() => setValidationErrors((current) => ({
                    ...current,
                    phone_no: identityFieldValidators.phone_no(profile.phone_no),
                  }))}
                  placeholder="e.g. 9876543210"
                  inputMode="numeric"
                  maxLength={10}
                  aria-invalid={Boolean(validationErrors.phone_no)}
                  aria-describedby="phone-no-hint phone-no-error"
                  required
                />
                <p className="form-hint" id="phone-no-hint">Enter exactly 10 digits.</p>
                {validationErrors.phone_no && (
                  <p className="form-error" id="phone-no-error">{validationErrors.phone_no}</p>
                )}
              </div>

              {/* 10th Percentage */}
              <div className="form-group">
                <label className="form-label">10th (High School) Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="form-input"
                  value={profile.tenth_percentage}
                  onChange={(e) => setProfile({ ...profile, tenth_percentage: e.target.value })}
                  placeholder="e.g. 88.50"
                  required
                />
              </div>

              {/* 12th Percentage */}
              <div className="form-group">
                <label className="form-label">12th (Intermediate) Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="form-input"
                  value={profile.twelfth_percentage}
                  onChange={(e) => setProfile({ ...profile, twelfth_percentage: e.target.value })}
                  placeholder="e.g. 91.20"
                  required
                />
              </div>

              {/* Annual Family Income */}
              <div className="form-group">
                <label className="form-label">Total Annual Family Income (₹)</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  className="form-input"
                  value={profile.family_income}
                  onChange={(e) => setProfile({ ...profile, family_income: e.target.value })}
                  placeholder="e.g. 180000"
                  required
                />
                <p className="form-hint">Must match the income certificate issued by UP e-District.</p>
              </div>

              {/* Semester Result / CGPA */}
              <div className="form-group">
                <label className="form-label">Latest Semester Result / CGPA (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-input"
                  value={profile.semester_result}
                  onChange={(e) => setProfile({ ...profile, semester_result: e.target.value })}
                  placeholder="e.g. 8.65"
                />
                <p className="form-hint">For renewal students (2nd/3rd/4th year).</p>
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                paddingTop: 18,
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : hasProfile ? 'Update Profile' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Info & Rule Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Income Ceiling Check */}
          <div className="card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} color="#2563eb" />
              UP Govt Income Ceiling Rule
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: 16 }}>
              Under UP Social Welfare rules for Postmatric Scholarship:
              <ul style={{ marginLeft: 20, marginTop: 8, lineHeight: 1.6 }}>
                <li>
                  <strong>SC / ST:</strong> Max <strong>₹2,50,000</strong>/year
                </li>
                <li>
                  <strong>General / OBC / Minority:</strong> Max <strong>₹2,00,000</strong>/year
                </li>
              </ul>
            </div>

            {incomeVal > 0 && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: isIncomeEligible ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${isIncomeEligible ? '#a7f3d0' : '#fecaca'}`,
                  color: isIncomeEligible ? '#065f46' : '#991b1b',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {isIncomeEligible ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>
                  {isIncomeEligible
                    ? `Eligible: ₹${incomeVal.toLocaleString()} is within ceiling (₹${maxIncome.toLocaleString()})`
                    : `Ineligible: ₹${incomeVal.toLocaleString()} exceeds ceiling (₹${maxIncome.toLocaleString()})`}
                </span>
              </div>
            )}
          </div>

          {/* IIIT Ranchi Institute Info Card */}
          <div className="card" style={{ backgroundColor: '#f8fafc' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, color: '#1e293b' }}>
              Institute Code & Details
            </h4>
            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
              <p><strong>Institute:</strong> Indian Institute of Information Technology Ranchi</p>
              <p><strong>Scheme:</strong> Dashmottar Other than Inter (Outside UP State)</p>
              <p><strong>Affiliation:</strong> Autonomous Institute of National Importance</p>
              <p style={{ marginTop: 8, color: '#2563eb', fontWeight: 600 }}>
                Draft forms must be verified with the student coordinator before final lock.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
