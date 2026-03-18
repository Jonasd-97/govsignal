import React from 'react';

export default function AboutPage() {
  return (
    <div style={styles.page}>
      <div style={styles.bgGlowTop} />
      <div style={styles.bgGlowBottom} />

      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.heroCopy}>
            <span style={styles.eyebrow}>About GovSignal</span>

            <h1 style={styles.title}>
              Signal over noise.
              <span style={styles.titleAccent}> Clarity that wins.</span>
            </h1>

            <p style={styles.subtitle}>
              GovSignal is a contract intelligence platform built to simplify how
              small and mid-sized businesses win government work. We cut through
              the noise to surface opportunities with real profit potential,
              clear entry points, and a higher likelihood of success.
            </p>

            <div style={styles.buttonRow}>
              <a href="/opportunities" style={styles.primaryButton}>
                Browse Opportunities
              </a>
              <a href="/how-it-works" style={styles.secondaryButton}>
                See How It Works
              </a>
            </div>
          </div>

          <div style={styles.heroCard}>
            <div style={styles.previewHeader}>
              <span style={styles.previewDot} />
              <span style={styles.previewLabel}>GovSignal Overview</span>
            </div>

            <div style={styles.previewMetricBlock}>
              <div>
                <p style={styles.previewMetricLabel}>Opportunities surfaced</p>
                <h3 style={styles.previewMetricValue}>2,381</h3>
              </div>
              <div style={styles.previewBadge}>Live Signals</div>
            </div>

            <div style={styles.previewList}>
              <div style={styles.previewItem}>
                <div>
                  <p style={styles.previewItemTitle}>High-potential contracts</p>
                  <p style={styles.previewItemText}>
                    Opportunities filtered for fit, timing, and value.
                  </p>
                </div>
                <span style={styles.blueTag}>Qualified</span>
              </div>

              <div style={styles.previewItem}>
                <div>
                  <p style={styles.previewItemTitle}>Profit and difficulty</p>
                  <p style={styles.previewItemText}>
                    Clear signals on whether an opportunity is worth pursuing.
                  </p>
                </div>
                <span style={styles.greenTag}>Profit-first</span>
              </div>

              <div style={styles.previewItem}>
                <div>
                  <p style={styles.previewItemTitle}>Beginner-friendly entry</p>
                  <p style={styles.previewItemText}>
                    Better visibility into opportunities newer contractors can win.
                  </p>
                </div>
                <span style={styles.slateTag}>Accessible</span>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.problemSolution}>
          <div style={styles.problemBlock}>
            <span style={styles.problemLabel}>The Problem</span>
            <h2 style={styles.blockTitle}>Thousands of listings. Endless noise.</h2>
            <p style={styles.blockText}>
              Most businesses waste time sorting through opportunities without
              knowing what has real revenue potential, what is actually
              winnable, or where to begin.
            </p>
          </div>

          <div style={styles.solutionBlock}>
            <span style={styles.solutionLabel}>The Solution</span>
            <h2 style={styles.blockTitle}>Clear signals. Smarter decisions.</h2>
            <p style={styles.blockText}>
              GovSignal helps you identify what to sell, how much you can make,
              and whether an opportunity is worth your time — in seconds, not hours.
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <span style={styles.sectionEyebrow}>What we do</span>
            <h2 style={styles.sectionTitle}>A simpler way to pursue government work</h2>
            <p style={styles.sectionSubtext}>
              We turn a complex process into a clear, actionable system built for speed,
              confidence, and better decision-making.
            </p>
          </div>

          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <div style={styles.iconWrap}>🎯</div>
              <h3 style={styles.cardTitle}>Identify high-potential contracts</h3>
              <p style={styles.cardText}>
                Surface opportunities that align with your capabilities and show real
                revenue potential.
              </p>
            </div>

            <div style={styles.card}>
              <div style={styles.iconWrap}>📊</div>
              <h3 style={styles.cardTitle}>Estimate profit and difficulty</h3>
              <p style={styles.cardText}>
                Understand margin potential and complexity before investing time in a bid.
              </p>
            </div>

            <div style={styles.card}>
              <div style={styles.iconWrap}>🚀</div>
              <h3 style={styles.cardTitle}>Highlight beginner-friendly entry points</h3>
              <p style={styles.cardText}>
                Find opportunities that are more accessible for businesses newer to the space.
              </p>
            </div>

            <div style={styles.card}>
              <div style={styles.iconWrap}>💡</div>
              <h3 style={styles.cardTitle}>Provide clear signals</h3>
              <p style={styles.cardText}>
                Actionable insight that reduces guesswork and helps you move faster.
              </p>
            </div>
          </div>
        </section>

        <section style={styles.missionSection}>
          <span style={styles.sectionEyebrow}>Our mission</span>
          <h2 style={styles.sectionTitle}>Make government contracting more accessible, efficient, and profitable.</h2>
          <p style={styles.missionText}>
            We believe businesses should not need years of experience or endless hours
            of research just to find opportunities worth pursuing.
          </p>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <span style={styles.sectionEyebrow}>What we believe</span>
            <h2 style={styles.sectionTitle}>Principles behind the platform</h2>
          </div>

          <div style={styles.beliefsGrid}>
            <div style={styles.beliefCard}>
              <h3 style={styles.beliefTitle}>Profit over noise</h3>
              <p style={styles.beliefText}>Not every contract deserves your time or attention.</p>
            </div>

            <div style={styles.beliefCard}>
              <h3 style={styles.beliefTitle}>Clarity over complexity</h3>
              <p style={styles.beliefText}>Simple, useful signals beat endless raw data.</p>
            </div>

            <div style={styles.beliefCard}>
              <h3 style={styles.beliefTitle}>Speed matters</h3>
              <p style={styles.beliefText}>The faster you identify value, the faster you can act.</p>
            </div>

            <div style={styles.beliefCard}>
              <h3 style={styles.beliefTitle}>Access should be equal</h3>
              <p style={styles.beliefText}>You should not need insider knowledge to compete effectively.</p>
            </div>
          </div>
        </section>

        <section style={styles.ctaSection}>
          <div>
            <span style={styles.sectionEyebrow}>Get started</span>
            <h2 style={styles.ctaTitle}>Turn complexity into clarity.</h2>
            <p style={styles.ctaText}>
              Use GovSignal to focus on the opportunities that matter and move with more confidence.
            </p>
          </div>

          <div style={styles.ctaActions}>
            <a href="/signup" style={styles.primaryButton}>
              Get Started
            </a>
            <a href="/opportunities" style={styles.secondaryButton}>
              Explore Opportunities
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    background:
      'linear-gradient(180deg, #F8FBFF 0%, #F8FAFC 42%, #FFFFFF 100%)',
    color: '#0F172A',
    padding: '40px 20px 88px',
    overflow: 'hidden',
  },
  bgGlowTop: {
    position: 'absolute',
    top: '-160px',
    right: '-120px',
    width: '420px',
    height: '420px',
    borderRadius: '9999px',
    background: 'rgba(59,130,246,0.10)',
    filter: 'blur(70px)',
    pointerEvents: 'none',
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: '-180px',
    left: '-120px',
    width: '380px',
    height: '380px',
    borderRadius: '9999px',
    background: 'rgba(34,197,94,0.08)',
    filter: 'blur(70px)',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1180px',
    margin: '0 auto',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '32px',
    alignItems: 'center',
    padding: '36px 0 72px',
  },
  heroCopy: {
    maxWidth: '680px',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: '999px',
    background: '#EFF6FF',
    color: '#2563EB',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    border: '1px solid #DBEAFE',
    marginBottom: '18px',
  },
  title: {
    margin: '0 0 20px',
    fontSize: 'clamp(42px, 6vw, 68px)',
    lineHeight: 0.98,
    fontWeight: 800,
    letterSpacing: '-0.04em',
    color: '#0F172A',
  },
  titleAccent: {
    color: '#2563EB',
  },
  subtitle: {
    margin: 0,
    maxWidth: '680px',
    fontSize: '19px',
    lineHeight: 1.75,
    color: '#475569',
  },
  buttonRow: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
    marginTop: '30px',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '52px',
    padding: '0 24px',
    borderRadius: '999px',
    background: '#2563EB',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 10px 24px rgba(37,99,235,0.18)',
    border: '1px solid #2563EB',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '52px',
    padding: '0 24px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.85)',
    color: '#0F172A',
    fontSize: '15px',
    fontWeight: 700,
    textDecoration: 'none',
    border: '1px solid #E2E8F0',
    boxShadow: '0 8px 18px rgba(15,23,42,0.04)',
  },
  heroCard: {
    background: 'rgba(255,255,255,0.88)',
    border: '1px solid #E2E8F0',
    borderRadius: '28px',
    padding: '24px',
    boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
    backdropFilter: 'blur(10px)',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '18px',
  },
  previewDot: {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    background: '#22C55E',
  },
  previewLabel: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#334155',
  },
  previewMetricBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '18px',
    background: '#F8FAFC',
    borderRadius: '20px',
    border: '1px solid #E2E8F0',
    marginBottom: '16px',
  },
  previewMetricLabel: {
    margin: '0 0 8px',
    fontSize: '13px',
    color: '#64748B',
    fontWeight: 600,
  },
  previewMetricValue: {
    margin: 0,
    fontSize: '34px',
    lineHeight: 1,
    color: '#0F172A',
    fontWeight: 800,
    letterSpacing: '-0.03em',
  },
  previewBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '34px',
    padding: '0 12px',
    borderRadius: '999px',
    background: '#ECFDF5',
    border: '1px solid #D1FAE5',
    color: '#16A34A',
    fontSize: '13px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  previewList: {
    display: 'grid',
    gap: '12px',
  },
  previewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    padding: '16px',
    background: '#FFFFFF',
    borderRadius: '18px',
    border: '1px solid #E2E8F0',
  },
  previewItemTitle: {
    margin: '0 0 6px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#0F172A',
  },
  previewItemText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#64748B',
    maxWidth: '260px',
  },
  blueTag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 10px',
    borderRadius: '999px',
    background: '#EFF6FF',
    color: '#2563EB',
    border: '1px solid #DBEAFE',
    fontSize: '12px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  greenTag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 10px',
    borderRadius: '999px',
    background: '#ECFDF5',
    color: '#16A34A',
    border: '1px solid #D1FAE5',
    fontSize: '12px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  slateTag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 10px',
    borderRadius: '999px',
    background: '#F8FAFC',
    color: '#475569',
    border: '1px solid #E2E8F0',
    fontSize: '12px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  problemSolution: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '22px',
    marginBottom: '72px',
  },
  problemBlock: {
    padding: '30px',
    background: '#FFFFFF',
    borderRadius: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 14px 34px rgba(15,23,42,0.04)',
  },
  solutionBlock: {
    padding: '30px',
    background: '#F8FFFC',
    borderRadius: '24px',
    border: '1px solid #DCFCE7',
    boxShadow: '0 14px 34px rgba(15,23,42,0.04)',
  },
  problemLabel: {
    display: 'inline-block',
    marginBottom: '12px',
    color: '#2563EB',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  solutionLabel: {
    display: 'inline-block',
    marginBottom: '12px',
    color: '#16A34A',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  blockTitle: {
    margin: '0 0 14px',
    fontSize: '30px',
    lineHeight: 1.15,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#0F172A',
  },
  blockText: {
    margin: 0,
    fontSize: '17px',
    lineHeight: 1.75,
    color: '#475569',
  },
  section: {
    marginBottom: '72px',
  },
  sectionHeading: {
    maxWidth: '760px',
    margin: '0 auto 32px',
    textAlign: 'center',
  },
  sectionEyebrow: {
    display: 'inline-block',
    marginBottom: '10px',
    color: '#2563EB',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: 'clamp(30px, 4vw, 42px)',
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#0F172A',
  },
  sectionSubtext: {
    margin: 0,
    fontSize: '17px',
    lineHeight: 1.75,
    color: '#64748B',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '22px',
    padding: '26px 22px',
    boxShadow: '0 12px 28px rgba(15,23,42,0.04)',
  },
  iconWrap: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#EFF6FF',
    border: '1px solid #DBEAFE',
    fontSize: '24px',
    marginBottom: '18px',
  },
  cardTitle: {
    margin: '0 0 10px',
    fontSize: '19px',
    lineHeight: 1.35,
    fontWeight: 700,
    color: '#0F172A',
  },
  cardText: {
    margin: 0,
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#64748B',
  },
  missionSection: {
    marginBottom: '72px',
    textAlign: 'center',
    padding: '44px 28px',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)',
    borderRadius: '30px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 18px 40px rgba(15,23,42,0.05)',
  },
  missionText: {
    maxWidth: '760px',
    margin: '0 auto',
    fontSize: '18px',
    lineHeight: 1.8,
    color: '#475569',
  },
  beliefsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
  },
  beliefCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 12px 28px rgba(15,23,42,0.04)',
  },
  beliefTitle: {
    margin: '0 0 8px',
    fontSize: '18px',
    lineHeight: 1.35,
    fontWeight: 700,
    color: '#0F172A',
  },
  beliefText: {
    margin: 0,
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#64748B',
  },
  ctaSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
    padding: '34px 30px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '28px',
    boxShadow: '0 18px 40px rgba(15,23,42,0.05)',
  },
  ctaTitle: {
    margin: '0 0 10px',
    fontSize: 'clamp(28px, 4vw, 40px)',
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#0F172A',
  },
  ctaText: {
    margin: 0,
    maxWidth: '650px',
    fontSize: '17px',
    lineHeight: 1.75,
    color: '#64748B',
  },
  ctaActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
};