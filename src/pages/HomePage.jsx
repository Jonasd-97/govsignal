import React from 'react';

const featureCards = [
  {
    icon: '🔎',
    title: 'Find better opportunities',
    text: 'Cut through procurement noise and surface contracts worth pursuing.',
  },
  {
    icon: '⚡',
    title: 'Qualify faster',
    text: 'Focus your team on the bids that actually fit your capabilities.',
  },
  {
    icon: '📁',
    title: 'Manage your pipeline',
    text: 'Track opportunities from discovery to pursuit in one place.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Search',
    text: 'Discover relevant federal opportunities faster.',
  },
  {
    number: '02',
    title: 'Evaluate',
    text: 'Score and prioritize the best bids.',
  },
  {
    number: '03',
    title: 'Track',
    text: 'Organize your pursuit pipeline clearly.',
  },
];

export default function HomePage() {
  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.brand}>PipeGov</div>
        <nav style={styles.navLinks}>
          <a href="/about" style={styles.navLink}>About</a>
          <a href="/login" style={styles.navLink}>Sign In</a>
          <a href="/register" style={styles.navButton}>Get Started</a>
        </nav>
      </header>

      <main style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.heroCopy}>
            <span style={styles.eyebrow}>Federal Contract Intelligence</span>
            <h1 style={styles.heroTitle}>Win more government contracts with less guesswork</h1>
            <p style={styles.heroText}>
              PipeGov helps companies find, evaluate, and manage federal opportunities
              with more clarity, more speed, and better discipline.
            </p>

            <div style={styles.heroButtons}>
              <a href="/register" style={styles.primaryButton}>Get Started</a>
              <a href="/about" style={styles.secondaryButton}>Learn More</a>
            </div>
          </div>

          <div style={styles.heroPanel}>
            <div style={styles.panelTop}>
              <div style={styles.panelBadge}>Live Workflow</div>
            </div>

            <div style={styles.metricGrid}>
              <div style={styles.metricCard}>
                <div style={styles.metricValue}>5</div>
                <div style={styles.metricLabel}>Active opportunities</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricValue}>1</div>
                <div style={styles.metricLabel}>Deadline this week</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricValue}>60</div>
                <div style={styles.metricLabel}>Top score</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricValue}>3</div>
                <div style={styles.metricLabel}>Pipeline stages</div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.valueSection}>
          <h2 style={styles.sectionTitle}>Built to help you win smarter</h2>
          <div style={styles.featureGrid}>
            {featureCards.map((card) => (
              <div key={card.title} style={styles.featureCard}>
                <div style={styles.featureIcon}>{card.icon}</div>
                <h3 style={styles.featureTitle}>{card.title}</h3>
                <p style={styles.featureText}>{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.midBanner}>
          <p style={styles.midBannerText}>
            Designed for small businesses, growing contractors, and teams that want
            a more disciplined GovCon pipeline.
          </p>
        </section>

        <section style={styles.processSection}>
          <h2 style={styles.sectionTitle}>How it works</h2>
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

        <section style={styles.finalCta}>
          <div>
            <h2 style={styles.finalCtaTitle}>Start building your pipeline today</h2>
            <p style={styles.finalCtaText}>
              Move faster on the right opportunities and pursue government work more strategically.
            </p>
          </div>

          <div style={styles.finalCtaButtons}>
            <a href="/register" style={styles.primaryButton}>Create Account</a>
            <a href="/about" style={styles.secondaryButton}>About PipeGov</a>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top, rgba(35,64,122,0.28), transparent 28%), linear-gradient(180deg, #061327 0%, #081327 100%)',
    color: '#f8fafc',
  },
  navbar: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '22px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  brand: {
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.03em',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
  },
  navLink: {
    color: '#d7e1f2',
    textDecoration: 'none',
    fontWeight: 600,
  },
  navButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '42px',
    padding: '0 16px',
    borderRadius: '10px',
    background: '#f5a524',
    color: '#09111f',
    fontWeight: 800,
    textDecoration: 'none',
  },
  container: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '12px 24px 72px',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '28px',
    alignItems: 'stretch',
    padding: '44px 0 36px',
  },
  heroCopy: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  eyebrow: {
    display: 'inline-block',
    marginBottom: '16px',
    color: '#f5a524',
    fontSize: '13px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  heroTitle: {
    margin: 0,
    fontSize: 'clamp(44px, 7vw, 76px)',
    lineHeight: 0.98,
    letterSpacing: '-0.04em',
    fontWeight: 800,
    maxWidth: '760px',
  },
  heroText: {
    margin: '18px 0 0',
    color: '#b6c2d9',
    fontSize: '20px',
    lineHeight: 1.7,
    maxWidth: '700px',
  },
  heroButtons: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
    marginTop: '30px',
  },
  heroPanel: {
    background: 'rgba(16, 27, 49, 0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '22px',
    boxShadow: '0 18px 50px rgba(0,0,0,0.24)',
  },
  panelTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '18px',
  },
  panelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '32px',
    padding: '0 12px',
    borderRadius: '999px',
    background: 'rgba(245,165,36,0.12)',
    color: '#f5a524',
    fontWeight: 700,
    fontSize: '13px',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '14px',
  },
  metricCard: {
    background: 'rgba(8, 18, 38, 0.9)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px',
    padding: '18px',
  },
  metricValue: {
    fontSize: '34px',
    fontWeight: 800,
    color: '#f5a524',
    marginBottom: '8px',
  },
  metricLabel: {
    color: '#afbdd6',
    fontSize: '14px',
  },
  valueSection: {
    padding: '28px 0',
  },
  sectionTitle: {
    margin: '0 0 18px',
    fontSize: '34px',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    fontWeight: 800,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '18px',
  },
  featureCard: {
    background: 'rgba(16, 27, 49, 0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '24px',
  },
  featureIcon: {
    fontSize: '26px',
    marginBottom: '12px',
  },
  featureTitle: {
    margin: '0 0 8px',
    fontSize: '24px',
    lineHeight: 1.2,
    fontWeight: 700,
  },
  featureText: {
    margin: 0,
    color: '#aebbd3',
    fontSize: '16px',
    lineHeight: 1.65,
  },
  midBanner: {
    margin: '12px 0 18px',
    padding: '18px 22px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  midBannerText: {
    margin: 0,
    fontSize: '18px',
    color: '#dce6f4',
    lineHeight: 1.6,
  },
  processSection: {
    padding: '20px 0 8px',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '18px',
  },
  stepCard: {
    background: 'rgba(16, 27, 49, 0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '24px',
  },
  stepNumber: {
    color: '#60a5fa',
    fontWeight: 800,
    fontSize: '14px',
    marginBottom: '10px',
  },
  stepTitle: {
    margin: '0 0 8px',
    fontSize: '24px',
    fontWeight: 700,
  },
  stepText: {
    margin: 0,
    color: '#afbdd6',
    fontSize: '16px',
    lineHeight: 1.6,
  },
  finalCta: {
    marginTop: '32px',
    padding: '30px',
    borderRadius: '24px',
    background: 'rgba(16, 27, 49, 0.95)',
    border: '1px solid rgba(245,165,36,0.22)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '18px',
    flexWrap: 'wrap',
  },
  finalCtaTitle: {
    margin: '0 0 8px',
    fontSize: '34px',
    lineHeight: 1.08,
    fontWeight: 800,
  },
  finalCtaText: {
    margin: 0,
    color: '#b6c2d9',
    fontSize: '17px',
    lineHeight: 1.6,
    maxWidth: '720px',
  },
  finalCtaButtons: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '48px',
    padding: '0 18px',
    borderRadius: '12px',
    background: '#f5a524',
    color: '#09111f',
    fontWeight: 800,
    textDecoration: 'none',
    boxShadow: '0 10px 30px rgba(245,165,36,0.22)',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '48px',
    padding: '0 18px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#e8edf7',
    fontWeight: 700,
    textDecoration: 'none',
  },
};