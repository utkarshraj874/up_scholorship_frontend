import {
  ArrowUpRight,
  CalendarClock,
  ExternalLink,
  Landmark,
  Newspaper,
  ShieldCheck,
} from 'lucide-react';

const scholarshipPortal = 'https://scholarship.up.gov.in';
const dbtStatusUrl = 'https://myaadhaar.uidai.gov.in/bank-seeding-status';
const paymentStatusUrl = 'https://pfms.nic.in/SitePages/KnowYourPayment_Dw_NewNew.aspx?utm_source=chatgpt.com';

const deadlineHeadlines = [
  {
    title: 'Application and renewal deadlines',
    detail: 'Check the latest schedule for your scholarship scheme and application type.',
  },
  {
    title: 'Correction and verification dates',
    detail: 'Review current correction windows and institute or department verification updates.',
  },
  {
    title: 'Revised dates and official circulars',
    detail: 'Watch for deadline extensions and new notices from the Uttar Pradesh Scholarship Portal.',
  },
];

export default function DashboardView({ user }) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
          color: '#ffffff',
          padding: '28px 30px',
        }}
        aria-labelledby="student-dashboard-heading"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p style={{ color: '#bfdbfe', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>{today}</p>
            <h1 id="student-dashboard-heading" style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 8 }}>
              Welcome{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p style={{ color: '#dbeafe', fontSize: '0.94rem', lineHeight: 1.6, maxWidth: 650 }}>
              Keep track of scholarship deadlines, official notices, and payment status from one place.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: '#dcfce7', fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#4ade80' }} />
            Official portal links
          </div>
        </div>
      </section>

      <section aria-labelledby="deadline-headlines-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <p style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
              Deadline updates
            </p>
            <h2 id="deadline-headlines-heading" style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
              Live headlines &amp; deadlines
            </h2>
          </div>
          <a href={scholarshipPortal} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <span>Open official portal</span>
            <ExternalLink size={15} />
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: 16 }}>
          {deadlineHeadlines.map((headline) => (
            <a
              key={headline.title}
              href={scholarshipPortal}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{ display: 'block', color: 'inherit', textDecoration: 'none', padding: 20, border: '1px solid #e2e8f0' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 10, background: '#eff6ff', color: '#2563eb' }}>
                  <CalendarClock size={20} />
                </span>
                <ArrowUpRight size={17} color="#64748b" />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: 7 }}>{headline.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.55 }}>{headline.detail}</p>
            </a>
          ))}
        </div>
        <p style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5, marginTop: 12 }}>
          Deadlines may change. Open the official portal for the current schedule and latest circulars.
        </p>
      </section>

      <section aria-labelledby="payment-tools-heading">
        <div style={{ marginBottom: 14 }}>
          <p style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
            Payment tools
          </p>
          <h2 id="payment-tools-heading" style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
            Check your payment readiness and status
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
          <article className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, padding: 20 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: '1 1 210px' }}>
              <span style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', borderRadius: 10, background: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>
                <ShieldCheck size={21} />
              </span>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: 5 }}>Know Your DBT Status</h3>
                <p style={{ color: '#64748b', fontSize: '0.83rem', lineHeight: 1.5 }}>Check whether your Aadhaar is seeded with your bank account.</p>
              </div>
            </div>
            <a href={dbtStatusUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <span>Check DBT Status</span>
              <ExternalLink size={15} />
            </a>
          </article>

          <article className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, padding: 20 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: '1 1 210px' }}>
              <span style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', borderRadius: 10, background: '#ecfdf5', color: '#059669', flexShrink: 0 }}>
                <Landmark size={21} />
              </span>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: 5 }}>Know Your Payment Status</h3>
                <p style={{ color: '#64748b', fontSize: '0.83rem', lineHeight: 1.5 }}>Check your scholarship payment through the PFMS portal.</p>
              </div>
            </div>
            <a href={paymentStatusUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <span>Check Payment Status</span>
              <ExternalLink size={15} />
            </a>
          </article>
        </div>
      </section>

      <aside className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f8fafc' }}>
        <Newspaper size={19} color="#64748b" />
        <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5 }}>
          Deadline headlines link to the UP Scholarship Portal, the source for current dates and official notices.
        </p>
      </aside>
    </div>
  );
}
