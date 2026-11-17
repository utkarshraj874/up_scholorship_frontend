import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Building,
  GraduationCap,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function GuidelinesView() {
  const steps = [
    {
      step: 1,
      title: 'Registration on scholarship.up.gov.in',
      desc: 'Select "Postmatric Other State" (दशमोत्तर अन्य राज्य). Fill high school board roll number, passing year, and Aadhaar-linked mobile number.',
    },
    {
      step: 2,
      title: 'Aadhaar Demographic & OTP Authentication',
      desc: 'Verify Aadhaar via biometric OTP. Student name, Father name, and Date of Birth MUST match the Class 10th marksheet exactly.',
    },
    {
      step: 3,
      title: 'DigiLocker Verification',
      desc: 'Sync 10th certificate via DigiLocker authentication to unlock form fill-up.',
    },
    {
      step: 4,
      title: 'Fill Educational & College Data',
      desc: 'Select Indian Institute of Information Technology Ranchi (Outside UP). Enter Course (B.Tech CSE/ECE/etc.), admission mode (JEE Main / JoSAA), and college registration number.',
    },
    {
      step: 5,
      title: 'Income & Caste Certificate Validation',
      desc: 'Enter application number & certificate ID. Portal checks directly against UP e-District records. Certificate must be valid (within 3 years).',
    },
    {
      step: 6,
      title: 'Aadhaar NPCI / DBT Bank Mapping',
      desc: 'Scholarship is disbursed ONLY through Aadhaar DBT to your NPCI mapped bank account. Ensure individual account (not joint/minor).',
    },
    {
      step: 7,
      title: 'Draft Printout Verification with Coordinator',
      desc: 'Take the draft printout (जांच हेतु आवेदन पत्र) and bring to IIIT Ranchi Scholarship Coordinator for pre-verification before final locking.',
    },
    {
      step: 8,
      title: 'Final Lock & Submission at Institute',
      desc: 'After locking, take final printout after 3 days. Attach self-attested documents and fee receipts, then submit to IIIT Ranchi Academic Section.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              IIIT Ranchi • UP Scholarship Form Fill-up Guide
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
              Coordinator Facilitation Desk for Juniors & Peers (Postmatric Outside State Scheme)
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: 900 }}>
          This portal allows you to maintain your student profile and upload all 9 required documents safely to our institutional database. Use the reference details below while filling the official form on{' '}
          <a
            href="https://scholarship.up.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#60a5fa', textDecoration: 'underline' }}
          >
            scholarship.up.gov.in
          </a>
          .
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 24 }}>
        {/* Step-by-Step Flow */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={20} color="#2563eb" />
            Step-by-Step Form Filling Workflow
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {steps.map((s) => (
              <div
                key={s.step}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: 14,
                  borderRadius: 10,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {s.step}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
                    {s.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Master Info & Rejection Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Institute Master Data */}
          <div className="card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building size={18} color="#2563eb" />
              IIIT Ranchi Master Information
            </h4>
            <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.7 }}>
              <p><strong>Institute Name:</strong> Indian Institute of Information Technology Ranchi</p>
              <p><strong>Location:</strong> Ranchi, Jharkhand</p>
              <p><strong>Scheme:</strong> Dashmottar Other than Inter (Outside State)</p>
              <p><strong>Course:</strong> B.Tech (4 Years)</p>
              <p><strong>Branches:</strong> CSE, ECE, DS & AI, Embedded Systems</p>
              <p><strong>Admission Mode:</strong> JoSAA / CSAB (JEE Main)</p>
            </div>
          </div>

          {/* Critical Warnings */}
          <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: 10, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} color="#ef4444" />
              Top Causes of Application Rejection
            </h4>
            <ul style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6, paddingLeft: 16 }}>
              <li><strong>Name Mismatch:</strong> Name or DOB in Aadhaar not matching 10th Marksheet.</li>
              <li><strong>NPCI Seeding Inactive:</strong> Bank account not mapped for Aadhaar DBT.</li>
              <li><strong>Expired Certificate:</strong> Income certificate older than 3 years.</li>
              <li><strong>Joint Account:</strong> Bank account must be solely in student's name.</li>
              <li><strong>Over Ceiling:</strong> Family income exceeding ₹2.0L (Gen/OBC) or ₹2.5L (SC/ST).</li>
            </ul>
          </div>

          {/* Official Portal Quick Link */}
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#f1f5f9' }}>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: 12 }}>
              Ready to fill or check status on official UP Govt portal?
            </p>
            <a
              href="https://scholarship.up.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <span>Visit scholarship.up.gov.in</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
