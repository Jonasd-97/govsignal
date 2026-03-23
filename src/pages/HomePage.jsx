import React from 'react';

const aiFeatures = [
  {
    icon: '🤖',
    title: 'AI bid/no-bid analysis',
    text: 'Paste in any SAM.gov opportunity and get an instant AI verdict — Strong Fit, Potential Fit, or Skip — with win probability and next steps. No BD experience required.',
  },
  {
    icon: '📝',
    title: 'AI proposal drafting',
    text: 'Generate capability statements, executive summaries, and technical approaches in seconds. The AI writes around your company profile and past performance automatically.',
  },
  {
    icon: '🎯',
    title: 'AI proposal scoring',
    text: 'Get a letter grade (A–F) across 5 dimensions before you submit. Know exactly what to fix. No other GovCon tool on the market has this feature.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Find the right opportunities',
    text: 'Search live SAM.gov contracts filtered by NAICS code, set-aside type, agency, and contract value. Every result is scored for fit so you know where to focus first.',
  },
  {
    number: '02',
    title: 'Let AI qualify them',
    text: 'Run any opportunity through AI analysis. Get a clear bid/no-bid recommendation, win probability estimate, key risks, and a specific list of next steps.',
  },
  {
    number: '03',
    title: 'Draft and score faster',
    text: 'Use AI to generate your proposal documents, then score them before you submit. What used to take a team of BD specialists now takes one person a few hours.',
  },
];

const comparisons = [
  { label: 'Monthly cost', govSignal: '$49/mo', competitors: '$500–$1,250/mo' },
  { label: 'AI bid/no-bid analysis', govSignal: '✓ Included', competitors: '✗ Not available' },
  { label: 'AI proposal drafting', govSignal: '✓ Included', competitors: '✗ Not available' },
  { label: 'AI proposal scoring', govSignal: '✓ Unique feature', competitors: '✗ Does not exist' },
  { label: 'No BD team required', govSignal: '✓ Built for it', competitors: '✗ Assumes you have one' },
  { label: 'Setup time', govSignal: '5 minutes', competitors: 'Weeks + onboarding calls' },
];

