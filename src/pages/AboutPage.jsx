import React from 'react';

export default function AboutPage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <span style={styles.eyebrow}>About PipeGov</span>
          <h1 style={styles.title}>Win more government contracts</h1>
          <p style={styles.subtitle}>
            PipeGov helps you find, evaluate, and win the right opportunities faster.
          </p>

          <div style={styles.buttonRow}>
            <a href="/opportunities" style={styles.primaryButton}>
              Browse Opportunities
            </a>
            <a href="/settings" style={styles.secondaryButton}>
              Complete Setup
            </a>
          </div>
        </section>

        <section style={styles.cardGrid}>
          <div style={styles.card}>
            <div style={styles.icon}>🔍</div>
            <h3 style={styles.cardTitle}>Find the right opportunities</h3>
            <p style={styles.cardText}>Surface high-value contracts instantly.</p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>📊</div>
            <h3 style={styles.cardTitle}>Prioritize what matters</h3>
            <p style={styles.cardText}>Score and rank bids with real data.</p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>📈</div>
            <h3 style={styles.cardTitle}>Win more consistently</h3>
            <p style={styles.cardText}>Track performance and improve outcomes.</p>
          </div>
        </section>

        <section style={styles.statementWrap}>
          <p style={styles.statement}>Built for teams serious about winning in GovCon.</p>
        </section>

        <section style={styles.cta}>
          <h2 style={styles.ctaTitle}>Start building your pipeline today</h2>
          <a href="/dashboard" style={styles.primaryButton}>
            Explore Platform
          </a>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100%',
    background:
      'radial-gradient(circle at top, rgba(35,64,122,0.25), transparent 30%), linear-gradient(180deg, #07152d 0%, #081224 100%)',
    color: '#f8fafc',
    padding: '40px 24px 64px',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  hero: {
    padding: '28px 0 40px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '32px',
  },
  eyebrow: {
    display: 'inline-block',
    marginBottom: '14px',
    color: '#f5a524',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '0 0 12px',
    fontSize: 'clamp(40px, 6vw, 68px)',
    lineHeight: 1.02,
    fontWeight: 800,
    letterSpacing: '-0.03em',
  },
  subtitle: {
    margin: 0,
    maxWidth: '720px',
    fontSize: '20px',
    lineHeight: 1.6,
    color: '#b6c2d9',
  },
  buttonRow: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
    marginTop: '28px',
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
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '18px',
    marginBottom: '32px',
  },
  card: {
    background: 'rgba(16, 27, 49, 0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    padding: '24px',
    boxShadow: '0 14px 40px rgba(0,0,0,0.18)',
  },
  icon: {
    fontSize: '24px',
    marginBottom: '14px',
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: '24px',
    lineHeight: 1.2,
    fontWeight: 700,
  },
  cardText: {
    margin: 0,
    color: '#a9b7d0',
    fontSize: '16px',
    lineHeight: 1.6,
  },
  statementWrap: {
    padding: '8px 0 36px',
  },
  statement: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 600,
    color: '#f4f7fb',
  },
  cta: {
    marginTop: '8px',
    padding: '30px',
    background: 'rgba(17, 28, 51, 0.9)',
    border: '1px solid rgba(245,165,36,0.2)',
    borderRadius: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  ctaTitle: {
    margin: 0,
    fontSize: '32px',
    lineHeight: 1.15,
    fontWeight: 800,
  },
};