export default function HomePage() {
  return (
    <div style={styles.page}>
      <div style={styles.bgGlowTop} />
      <div style={styles.bgGlowBottom} />

      <div style={styles.container}>

        {/* Navbar */}
        <header style={styles.navbar}>
          <div style={styles.brand}>Helix<span style={{color:'#2563EB'}}>Gov</span></div>
          <nav style={styles.navLinks}>
            <a href="/about" style={styles.navLink}>About</a>
            <a href="/login" style={styles.navLink}>Sign In</a>
            <a href="/register" style={styles.navButton}>Get Started Free</a>
          </nav>
        </header>

        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroCopy}>
            <span style={styles.eyebrow}>AI-Powered GovCon Intelligence</span>
            <h1 style={styles.heroTitle}>
              Find, qualify, and pursue federal contracts — without a BD team
            </h1>
            <p style={styles.heroText}>
              Large contractors spend $50k+/year on BD staff just to find and bid on the
              right contracts. HelixGov gives you the same capability for $49/mo — instant
              bid analysis, AI proposal drafting, and the only proposal scoring feature in GovCon.
            </p>
            <div style={styles.heroButtons}>
              <a href="/register" style={styles.primaryButton}>Start Free</a>
              <a href="/about" style={styles.secondaryButton}>See How It Works</a>
            </div>
            <div style={styles.proofRow}>
              <span style={styles.proofChip}>✓ No BD experience needed</span>
              <span style={styles.proofChip}>✓ Live SAM.gov data</span>
              <span style={styles.proofChip}>✓ No credit card to start</span>
            </div>
          </div>

          <div style={styles.heroPanel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelDot} />
              <span style={styles.panelLabel}>AI Bid Analysis</span>
              <span style={styles.panelBadge}>Live</span>
            </div>
            <div style={styles.analysisCard}>
              <div style={styles.analysisTop}>
                <div>
                  <p style={styles.analysisOpTitle}>IT Support Services — Dept. of Veterans Affairs</p>
                  <p style={styles.analysisOpMeta}>Small Business Set-Aside · NAICS 541519 · $2.1M</p>
                </div>
                <span style={styles.scoreChip}>84</span>
              </div>
              <div style={styles.verdictRow}>
                <span style={styles.verdictBadge}>Strong Fit</span>
                <span style={styles.winProb}>71% win probability</span>
              </div>
              <p style={styles.verdictReason}>
                Matches your NAICS and set-aside. Low incumbent risk. Strong past performance alignment.
              </p>
              <div style={styles.nextStepsLabel}>AI next steps</div>
              <div style={styles.nextStepsList}>
                {[
                  'Request the RFP package this week',
                  'Document 2 similar past performance examples',
                  'Identify a teaming partner for staffing depth',
                ].map((step) => (
                  <div key={step} style={styles.nextStep}>
                    <span style={styles.nextStepDot} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI Features */}
        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <span style={styles.sectionEyebrow}>What the AI does for you</span>
            <h2 style={styles.sectionTitle}>Your AI business development team</h2>
            <p style={styles.sectionSubtext}>
              The same analysis large GovCon firms pay consultants $5–10k to produce —
              automated, instant, and built into every paid plan.
            </p>
          </div>
          <div style={styles.featureGrid}>
            {aiFeatures.map((f) => (
              <div key={f.title} style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureText}>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <span style={styles.sectionEyebrow}>How it works</span>
            <h2 style={styles.sectionTitle}>From search to submission in one place</h2>
          </div>
          <div style={styles.stepsGrid}>
            {steps.map((step) => (
              <div key={step.number} style={styles.stepCard}>
                <div style={styles.stepNumber}>{step.number}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison */}
        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <span style={styles.sectionEyebrow}>How we compare</span>
            <h2 style={styles.sectionTitle}>Everything they charge $1,250/mo for — at $49</h2>
            <p style={styles.sectionSubtext}>
              Deltek, GovWin, and GovLead are built for enterprise BD teams with big budgets.
              HelixGov is built for you.
            </p>
          </div>
          <div style={styles.comparisonTable}>
            <div style={styles.comparisonHeader}>
              <span style={styles.compColLabel} />
              <span style={{ ...styles.compColHead, color: '#2563EB', fontWeight: 700 }}>Helix<span style={{color:'#2563EB'}}>Gov</span></span>
              <span style={styles.compColHead}>Deltek / GovWin</span>
            </div>
            {comparisons.map((row, i) => (
              <div key={row.label} style={{
                ...styles.comparisonRow,
                background: i % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
              }}>
                <span style={styles.compRowLabel}>{row.label}</span>
                <span style={styles.compGovSignal}>{row.govSignal}</span>
                <span style={styles.compCompetitor}>{row.competitors}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={styles.ctaSection}>
          <div>
            <h2 style={styles.ctaTitle}>Start building your pipeline today</h2>
            <p style={styles.ctaText}>
              Free plan includes opportunity search, pipeline tracking, and one AI proposal
              draft per week. No credit card required to get started.
            </p>
          </div>
          <div style={styles.ctaButtons}>
            <a href="/register" style={styles.primaryButton}>Create Free Account</a>
            <a href="/about" style={styles.secondaryButton}>About HelixGov</a>
          </div>
        </section>

      </div>
    </div>
  );
}

const styles = {
  page: {
    position: 'relative', minHeight: '100vh',
    background: 'linear-gradient(180deg, #F8FBFF 0%, #F8FAFC 42%, #FFFFFF 100%)',
    color: '#0F172A', overflow: 'hidden',
  },
  bgGlowTop: {
    position: 'absolute', top: '-160px', right: '-120px', width: '420px', height: '420px',
    borderRadius: '9999px', background: 'rgba(59,130,246,0.10)', filter: 'blur(70px)', pointerEvents: 'none',
  },
  bgGlowBottom: {
    position: 'absolute', bottom: '-180px', left: '-120px', width: '380px', height: '380px',
    borderRadius: '9999px', background: 'rgba(34,197,94,0.08)', filter: 'blur(70px)', pointerEvents: 'none',
  },
  container: { position: 'relative', zIndex: 1, maxWidth: '1180px', margin: '0 auto', padding: '0 24px 88px' },
  navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '22px 0' },
  brand: { fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' },
  navLink: { color: '#475569', textDecoration: 'none', fontWeight: 600, fontSize: '15px' },
  navButton: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '40px', padding: '0 18px', borderRadius: '999px',
    background: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '14px',
    textDecoration: 'none', boxShadow: '0 6px 18px rgba(37,99,235,0.18)',
  },
  hero: {
    display: 'grid', gridTemplateColumns: '1.15fr 0.85fr',
    gap: '36px', alignItems: 'center', padding: '44px 0 64px',
  },
  heroCopy: { display: 'flex', flexDirection: 'column' },
  eyebrow: {
    display: 'inline-flex', alignItems: 'center', padding: '7px 14px',
    borderRadius: '999px', background: '#EFF6FF', color: '#2563EB',
    fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    border: '1px solid #DBEAFE', marginBottom: '20px', width: 'fit-content',
  },
  heroTitle: {
    margin: '0 0 18px', fontSize: 'clamp(34px, 5vw, 58px)',
    lineHeight: 1.04, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', maxWidth: '720px',
  },
  heroText: { margin: 0, color: '#475569', fontSize: '17px', lineHeight: 1.75, maxWidth: '620px' },
  heroButtons: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '28px' },
  proofRow: { display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '18px' },
  proofChip: { fontSize: '13px', color: '#64748B', fontWeight: 600 },
  heroPanel: {
    background: 'rgba(255,255,255,0.90)', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '22px',
    boxShadow: '0 24px 60px rgba(15,23,42,0.08)', backdropFilter: 'blur(10px)',
  },
  panelHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  panelDot: { width: '9px', height: '9px', borderRadius: '999px', background: '#22C55E' },
  panelLabel: { fontSize: '13px', fontWeight: 700, color: '#334155', flex: 1 },
  panelBadge: {
    display: 'inline-flex', alignItems: 'center', minHeight: '26px', padding: '0 10px',
    borderRadius: '999px', background: '#ECFDF5', border: '1px solid #D1FAE5',
    color: '#16A34A', fontSize: '11px', fontWeight: 700,
  },
  analysisCard: { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '16px' },
  analysisTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' },
  analysisOpTitle: { margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#0F172A' },
  analysisOpMeta: { margin: 0, fontSize: '12px', color: '#64748B' },
  scoreChip: {
    minWidth: '38px', height: '38px', borderRadius: '999px',
    background: 'rgba(22,163,74,0.12)', color: '#166534',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '15px', fontWeight: 800, flexShrink: 0,
  },
  verdictRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  verdictBadge: {
    display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
    borderRadius: '999px', background: '#ECFDF5', border: '1px solid #D1FAE5', color: '#16A34A', fontSize: '12px', fontWeight: 700,
  },
  winProb: { fontSize: '12px', color: '#64748B', fontWeight: 600 },
  verdictReason: { margin: '0 0 14px', fontSize: '12px', color: '#475569', lineHeight: 1.6 },
  nextStepsLabel: {
    fontSize: '11px', fontWeight: 700, color: '#2563EB',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px',
  },
  nextStepsList: { display: 'grid', gap: '6px' },
  nextStep: { display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#334155' },
  nextStepDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB', marginTop: '4px', flexShrink: 0 },
  section: { marginBottom: '72px' },
  sectionHeading: { maxWidth: '720px', margin: '0 auto 32px', textAlign: 'center' },
  sectionEyebrow: {
    display: 'inline-block', marginBottom: '10px', color: '#2563EB',
    fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  sectionTitle: {
    margin: '0 0 12px', fontSize: 'clamp(26px, 4vw, 38px)',
    lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A',
  },
  sectionSubtext: { margin: 0, fontSize: '17px', lineHeight: 1.75, color: '#64748B' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' },
  featureCard: {
    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '22px', padding: '26px 22px',
    boxShadow: '0 12px 28px rgba(15,23,42,0.04)',
  },
  featureIcon: {
    width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#EFF6FF', border: '1px solid #DBEAFE', fontSize: '22px', marginBottom: '16px',
  },
  featureTitle: { margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 },
  featureText: { margin: 0, fontSize: '15px', lineHeight: 1.7, color: '#64748B' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' },
  stepCard: {
    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '22px', padding: '26px 22px',
    boxShadow: '0 12px 28px rgba(15,23,42,0.04)',
  },
  stepNumber: { color: '#2563EB', fontWeight: 800, fontSize: '13px', letterSpacing: '0.05em', marginBottom: '12px' },
  stepTitle: { margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#0F172A' },
  stepText: { margin: 0, fontSize: '15px', lineHeight: 1.65, color: '#64748B' },
  comparisonTable: {
    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '22px', overflow: 'hidden',
    boxShadow: '0 12px 28px rgba(15,23,42,0.04)',
  },
  comparisonHeader: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '14px 20px',
    background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
  },
  compColLabel: { fontSize: '13px', color: '#64748B' },
  compColHead: { fontSize: '13px', fontWeight: 600, color: '#334155', textAlign: 'center' },
  comparisonRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '13px 20px', borderBottom: '0.5px solid #F1F5F9', alignItems: 'center' },
  compRowLabel: { fontSize: '14px', color: '#334155', fontWeight: 500 },
  compGovSignal: { fontSize: '13px', color: '#16A34A', fontWeight: 600, textAlign: 'center' },
  compCompetitor: { fontSize: '13px', color: '#94A3B8', textAlign: 'center' },
  ctaSection: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: '24px', flexWrap: 'wrap', padding: '36px 32px',
    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '28px',
    boxShadow: '0 18px 40px rgba(15,23,42,0.05)',
  },
  ctaTitle: {
    margin: '0 0 10px', fontSize: 'clamp(22px, 4vw, 32px)',
    lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A',
  },
  ctaText: { margin: 0, maxWidth: '560px', fontSize: '16px', lineHeight: 1.75, color: '#64748B' },
  ctaButtons: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  primaryButton: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '50px', padding: '0 24px', borderRadius: '999px',
    background: '#2563EB', color: '#FFFFFF', fontSize: '15px', fontWeight: 700,
    textDecoration: 'none', boxShadow: '0 10px 24px rgba(37,99,235,0.18)', border: '1px solid #2563EB',
  },
  secondaryButton: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '50px', padding: '0 24px', borderRadius: '999px',
    background: 'rgba(255,255,255,0.85)', color: '#0F172A', fontSize: '15px', fontWeight: 700,
    textDecoration: 'none', border: '1px solid #E2E8F0', boxShadow: '0 8px 18px rgba(15,23,42,0.04)',
  },
};
