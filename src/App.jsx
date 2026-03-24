import React, { useEffect, useMemo, useState } from 'react';
import {
  AGENCY_OPTIONS,
  DEFAULT_FILTERS,
  EMPTY_PROFILE,
  NAICS_OPTIONS,
  PLAN_CARDS,
  SET_ASIDE_OPTIONS,
  TYPE_OPTIONS,
} from './constants';
import { api, tokenStore } from './lib/api';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatValueRange,
  getDaysLeft,
  normalizeOpportunity,
  recommendationLabel,
  scoreTone,
  typeLabel,
} from './utils/format';
import './index.css';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';

const NAV_ITEMS = [
  ['dashboard', 'Dashboard'],
  ['opportunities', 'Opportunities'],
  ['watchlist', 'Watchlist'],
  ['searches', 'Saved Searches'],
  ['performance', 'Past Performance'],
  ['proposal', 'Proposal Lab'],
  ['settings', 'Settings'],
];

const PUBLIC_VIEWS = new Set(['home', 'about', 'auth']);

const VIEW_LABELS = {
  home: 'Home',
  about: 'About',
  auth: 'Sign In',
  dashboard: 'Dashboard',
  opportunities: 'Opportunities',
  watchlist: 'Watchlist',
  searches: 'Saved Searches',
  performance: 'Past Performance',
  proposal: 'Proposal Lab',
  settings: 'Settings',
  pricing: 'Pricing',
};

const initialAuth = { email: '', password: '', confirmPassword: '', name: '', companyName: '' };
const initialPerfForm = {
  title: '',
  agency: '',
  contractValue: '',
  year: '',
  outcome: 'Won',
  description: '',
  naicsCode: '',
};

function parseInitialView() {
  const path = window.location.pathname.replace(/^\//, '');

  if (!path) return 'home';
  if (path === 'about') return 'about';
  if (path === 'login' || path === 'register' || path === 'auth' || path === 'reset-password') return 'auth';
  if (NAV_ITEMS.some(([key]) => key === path)) return path;

  return 'home';
}

function StatCard({ label, value, hint }) {
  return (
    <div className="card stat-card">
      <div className="muted">{label}</div>
      <div className="stat-value">{value}</div>
      {hint ? <div className="tiny muted">{hint}</div> : null}
    </div>
  );
}

function ScorePill({ score }) {
  return <span className={`score-pill ${scoreTone(score)}`}>{score}</span>;
}

function Badge({ children, tone = 'default' }) {
  const inlineStyle = tone === 'info'
    ? { backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' }
    : {};
  return <span className={`badge ${tone}`} style={inlineStyle}>{children}</span>;
}

function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function SelectOptions({ options, includeBlank = false, blankLabel = 'Select one' }) {
  return (
    <>
      {includeBlank ? <option value="">{blankLabel}</option> : null}
      {options.map((option) => (
        <option key={option.code || option} value={option.code || option}>
          {option.label || option}
        </option>
      ))}
    </>
  );
}

function OpportunityCard({ opportunity, onSelect, onToggleSave, saved }) {
  const daysLeft = getDaysLeft(opportunity.responseDeadline);
  const score = opportunity.score || 0;
  const accentColor = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
  const urgency = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

  return (
    <button
      className="card opportunity-card"
      onClick={() => onSelect(opportunity)}
      type="button"
      style={{ padding: 0, overflow: 'hidden', textAlign: 'left', display: 'block', width: '100%' }}
    >
      {/* Left accent bar */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ width: '4px', backgroundColor: accentColor, flexShrink: 0, borderRadius: '4px 0 0 4px' }} />

        <div style={{ flex: 1, padding: '1rem 1rem 0.75rem' }}>
          {/* Top row: score + recommendation + save button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontWeight: 700, fontSize: '1rem', color: accentColor,
                backgroundColor: `${accentColor}18`, border: `1.5px solid ${accentColor}40`,
                borderRadius: '6px', padding: '0.1rem 0.5rem', minWidth: '2.2rem', textAlign: 'center'
              }}>{score}</span>
              <span style={{
                fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                borderRadius: '999px', backgroundColor: `${accentColor}18`,
                color: accentColor, border: `1px solid ${accentColor}30`
              }}>{opportunity.recommendation}</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleSave(opportunity); }}
              style={{
                fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem',
                borderRadius: '999px', border: saved ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                backgroundColor: saved ? '#eff6ff' : '#f8fafc',
                color: saved ? '#2563eb' : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >{saved ? 'Saved' : 'Save'}</button>
          </div>

          {/* Title + agency */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.3, marginBottom: '0.15rem' }}>
              {opportunity.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {opportunity.agency || 'Unknown agency'}{opportunity.subAgency ? ` \u00b7 ${opportunity.subAgency}` : ''}
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
              {typeLabel(opportunity.opportunityType)}
            </span>
            {opportunity.naicsCode && (
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
                NAICS {opportunity.naicsCode}
              </span>
            )}
            {opportunity.setAsideDescription && (
              <span style={{ fontSize: '0.7rem', color: '#6366f1', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
                {opportunity.setAsideDescription}
              </span>
            )}
          </div>

          {/* Value + reason tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
              Est. Value: {formatValueRange(opportunity.valueMin, opportunity.valueMax, opportunity.valueLabel)}
            </span>
            {(opportunity.reasons || []).filter(r => {
              const lower = r.toLowerCase();
              return !lower.includes('set-aside') &&
                     !lower.includes('small business') &&
                     !lower.includes('sdvosb') &&
                     !lower.includes('wosb') &&
                     !lower.includes('hubzone') &&
                     !lower.includes('8(a)') &&
                     !lower.includes('veteran-owned');
            }).map((reason) => {
              const r = reason.toLowerCase();
              // Green — strong positive signals
              const s = r.includes('naics') || r.includes('match') || r.includes('eligible') || r.includes('certified')
                ? { bg: '#dcfce7', color: '#15803d', border: '#86efac' }
                // Red — risk signals
                : r.includes('risk') || r.includes('clearance') || r.includes('incumbent') || r.includes('complex')
                  ? { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' }
                // Yellow — time / urgency signals
                : r.includes('lead time') || r.includes('deadline') || r.includes('urgent') || r.includes('days')
                  ? { bg: '#fef9c3', color: '#a16207', border: '#fde047' }
                // Blue — intel / early stage signals
                : r.includes('sources sought') || r.includes('early intel') || r.includes('pre-solicitation') || r.includes('rfi')
                  ? { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' }
                // Purple — contract vehicle / award signals
                : r.includes('bpa') || r.includes('idiq') || r.includes('gwac') || r.includes('vehicle') || r.includes('award')
                  ? { bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' }
                // Grey — everything else
                  : { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
              return (
                <span key={reason} style={{
                  fontSize: '0.7rem', fontWeight: 500, padding: '0.15rem 0.55rem',
                  borderRadius: '999px', backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`
                }}>{reason}</span>
              );
            })}
          </div>

          {/* Footer: posted + deadline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Posted {formatDate(opportunity.postedDate)}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: urgency ? '#dc2626' : '#64748b' }}>
              {daysLeft === null ? 'No deadline' : daysLeft < 0 ? 'Closed' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function OpportunityDetail({ opportunity, saved, onToggleSave, onAnalyze, aiAnalysis, onSummarize, contractSummary, summarizeBusy }) {
  if (!opportunity) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        Select an opportunity to review fit, risk, and next steps.
      </div>
    );
  }

  const intel = opportunity.intel || {};
  const score = opportunity.score || 0;
  const accentColor = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
  const accentBg = score >= 80 ? '#dcfce7' : score >= 60 ? '#fef9c3' : '#fee2e2';
  const accentBorder = score >= 80 ? '#86efac' : score >= 60 ? '#fde68a' : '#fca5a5';

  const intelColor = (level) => {
    if (!level) return { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
    const l = level.toLowerCase();
    if (l === 'low' || l === 'high suitability' || l === 'easy') return { color: '#15803d', bg: '#dcfce7', border: '#86efac' };
    if (l === 'moderate' || l === 'medium suitability') return { color: '#a16207', bg: '#fef9c3', border: '#fde68a' };
    if (l === 'high' || l === 'low suitability' || l === 'complex') return { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' };
    return { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
  };

  return (
    <div className="detail-panel">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 500, fontSize: '1rem', color: accentColor, background: accentBg, border: `1.5px solid ${accentBorder}`, borderRadius: '6px', padding: '1px 10px' }}>{score}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 500, padding: '2px 10px', borderRadius: '999px', background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}>{opportunity.recommendation}</span>
              </div>
              <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', lineHeight: 1.3 }}>{opportunity.title}</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                {opportunity.agency || 'Unknown agency'}{opportunity.subAgency ? ` \u00b7 ${opportunity.subAgency}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleSave(opportunity)}
              style={{ fontSize: '0.8rem', fontWeight: 500, padding: '0.4rem 1rem', borderRadius: '999px', border: saved ? '1.5px solid #2563eb' : '1.5px solid var(--color-border-secondary)', background: saved ? '#eff6ff' : 'var(--color-background-secondary)', color: saved ? '#2563eb' : 'var(--color-text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            >{saved ? 'Saved' : 'Save to watchlist'}</button>
          </div>
        </div>

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { label: 'Notice ID', value: opportunity.noticeId },
            { label: 'Type', value: typeLabel(opportunity.opportunityType) },
            { label: 'NAICS', value: opportunity.naicsCode || '--' },
            { label: 'Set-aside', value: opportunity.setAsideDescription || 'None' },
            { label: 'Posted', value: formatDate(opportunity.postedDate) },
            { label: 'Deadline', value: formatDateTime(opportunity.responseDeadline) },
          ].map(({ label, value }, i) => (
            <div key={label} style={{
              padding: '0.65rem 1rem',
              borderRight: i % 3 !== 2 ? '1px solid #e2e8f0' : 'none',
              borderBottom: i < 3 ? '1px solid #e2e8f0' : 'none',
              background: 'var(--color-background-primary)',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Intel cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { label: 'Estimated value', value: formatValueRange(opportunity.valueMin, opportunity.valueMax, opportunity.valueLabel), sub: null, level: null, invert: false },
            { label: 'Complexity', value: intel.complexityLevel || 'Unknown', sub: (intel.complexityFlags || []).join(', ') || 'No major flags', level: intel.complexityLevel, invert: false },
            { label: 'Incumbent risk', value: intel.incumbentRisk || 'Unknown', sub: (intel.incumbentSignals || []).join(', ') || 'No signals detected', level: intel.incumbentRisk, invert: false },
            { label: 'New firm suitability', value: intel.newFirmSuitability || 'Unknown', sub: intel.clearanceRequired ? `Clearance: ${intel.clearanceRequired}` : 'No clearance required', level: intel.newFirmSuitability, invert: true },
          ].map(({ label, value, sub, level, invert }, i) => {
            const getColor = (l, inv) => {
              if (!l) return { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
              const lower = l.toLowerCase();
              const green = { color: '#15803d', bg: '#dcfce7', border: '#86efac' };
              const red = { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' };
              const amber = { color: '#a16207', bg: '#fef9c3', border: '#fde68a' };
              const grey = { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
              if (lower === 'moderate') return amber;
              if (!inv) {
                if (lower === 'low' || lower === 'easy') return green;
                if (lower === 'high' || lower === 'complex') return red;
              } else {
                if (lower === 'high') return green;
                if (lower === 'low') return red;
              }
              return grey;
            };
            const c = getColor(level, invert);
            return (
              <div key={label} style={{
                padding: '0.85rem 1rem',
                background: 'var(--color-background-primary)',
                borderRight: i % 2 === 0 ? '1px solid #e2e8f0' : 'none',
                borderBottom: i < 2 ? '1px solid #e2e8f0' : 'none',
              }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '0.4rem' }}>{label}</div>
                <div style={{ marginBottom: sub ? '0.3rem' : 0 }}>
                  <span style={{
                    fontSize: '0.82rem', fontWeight: 500, padding: level ? '2px 10px' : '0',
                    borderRadius: '4px',
                    background: level ? c.bg : 'transparent',
                    color: level ? c.color : 'var(--color-text-primary)',
                    border: level ? `1px solid ${c.border}` : 'none',
                  }}>{value}</span>
                </div>
                {sub && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>{sub}</div>}
              </div>
            );
          })}
        </div>

        {/* Bid analysis */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Bid analysis</h3>
            <button type="button" className="primary-btn" onClick={() => onAnalyze(opportunity)} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
              Run AI analysis
            </button>
          </div>

          {aiAnalysis ? (
            <div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <Badge tone={aiAnalysis.verdict === 'Strong Fit' ? 'success' : aiAnalysis.verdict === 'Potential Fit' ? 'warning' : 'danger'}>{aiAnalysis.verdict}</Badge>
                <Badge>{aiAnalysis.win_probability}% win probability</Badge>
              </div>
              <p style={{ fontSize: '0.85rem', margin: '0 0 0.75rem', color: 'var(--color-text-primary)' }}>{aiAnalysis.verdict_reason}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 500, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>Strengths</div>
                  <ul style={{ margin: 0, paddingLeft: '1rem' }}>{(aiAnalysis.strengths || []).map((item) => <li key={item} style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>{item}</li>)}</ul>
                </div>
                <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 500, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>Risks</div>
                  <ul style={{ margin: 0, paddingLeft: '1rem' }}>{(aiAnalysis.risks || []).map((item) => <li key={item} style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>{item}</li>)}</ul>
                </div>
              </div>
              <div style={{ background: 'var(--color-background-secondary)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>Next steps</div>
                <ul style={{ margin: 0, paddingLeft: '1rem' }}>{(aiAnalysis.next_steps || []).map((item) => <li key={item} style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>{item}</li>)}</ul>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
              Run AI analysis to get a bid/no-bid recommendation, win probability, strengths, risks, and next steps tailored to your company profile.
            </p>
          )}
        </div>

        {/* Summary */}
        <div style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Solicitation summary</h3>
            {!contractSummary && opportunity.description && (
              <button
                type="button"
                className="primary-btn"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                onClick={onSummarize}
                disabled={summarizeBusy}
              >
                {summarizeBusy ? 'Summarizing...' : '✦ AI Summary'}
              </button>
            )}
          </div>
          {contractSummary ? (
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text-primary)' }}>{contractSummary}</p>
          ) : (
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
              {opportunity.description ? 'Click "AI Summary" for a plain-English breakdown of this contract.' : 'No description available.'}
            </p>
          )}
          {opportunity.uiLink && (
            <a href={opportunity.uiLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
              Open on SAM.gov
            </a>
          )}
        </div>

      </div>
    </div>
  );
}

function AuthScreen({ mode, setMode, authForm, setAuthForm, onAuth, resetToken, onResetPassword, authBusy, verificationSent, setVerificationSent, verificationEmail }) {
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (verificationSent) {
    return (
      <div className="auth-shell">
        <div className="auth-card card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}></div>
          <div className="brand-mark">Helix<span style={{color:'#2563EB'}}>Gov</span></div>
          <h1 style={{ fontSize: '1.3rem', marginTop: '0.75rem' }}>Check your inbox</h1>
          <p className="muted">We sent a verification link to <strong>{verificationEmail}</strong>. Click it to activate your account and start your 14-day free trial.</p>
          <p className="muted tiny" style={{ marginTop: '0.75rem' }}>Didn't get it? Check your spam folder or{' '}
            <button className="text-btn" type="button" onClick={() => setVerificationSent(false)}>go back</button>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <div className="brand-mark">Helix<span style={{color:'#2563EB'}}>Gov</span></div>
        <h1>Find, qualify, and pursue federal contracts -- without a BD team</h1>
        <p className="muted">Federal contract intelligence, built for teams that win. Start your 14-day free trial -- no credit card required.</p>

        {resetToken ? (
          <div className="form-grid">
            <Field label="New password">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
            </Field>
            <button
              className="primary-btn"
              type="button"
              onClick={() => onResetPassword(newPassword)}
              disabled={authBusy}
            >
              Reset password
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <div className="form-grid">
            <Field label="Email address">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </Field>
            <button
              className="primary-btn"
              type="button"
              onClick={() => onAuth('forgot', { email: forgotEmail })}
              disabled={authBusy}
            >
              Send reset link
            </button>
            <button className="text-btn" type="button" onClick={() => setMode('login')}>
              Back to sign in
            </button>
          </div>
        ) : (
          <div className="form-grid">
            {mode === 'register' ? (
              <>
                <Field label="Your name">
                  <input
                    value={authForm.name}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Jonas"
                  />
                </Field>
                <Field label="Company name (optional)">
                  <input
                    value={authForm.companyName}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Bastion Supply Group"
                  />
                </Field>
              </>
            ) : null}

            <Field label="Email address">
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@company.com"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 8 characters"
              />
            </Field>

            {mode === 'register' ? (
              <Field label="Confirm password">
                <input
                  type="password"
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter your password"
                />
              </Field>
            ) : null}

            <button
              className="primary-btn"
              type="button"
              onClick={() => onAuth(mode, authForm)}
              disabled={authBusy}
            >
              {mode === 'login' ? 'Sign in' : 'Create account -- start free trial'}
            </button>

            <div className="row spread wrap">
              <button
                className="text-btn"
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
              </button>
              <button className="text-btn" type="button" onClick={() => setMode('forgot')}>
                Forgot password?
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OnboardingWizard({ user, onComplete, busy }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    companyName: user?.companyName || '',
    naicsCode: user?.naicsCode || '',
    setAside: user?.setAside || '',
    targetAgency: user?.targetAgency || '',
    yearsInBusiness: '',
  });

  const totalSteps = 3;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 1) return form.companyName.trim().length > 0;
    if (step === 2) return form.naicsCode.length > 0 && form.setAside.length > 0;
    if (step === 3) return form.targetAgency.length > 0 && form.yearsInBusiness.length > 0;
    return true;
  };

  const stepTitles = [
    'Tell us about your company',
    'What work do you pursue?',
    'Who do you sell to?',
  ];
  const stepSubtitles = [
    'This helps us personalize your opportunity feed from day one.',
    'We\'ll use this to score and rank contracts that match your capabilities.',
    'We\'ll prioritize opportunities from your target agencies.',
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div className="brand-mark" style={{ marginBottom: '1.25rem' }}>Helix<span style={{color:'#2563EB'}}>Gov</span></div>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ flex: 1, height: '4px', borderRadius: '999px', background: s <= step ? '#2563eb' : '#e2e8f0', transition: 'background 0.2s' }} />
            ))}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Step {step} of {totalSteps}</div>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem' }}>{stepTitles[step - 1]}</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{stepSubtitles[step - 1]}</p>
        </div>

        {/* Step 1 -- Company name */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Company name">
              <input
                value={form.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                placeholder="e.g. Bastion Supply Group"
                autoFocus
              />
            </Field>
          </div>
        )}

        {/* Step 2 -- NAICS + set-aside */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Primary NAICS code">
              <select value={form.naicsCode} onChange={(e) => update('naicsCode', e.target.value)}>
                <SelectOptions options={NAICS_OPTIONS} includeBlank blankLabel="Select your primary NAICS" />
              </select>
            </Field>
            <Field label="Set-aside certification">
              <select value={form.setAside} onChange={(e) => update('setAside', e.target.value)}>
                <SelectOptions options={SET_ASIDE_OPTIONS} includeBlank blankLabel="Select certification" />
              </select>
            </Field>
          </div>
        )}

        {/* Step 3 -- Agency + years */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Primary target agency">
              <select value={form.targetAgency} onChange={(e) => update('targetAgency', e.target.value)}>
                <SelectOptions options={AGENCY_OPTIONS} includeBlank blankLabel="Select target agency" />
              </select>
            </Field>
            <Field label="Years in business">
              <select value={form.yearsInBusiness} onChange={(e) => update('yearsInBusiness', e.target.value)}>
                <option value="">Select range</option>
                <option value="0-1">Less than 1 year</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </Field>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem' }}>
          {step > 1 ? (
            <button type="button" className="ghost-btn" onClick={() => setStep((s) => s - 1)}>Back</button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              type="button"
              className="primary-btn"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="primary-btn"
              onClick={() => onComplete(form)}
              disabled={!canProceed() || busy}
            >
              {busy ? 'Setting up...' : 'Go to my dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


function PublicHeader({ navigate, user, setAuthMode }) {
  return (
    <header className="card public-header" style={{ marginBottom: 24 }}>
      <div className="row spread align-center wrap">
        <div>
          <div className="brand-mark">Helix<span style={{color:'#2563EB'}}>Gov</span></div>
          <p className="tiny muted">Federal contract intelligence</p>
        </div>

        <div className="row wrap align-center">
          <button type="button" className="ghost-btn" onClick={() => navigate('home')}>
            Home
          </button>
          <button type="button" className="ghost-btn" onClick={() => navigate('about')}>
            About
          </button>

          {user ? (
            <button type="button" className="primary-btn" onClick={() => navigate('dashboard')}>
              Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setAuthMode('login');
                  navigate('auth');
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  setAuthMode('register');
                  navigate('auth');
                }}
              >
                Start free
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function HomeView() {
  return <HomePage />;
}

export default function App() {
  const [token, setToken] = useState(tokenStore.get());
  const [user, setUser] = useState(null);
  const [profileDraft, setProfileDraft] = useState(EMPTY_PROFILE);
  const [view, setView] = useState(parseInitialView());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(initialAuth);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [aiLimitReached, setAiLimitReached] = useState(false);
  const [filters, setFilters] = useLocalStorage('gs_filters', DEFAULT_FILTERS);
  const [opportunities, setOpportunities] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [pastPerformance, setPastPerformance] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [digestSettings, setDigestSettings] = useState({
    enabled: true,
    frequency: 'daily',
    sendTime: '08:00',
    minScore: 60,
  });
  const [perfForm, setPerfForm] = useState(initialPerfForm);
  const [searchName, setSearchName] = useState('');
  const [analysisByNotice, setAnalysisByNotice] = useState({});
  const [summaryByNotice, setSummaryByNotice] = useState({});
  const [summarizeBusy, setSummarizeBusy] = useState(false);
  const [proposalType, setProposalType] = useState('capability');
  const [proposalOutput, setProposalOutput] = useState('');
  const [proposalScore, setProposalScore] = useState(null);
  const [proposalDocument, setProposalDocument] = useState('');
  const [perfExtracting, setPerfExtracting] = useState(false);
  const [proposalDropping, setProposalDropping] = useState(false);
  const [proposalDragOver, setProposalDragOver] = useState(false);
  const [perfDragOver, setPerfDragOver] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const resetToken = new URLSearchParams(window.location.search).get('token');
  const upgraded = new URLSearchParams(window.location.search).get('upgraded');

  const currentProfile = useMemo(
    () => ({
      name: user?.name || '',
      companyName: user?.companyName || '',
      naicsCode: user?.naicsCode || '',
      setAside: user?.setAside || '',
      targetAgency: user?.targetAgency || '',
      samApiKey: '',
    }),
    [user]
  );

  const savedNoticeIds = useMemo(
    () => new Set(watchlist.map((item) => item.opportunity?.noticeId || item.noticeId)),
    [watchlist]
  );

  const currentAnalysis = selectedOpportunity
    ? analysisByNotice[selectedOpportunity.noticeId]
    : null;

  const normalizedWatchlist = useMemo(
    () => watchlist.map(normalizeOpportunity),
    [watchlist]
  );

  const dashboardStats = useMemo(() => {
    const highFit = opportunities.filter((item) => item.score >= 80).length;
    const deadlines = opportunities.filter((item) => {
      const days = getDaysLeft(item.responseDeadline);
      return days !== null && days >= 0 && days <= 7;
    });

    return {
      highFit,
      deadlines: deadlines.length,
      saved: watchlist.length,
      searches: savedSearches.length,
    };
  }, [opportunities, watchlist.length, savedSearches.length]);

  function navigate(nextView) {
    setView(nextView);
    setMobileNavOpen(false);

    let nextPath = '/';
    if (nextView === 'about') nextPath = '/about';
    else if (nextView === 'auth') nextPath = authMode === 'register' ? '/register' : '/login';
    else if (nextView !== 'home') nextPath = `/${nextView}`;

    window.history.replaceState({}, '', `${nextPath}${window.location.search}`);
  }

  function clearFlash() {
    setTimeout(() => {
      setMessage('');
      setError('');
    }, 4000);
  }

  async function loadSession(authToken = tokenStore.get()) {
    if (!authToken) return;

    try {
      const me = await api('/api/auth/me', { token: authToken });
      setToken(authToken);
      tokenStore.set(authToken);
      setUser(me);
      setProfileDraft({ ...EMPTY_PROFILE, ...me, samApiKey: '' });
    } catch {
      tokenStore.clear();
      setToken(null);
      setUser(null);
    }
  }

  async function loadAppData() {
    if (!tokenStore.get()) return;

    try {
        const opportunityParams = new URLSearchParams();

        if (filters.keyword) opportunityParams.set('keyword', filters.keyword);
        if (filters.naicsCode) opportunityParams.set('naicsCode', filters.naicsCode);
        if (filters.setAside) opportunityParams.set('setAside', filters.setAside);
        if (filters.agency) opportunityParams.set('agency', filters.agency);
        if (filters.type) opportunityParams.set('type', filters.type);

        if (filters.minValue !== '' && filters.minValue !== null && filters.minValue !== undefined) {
            opportunityParams.set('minValue', String(filters.minValue));
        }

        if (filters.maxValue !== '' && filters.maxValue !== null && filters.maxValue !== undefined) {
          opportunityParams.set('maxValue', String(filters.maxValue));
        }

        opportunityParams.set('daysBack', String(filters.daysBack || 30));
        opportunityParams.set('limit', String(filters.limit || 50));

        const [oppRes, watchRes, searchRes, perfRes, digestRes] = await Promise.all([
          api(`/api/opportunities?${opportunityParams.toString()}`),
          api('/api/watchlist'),
          api('/api/searches'),
          api('/api/performance'),
          api('/api/digest/settings'),
        ]);
      
        const normalizedOpps = (oppRes.data || []).map(normalizeOpportunity);

      setOpportunities(normalizedOpps);
      setSelectedOpportunity(
        (previous) =>
          normalizedOpps.find((item) => item.noticeId === previous?.noticeId) ||
          normalizedOpps[0] ||
          null
      );
      setWatchlist(watchRes || []);
      setSavedSearches(searchRes || []);
      setPastPerformance(perfRes || []);
      setDigestSettings({
        enabled: true,
        frequency: 'daily',
        sendTime: '08:00',
        minScore: 60,
        ...(digestRes || {}),
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
      clearFlash();
    }
  }

  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path === 'register') setAuthMode('register');
    if (path === 'login') setAuthMode('login');
    loadSession();
  }, []);

  useEffect(() => {
    if (token) loadAppData();
  }, [token, filters]);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'register') setAuthMode('register');
      if (path === 'login') setAuthMode('login');
      setView(parseInitialView());
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (upgraded) {
      setMessage('Subscription updated successfully.');
      clearFlash();
    }
  }, [upgraded]);

  async function handleAuth(mode, payload) {
    setBusy(true);
    setError('');
    setMessage('');

    if (mode === 'register' && payload.password !== payload.confirmPassword) {
      setError('Passwords do not match.');
      clearFlash();
      setBusy(false);
      return;
    }

    try {
      if (mode === 'forgot') {
        const result = await api('/api/auth/forgot-password', {
          method: 'POST',
          body: payload,
        });
        setMessage(result.message || 'If that email exists, a reset link has been sent.');
      } else {
        const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const result = await api(path, { method: 'POST', body: payload });

        if (result.requiresVerification) {
          setVerificationEmail(payload.email);
          setVerificationSent(true);
          setBusy(false);
          return;
        }

        tokenStore.set(result.token);
        setToken(result.token);
        setUser(result.user);
        setProfileDraft({ ...EMPTY_PROFILE, ...result.user, samApiKey: '' });
        setAuthForm(initialAuth);
        navigate('dashboard');
        setMessage(mode === 'login' ? 'Welcome back.' : 'Account created. Starting your free trial.');
      }
    } catch (err) {
      if (err.message === 'Email already registered') {
        setError('Account already exists -- try signing in.');
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
      clearFlash();
    }
  }

  async function handleResetPassword(newPassword) {
    setBusy(true);

    try {
      const result = await api('/api/auth/reset-password', {
        method: 'POST',
        body: { token: resetToken, password: newPassword },
      });

      setMessage(result.message || 'Password reset successfully.');
      window.history.replaceState({}, '', '/login');
      setAuthMode('login');
      setView('auth');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      clearFlash();
    }
  }

  async function completeOnboarding(form) {
    setBusy(true);
    try {
      const result = await api('/api/auth/profile', {
        method: 'PATCH',
        body: {
          companyName: form.companyName,
          naicsCode: form.naicsCode,
          setAside: form.setAside,
          targetAgency: form.targetAgency,
          yearsInBusiness: form.yearsInBusiness,
        },
      });
      const updated = result.user || result;
      setUser((prev) => ({ ...prev, ...updated }));
      setProfileDraft((prev) => ({ ...prev, ...updated, samApiKey: '' }));
      navigate('dashboard');
      setMessage('Profile set up. Welcome to HelixGov!');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      clearFlash();
    }
  }

  async function saveProfile() {
    setBusy(true);

    try {
      const updated = await api('/api/auth/profile', {
        method: 'PATCH',
        body: profileDraft,
      });
      setUser((prev) => ({ ...prev, ...updated }));
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      clearFlash();
    }
  }

  async function toggleWatchlist(opportunity) {
    try {
      const alreadySaved = savedNoticeIds.has(opportunity.noticeId);

      if (alreadySaved) {
        await api(`/api/watchlist/${opportunity.noticeId}`, { method: 'DELETE' });
        setWatchlist((prev) =>
          prev.filter((item) => (item.opportunity?.noticeId || item.noticeId) !== opportunity.noticeId)
        );
        setMessage('Removed from watchlist.');
      } else {
        const payload = {
          noticeId: opportunity.noticeId,
          title: opportunity.title,
          agency: opportunity.agency,
          naicsCode: opportunity.naicsCode,
          opportunityType: opportunity.opportunityType,
          setAsideDescription: opportunity.setAsideDescription,
          postedDate: opportunity.postedDate,
          responseDeadline: opportunity.responseDeadline,
          uiLink: opportunity.uiLink,
        };

        const saved = await api('/api/watchlist', { method: 'POST', body: payload });
        setWatchlist((prev) => [saved, ...prev]);
        setMessage('Saved to watchlist.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      clearFlash();
    }
  }

  async function saveCurrentSearch() {
    const name = searchName.trim() || `Search ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    try {
      const created = await api('/api/searches', {
        method: 'POST',
        body: { name, filters, alertOn: true },
      });
      setSavedSearches((prev) => [created, ...prev]);
      setSearchName('');
      setMessage('Saved search created.');
    } catch (err) {
      setError(err.message);
    } finally {
      clearFlash();
    }
  }

  async function deleteSavedSearch(id) {
    try {
      await api(`/api/searches/${id}`, { method: 'DELETE' });
      setSavedSearches((prev) => prev.filter((item) => item.id !== id));
      setMessage('Saved search deleted.');
    } catch (err) {
      setError(err.message);
    } finally {
      clearFlash();
    }
  }

  async function createPastPerformance() {
    try {
      const created = await api('/api/performance', {
        method: 'POST',
        body: perfForm,
      });
      setPastPerformance((prev) => [created, ...prev]);
      setPerfForm(initialPerfForm);
      setMessage('Past performance added.');
    } catch (err) {
      setError(err.message);
    } finally {
      clearFlash();
    }
  }

  async function deletePerformance(id) {
    try {
      await api(`/api/performance/${id}`, { method: 'DELETE' });
      setPastPerformance((prev) => prev.filter((item) => item.id !== id));
      setMessage('Past performance removed.');
    } catch (err) {
      setError(err.message);
    } finally {
      clearFlash();
    }
  }

  async function updateDigest(next) {
    try {
      const updated = await api('/api/digest/settings', {
        method: 'PATCH',
        body: next,
      });
      setDigestSettings(updated);
      setMessage('Digest settings updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      clearFlash();
    }
  }

  async function sendTestDigest() {
    try {
      const result = await api('/api/digest/test', { method: 'POST' });
      setMessage(`Test digest sent with ${result.count} opportunities.`);
    } catch (err) {
      setError(err.message);
    } finally {
      clearFlash();
    }
  }

  async function runAnalysis(opportunity) {
    try {
      const result = await api('/api/ai/analyze', {
        method: 'POST',
        body: {
          opportunity: {
            noticeId: opportunity.noticeId,
            title: opportunity.title,
            agency: opportunity.agency,
            naicsCode: opportunity.naicsCode,
            setAside: opportunity.setAsideDescription,
            type: typeLabel(opportunity.opportunityType),
            postedDate: opportunity.postedDate,
            responseDeadline: opportunity.responseDeadline,
            description: opportunity.description,
            intel: opportunity.intel,
          },
          profile: {
            companyName: user?.companyName,
            naics: user?.naicsCode,
            naicsLabel: NAICS_OPTIONS.find((option) => option.code === user?.naicsCode)?.label,
            setAside: user?.setAside,
            agency: user?.targetAgency,
            pastPerfCount: pastPerformance.length,
            pastPerfWins: pastPerformance.filter((item) => item.outcome === 'Won').length,
          },
        },
      });

      setAnalysisByNotice((prev) => ({ ...prev, [opportunity.noticeId]: result }));
      setMessage('AI analysis completed.');
    } catch (err) {
      if (err.status === 429) { setAiLimitReached(true); return; }
      setError(err.message);
      if (err.status === 403) navigate('pricing');
    } finally {
      clearFlash();
    }
  }

  async function summarizeContract() {
    if (!selectedOpportunity?.description) return;
    setSummarizeBusy(true);
    try {
      const result = await api('/api/ai/summarize', {
        method: 'POST',
        body: {
          noticeId: selectedOpportunity.noticeId,
          title: selectedOpportunity.title,
          agency: selectedOpportunity.agency,
          description: selectedOpportunity.description,
        },
      });
      setSummaryByNotice((prev) => ({ ...prev, [selectedOpportunity.noticeId]: result.summary }));
    } catch (err) {
      if (err.status === 429) { setAiLimitReached(true); return; }
      setError(err.message);
      if (err.status === 403) navigate('pricing');
    } finally {
      setSummarizeBusy(false);
      clearFlash();
    }
  }
    if (!selectedOpportunity) {
      setError('Select an opportunity first.');
      clearFlash();
      return;
    }

    try {
      const result = await api('/api/ai/proposal', {
        method: 'POST',
        body: {
          docType: proposalType,
          opportunity: {
            noticeId: selectedOpportunity.noticeId,
            title: selectedOpportunity.title,
            agency: selectedOpportunity.agency,
            naicsCode: selectedOpportunity.naicsCode,
            setAside: selectedOpportunity.setAsideDescription,
            deadline: selectedOpportunity.responseDeadline,
            description: selectedOpportunity.description,
          },
          profile: {
            companyName: user?.companyName,
            naics: user?.naicsCode,
            naicsLabel: NAICS_OPTIONS.find((option) => option.code === user?.naicsCode)?.label,
            setAside: user?.setAside,
            agency: user?.targetAgency,
          },
          pastPerf: pastPerformance.map((item) => ({
            title: item.title,
            agency: item.agency,
            value: item.contractValue,
            year: item.year,
            outcome: item.outcome,
          })),
        },
      });

      setProposalOutput(result.output || '');
      setProposalDocument(result.output || '');
      setProposalScore(null);
      setMessage('Proposal content generated.');
    } catch (err) {
      if (err.status === 429) { setAiLimitReached(true); return; }
      setError(err.message);
      if (err.status === 403) navigate('pricing');
    } finally {
      clearFlash();
    }
  }

  async function scoreProposalDocument() {
    if (!proposalDocument.trim() || !selectedOpportunity) {
      setError('Generate or paste proposal content first.');
      clearFlash();
      return;
    }

    try {
      const result = await api('/api/ai/score', {
        method: 'POST',
        body: {
          docType: proposalType,
          docTypeLabel: proposalType,
          document: proposalDocument,
          opportunity: {
            title: selectedOpportunity.title,
            agency: selectedOpportunity.agency,
            naicsCode: selectedOpportunity.naicsCode,
            setAside: selectedOpportunity.setAsideDescription,
            description: selectedOpportunity.description,
          },
        },
      });

      setProposalScore(result);
      setMessage('Proposal scored.');
    } catch (err) {
      if (err.status === 429) { setAiLimitReached(true); return; }
      setError(err.message);
      if (err.status === 403) navigate('pricing');
    } finally {
      clearFlash();
    }
  }

  async function extractPastPerformance(file) {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowed.includes(file.type)) {
      setError('Please drop a PDF or Word document.');
      clearFlash();
      return;
    }

    setPerfExtracting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await api('/api/ai/extract-performance', {
        method: 'POST',
        body: formData,
        raw: true,
      });

      // Auto-fill the form with extracted fields
      setPerfForm((prev) => ({
        ...prev,
        title: result.title || prev.title,
        agency: result.agency || prev.agency,
        contractValue: result.contractValue || prev.contractValue,
        year: result.year || prev.year,
        outcome: result.outcome || prev.outcome,
        naicsCode: result.naicsCode || prev.naicsCode,
        description: result.description || prev.description,
      }));

      // Update local user state if profile fields were auto-filled on backend
      if (result.capabilityProfile) {
        setUser((prev) => ({
          ...prev,
          ...(result.naicsCode && !prev.naicsCode ? { naicsCode: result.naicsCode } : {}),
          ...(result.agency && !prev.targetAgency ? { targetAgency: result.agency } : {}),
        }));
      }

      const docsCount = result.capabilityProfile?.docsAnalyzed || 1;
      setMessage(`Profile updated from ${docsCount} document${docsCount === 1 ? '' : 's'} -- opportunity scoring is now personalized. Review the fields below and click Add record.`);
    } catch (err) {
      setError(err.message || 'Failed to extract document. Try filling in manually.');
    } finally {
      setPerfExtracting(false);
      clearFlash();
    }
  }

  async function analyzeDroppedProposal(file) {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowed.includes(file.type)) {
      setError('Please drop a PDF or Word document.');
      clearFlash();
      return;
    }
    if (!selectedOpportunity) {
      setError('Select an opportunity first so the AI can compare against it.');
      clearFlash();
      return;
    }

    setProposalDropping(true);
    setProposalScore(null);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Extract text from the document
      const extracted = await api('/api/ai/extract-text', {
        method: 'POST',
        body: formData,
        raw: true,
      });

      const docText = extracted.text || '';
      setProposalDocument(docText);

      // Immediately score it against the selected opportunity
      const result = await api('/api/ai/score', {
        method: 'POST',
        body: {
          docType: proposalType,
          docTypeLabel: proposalType,
          document: docText,
          opportunity: {
            title: selectedOpportunity.title,
            agency: selectedOpportunity.agency,
            naicsCode: selectedOpportunity.naicsCode,
            setAside: selectedOpportunity.setAsideDescription,
            description: selectedOpportunity.description,
          },
        },
      });

      setProposalScore(result);
      setMessage('Document analyzed and scored. Review feedback on the right.');
    } catch (err) {
      if (err.status === 429) { setAiLimitReached(true); return; }
      setError(err.message || 'Failed to analyze document.');
      if (err.status === 403) navigate('pricing');
    } finally {
      setProposalDropping(false);
      clearFlash();
    }
  }

  async function startCheckout(plan) {
    try {
      const result = await api('/api/stripe/checkout', { method: 'POST', body: { plan } });
      if (result.url) window.location.href = result.url;
    } catch (err) {
      setError(err.message);
      clearFlash();
    }
  }

  async function openBillingPortal() {
    try {
      const result = await api('/api/stripe/portal', { method: 'POST' });
      if (result.url) window.location.href = result.url;
    } catch (err) {
      setError(err.message);
      clearFlash();
    }
  }

  function signOut() {
    tokenStore.clear();
    setToken(null);
    setUser(null);

    setOpportunities([]);
    setWatchlist([]);
    setSavedSearches([]);
    setPastPerformance([]);
    setSelectedOpportunity(null);

    setView('home');
    window.history.replaceState({}, '', '/');
  }

  const isPublicView = PUBLIC_VIEWS.has(view);

  if ((!token || !user) && view === 'auth') {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        onAuth={handleAuth}
        resetToken={resetToken}
        onResetPassword={handleResetPassword}
        authBusy={busy}
        verificationSent={verificationSent}
        setVerificationSent={setVerificationSent}
        verificationEmail={verificationEmail}
      />
    );
  }

  if ((!token || !user) && view === 'home') {
    return <HomeView navigate={navigate} user={user} setAuthMode={setAuthMode} />;
  }

  if ((!token || !user) && view === 'about') {
    return <AboutPage />;
  }

  if ((!token || !user) && !isPublicView) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        onAuth={handleAuth}
        resetToken={resetToken}
        onResetPassword={handleResetPassword}
        authBusy={busy}
        verificationSent={verificationSent}
        setVerificationSent={setVerificationSent}
        verificationEmail={verificationEmail}
      />
    );
  }

  if (view === 'home') {
    return <HomeView navigate={navigate} user={user} setAuthMode={setAuthMode} />;
  }

  if (view === 'about') {
    return <AboutPage />;
  }

  // Show onboarding wizard for new users who haven't set up their profile yet
  if (token && user && !user.naicsCode) {
    return (
      <OnboardingWizard
        user={user}
        onComplete={completeOnboarding}
        busy={busy}
      />
    );
  }

  return (
    <div className="app-shell">

      {/* AI Usage Limit Modal */}
      {aiLimitReached && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚡</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Monthly AI limit reached</h2>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>
              You've used all 50 AI analyses included in your Pro plan this month.
              Upgrade to Agency for unlimited analyses, plus competitor intel and more.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="primary-btn"
                onClick={() => { setAiLimitReached(false); navigate('pricing'); }}
              >
                Upgrade to Agency
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setAiLimitReached(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className={`sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div>
          <div className="brand-mark">Helix<span style={{color:'#2563EB'}}>Gov</span></div>
          <p className="tiny muted">Federal contract intelligence, built for teams that win</p>
        </div>

        <nav className="nav-stack">
          {NAV_ITEMS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`nav-btn ${view === key ? 'active' : ''}`}
              onClick={() => navigate(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer card inset-card">
          <div className="muted tiny">Signed in as</div>
          <strong>{user.email}</strong>
          <div className="row spread align-center top-gap-sm">
            <Badge tone={user.plan === 'FREE' ? 'default' : 'success'}>
              {user.plan}
            </Badge>
            <button type="button" className="text-btn" onClick={signOut}>
              Sign out
            </button>
          </div>
          {user.plan === 'FREE' ? (
            <button
              type="button"
              className="primary-btn"
              style={{ marginTop: '0.75rem', width: '100%' }}
              onClick={() => navigate('pricing')}
            >
              Start free trial
            </button>
          ) : null}
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar card">
          <div className="row align-center">
            <button
              type="button"
              className="ghost-btn mobile-only"
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              Menu
            </button>

            <div>
              <h1>{VIEW_LABELS[view] || 'Dashboard'}</h1>
              <p className="muted">Your AI-powered GovCon command center.</p>
            </div>
          </div>

          <div className="row wrap">
            <Badge>{user.companyName || 'No company profile yet'}</Badge>
            <Badge>
              {NAICS_OPTIONS.find((item) => item.code === user.naicsCode)?.label || 'No NAICS selected'}
            </Badge>
          </div>
        </header>

        {message ? <div className="flash success">{message}</div> : null}
        {error ? <div className="flash error">{error}</div> : null}

        {view === 'dashboard' && (
          <section className="page-grid">
            <div className="stats-grid">
              <StatCard label="High-fit opportunities" value={dashboardStats.highFit} hint="Score 80+" />
              <StatCard label="Deadlines this week" value={dashboardStats.deadlines} />
              <StatCard label="Saved opportunities" value={dashboardStats.saved} />
              <StatCard label="Saved searches" value={dashboardStats.searches} />
            </div>

            <div className="split-layout">
              <div className="card">
                <div className="row spread align-center">
                  <h2>Best current fits</h2>
                  <button type="button" className="text-btn" onClick={() => navigate('opportunities')}>
                    See all
                  </button>
                </div>

                <div className="list-stack">
                  {opportunities.slice(0, 5).map((item) => (
                    <OpportunityCard
                      key={item.noticeId}
                      opportunity={item}
                      onSelect={(opp) => {
                        setSelectedOpportunity(opp);
                        navigate('opportunities');
                      }}
                      onToggleSave={toggleWatchlist}
                      saved={savedNoticeIds.has(item.noticeId)}
                    />
                  ))}
                </div>
              </div>

              <div className="card">
                <h2>Pipeline summary</h2>
                <div className="list-stack compact">
                  {normalizedWatchlist.slice(0, 6).map((item) => (
                    <div key={item.noticeId} className="line-item">
                      <div>
                        <strong>{item.title}</strong>
                        <div className="tiny muted">{item.agency || 'Unknown agency'}</div>
                      </div>
                      <div className="text-right">
                        <ScorePill score={item.score || 0} />
                        <div className="tiny muted">{formatDate(item.responseDeadline)}</div>
                      </div>
                    </div>
                  ))}
                  {!normalizedWatchlist.length ? (
                    <div className="empty-state">No opportunities saved yet. Find a good fit in Opportunities and hit Save to start your pipeline.</div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'opportunities' && (
          <section className="page-grid">
            <div className="card filter-card">
              <div className="filter-grid">
                <Field label="Keyword">
                  <input
                    value={filters.keyword}
                    onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                    placeholder="cybersecurity, staffing, cloud"
                  />
                </Field>

                <Field label="NAICS">
                  <select
                    value={filters.naicsCode}
                    onChange={(e) => setFilters((prev) => ({ ...prev, naicsCode: e.target.value }))}
                  >
                    <SelectOptions options={NAICS_OPTIONS} includeBlank blankLabel="All NAICS" />
                  </select>
                </Field>

                <Field label="Set-aside">
                  <select
                    value={filters.setAside}
                    onChange={(e) => setFilters((prev) => ({ ...prev, setAside: e.target.value }))}
                  >
                    <SelectOptions options={SET_ASIDE_OPTIONS} includeBlank blankLabel="All set-asides" />
                  </select>
                </Field>

                <Field label="Agency">
                  <select
                    value={filters.agency}
                    onChange={(e) => setFilters((prev) => ({ ...prev, agency: e.target.value }))}
                  >
                    <SelectOptions options={AGENCY_OPTIONS} includeBlank blankLabel="All agencies" />
                  </select>
                </Field>

                <Field label="Type">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <SelectOptions options={TYPE_OPTIONS} />
                  </select>
                </Field>

                <Field label="Min value">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.9rem', pointerEvents: 'none' }}>$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={filters.minValue ? Number(filters.minValue).toLocaleString() : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setFilters((prev) => ({ ...prev, minValue: raw ? Number(raw) : '' }));
                      }}
                      placeholder="50,000"
                      style={{ paddingLeft: '1.5rem' }}
                    />
                  </div>
                </Field>

                <Field label="Max value">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.9rem', pointerEvents: 'none' }}>$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={filters.maxValue ? Number(filters.maxValue).toLocaleString() : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setFilters((prev) => ({ ...prev, maxValue: raw ? Number(raw) : '' }));
                      }}
                      placeholder="500,000"
                      style={{ paddingLeft: '1.5rem' }}
                    />
                  </div>
                </Field>

                <Field label="Days back">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={filters.daysBack}
                    onChange={(e) => setFilters((prev) => ({ ...prev, daysBack: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="row spread wrap top-gap-sm">
                <div className="row wrap">
                  <input
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Name (optional)"
                    style={{ width: '160px' }}
                  />
                  <button type="button" className="ghost-btn" onClick={saveCurrentSearch}>
                    Save search
                  </button>
                </div>

                <button type="button" className="ghost-btn" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Reset filters
                </button>
              </div>
            </div>

            <div className="split-layout wide">
              <div className="list-stack">
                {opportunities.map((item) => (
                  <OpportunityCard
                    key={item.noticeId}
                    opportunity={item}
                    onSelect={setSelectedOpportunity}
                    onToggleSave={toggleWatchlist}
                    saved={savedNoticeIds.has(item.noticeId)}
                  />
                ))}
                {!opportunities.length ? (
                  <div className="card empty-state">No opportunities matched your filters. Try broadening your NAICS code, removing the set-aside filter, or increasing the days back range.</div>
                ) : null}
              </div>

              <OpportunityDetail
                opportunity={selectedOpportunity}
                saved={savedNoticeIds.has(selectedOpportunity?.noticeId)}
                onToggleSave={toggleWatchlist}
                onAnalyze={runAnalysis}
                aiAnalysis={currentAnalysis}
                onSummarize={summarizeContract}
                contractSummary={summaryByNotice[selectedOpportunity?.noticeId]}
                summarizeBusy={summarizeBusy}
              />
            </div>
          </section>
        )}

        {view === 'watchlist' && (
          <section className="page-grid">
            <div className="card">
              <h2>Watchlist</h2>
              <div className="list-stack">
                {normalizedWatchlist.map((item) => (
                  <div className="card compact-card" key={item.noticeId}>
                    <div className="row spread align-start wrap">
                      <div>
                        <div className="row top-gap-sm">
                          <ScorePill score={item.score || 0} />
                          <Badge>{item.recommendation}</Badge>
                        </div>
                        <h3>{item.title}</h3>
                        <p className="muted">
                          {item.agency || 'Unknown agency'} * {formatDate(item.responseDeadline)}
                        </p>
                        {item.watchlistNotes ? <p>{item.watchlistNotes}</p> : null}
                      </div>

                      <div className="row wrap">
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => {
                            setSelectedOpportunity(item);
                            navigate('proposal');
                          }}
                        >
                          Use in proposal lab
                        </button>
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => toggleWatchlist(item)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!normalizedWatchlist.length ? (
                  <div className="empty-state">You have not saved any opportunities yet.</div>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {view === 'searches' && (
          <section className="page-grid">
            <div className="card">
              <h2>Saved searches</h2>
              <div className="list-stack">
                {savedSearches.map((item) => (
                  <div className="line-item" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <div className="tiny muted">
                        Created {formatDate(item.createdAt)} * Alerts {item.alertOn ? 'on' : 'off'}
                      </div>
                      <div className="tiny muted">
                        {Object.entries(item.filters || {})
                          .filter(([, value]) => value)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' * ') || 'No filters saved'}
                      </div>
                    </div>

                    <div className="row wrap">
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => {
                          setFilters({ ...DEFAULT_FILTERS, ...(item.filters || {}) });
                          navigate('opportunities');
                        }}
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => deleteSavedSearch(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {!savedSearches.length ? (
                  <div className="empty-state">
                    Save your best filter combinations from the Opportunities page.
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {view === 'performance' && (
          <section className="page-grid">
            <div className="split-layout">
              <div className="card">
                <h2>Add past performance</h2>

                {/* AI Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setPerfDragOver(true); }}
                  onDragLeave={() => setPerfDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setPerfDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) extractPastPerformance(file);
                  }}
                  style={{
                    border: `2px dashed ${perfDragOver ? '#16a34a' : '#86efac'}`,
                    borderRadius: '0.5rem',
                    padding: '1.25rem',
                    textAlign: 'center',
                    marginBottom: '1.25rem',
                    background: perfDragOver ? '#dcfce7' : '#f0fdf4',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf,.doc,.docx';
                    input.onchange = (e) => { if (e.target.files[0]) extractPastPerformance(e.target.files[0]); };
                    input.click();
                  }}
                >
                  {perfExtracting ? (
                    <p className="muted" style={{ margin: 0 }}> Analyzing document and building your capability profile...</p>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>
                        Drop a contract or award document here
                      </p>
                      <p className="muted tiny" style={{ margin: '0.25rem 0 0' }}>
                        PDF or Word -- AI builds your capability profile to improve opportunity scoring, and auto-fills the form below
                      </p>
                    </>
                  )}
                </div>

                <div className="form-grid two-column">
                  <Field label="Project title">
                    <input
                      value={perfForm.title}
                      onChange={(e) => setPerfForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </Field>

                  <Field label="Agency">
                    <input
                      value={perfForm.agency}
                      onChange={(e) => setPerfForm((prev) => ({ ...prev, agency: e.target.value }))}
                    />
                  </Field>

                  <Field label="Contract value">
                    <input
                      value={perfForm.contractValue}
                      onChange={(e) => setPerfForm((prev) => ({ ...prev, contractValue: e.target.value }))}
                    />
                  </Field>

                  <Field label="Year">
                    <input
                      value={perfForm.year}
                      onChange={(e) => setPerfForm((prev) => ({ ...prev, year: e.target.value }))}
                    />
                  </Field>

                  <Field label="Outcome">
                    <select
                      value={perfForm.outcome}
                      onChange={(e) => setPerfForm((prev) => ({ ...prev, outcome: e.target.value }))}
                    >
                      {['Won', 'Lost', 'Ongoing', 'Completed'].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="NAICS">
                    <input
                      value={perfForm.naicsCode}
                      onChange={(e) => setPerfForm((prev) => ({ ...prev, naicsCode: e.target.value }))}
                    />
                  </Field>

                  <Field label="Description">
                    <textarea
                      value={perfForm.description}
                      onChange={(e) => setPerfForm((prev) => ({ ...prev, description: e.target.value }))}
                      rows="5"
                    />
                  </Field>
                </div>

                <button type="button" className="primary-btn" onClick={createPastPerformance}>
                  Add record
                </button>
              </div>

              <div className="card">
                <h2>Your past performance</h2>
                <div className="list-stack compact">
                  {pastPerformance.map((item) => (
                    <div className="line-item" key={item.id}>
                      <div>
                        <strong>{item.title}</strong>
                        <div className="tiny muted">
                          {item.agency || 'Unknown agency'} * {item.year || 'Unknown year'} * {item.outcome}
                        </div>
                        <div className="tiny muted">
                          {item.contractValue ? formatMoney(item.contractValue) : 'No contract value listed'}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => deletePerformance(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {!pastPerformance.length ? (
                    <div className="empty-state">
                      Add a few wins or relevant contracts so the AI can use them in proposal generation.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'proposal' && (
          <section className="page-grid">
            <div className="split-layout">
              <div className="card">
                <h2>Proposal Lab</h2>

                <Field label="Selected opportunity">
                  <select
                    value={selectedOpportunity?.noticeId || ''}
                    onChange={(e) =>
                      setSelectedOpportunity(
                        opportunities.find((item) => item.noticeId === e.target.value) ||
                        normalizedWatchlist.find((item) => item.noticeId === e.target.value) ||
                        null
                      )
                    }
                  >
                    <option value="">Choose an opportunity</option>
                    {[
                      ...opportunities,
                      ...normalizedWatchlist.filter(
                        (watch) => !opportunities.some((opp) => opp.noticeId === watch.noticeId)
                      ),
                    ].map((item) => (
                      <option key={item.noticeId} value={item.noticeId}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Document type">
                  <select value={proposalType} onChange={(e) => setProposalType(e.target.value)}>
                    <option value="capability">Capability Statement</option>
                    <option value="executive">Executive Summary</option>
                    <option value="technical">Technical Approach</option>
                    <option value="questions">Questions for the contracting officer</option>
                  </select>
                </Field>

                <div className="row wrap">
                  <button type="button" className="primary-btn" onClick={generateProposal}>
                    Generate draft
                  </button>
                  <button type="button" className="ghost-btn" onClick={scoreProposalDocument}>
                    Score document
                  </button>
                </div>

                <Field label="Generated or edited content">
                  {/* Drop zone -- replaces textarea when empty, shows textarea once content is loaded */}
                  {!proposalDocument ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setProposalDragOver(true); }}
                      onDragLeave={() => setProposalDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setProposalDragOver(false);
                        const file = e.dataTransfer.files[0];
                        if (file) analyzeDroppedProposal(file);
                      }}
                      style={{
                        border: `2px dashed ${proposalDragOver ? '#16a34a' : '#86efac'}`,
                        borderRadius: '0.5rem',
                        padding: '2.5rem 1.5rem',
                        textAlign: 'center',
                        background: proposalDragOver ? '#dcfce7' : '#f0fdf4',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.doc,.docx';
                        input.onchange = (e) => { if (e.target.files[0]) analyzeDroppedProposal(e.target.files[0]); };
                        input.click();
                      }}
                    >
                      {proposalDropping ? (
                        <p className="muted" style={{ margin: 0 }}> Analyzing your document...</p>
                      ) : (
                        <>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                            Drop an existing proposal here to analyze it
                          </p>
                          <p className="muted tiny" style={{ margin: 0 }}>
                            PDF or Word -- AI will score it and suggest improvements against the selected opportunity
                          </p>
                          <p className="muted tiny" style={{ margin: 0 }}>
                            Or use <strong>Generate draft</strong> above to start from scratch
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <textarea
                        rows="18"
                        value={proposalDocument}
                        onChange={(e) => setProposalDocument(e.target.value)}
                        placeholder="Generated proposal text will appear here."
                      />
                      <button
                        type="button"
                        className="ghost-btn"
                        style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                        onClick={() => { setProposalDocument(''); setProposalScore(null); }}
                      >
                        Clear and drop a new document
                      </button>
                    </div>
                  )}
                </Field>
              </div>

              <div className="card">
                <h2>Proposal feedback</h2>
                {proposalScore ? (
                  <div className="analysis-box">
                    <div className="row top-gap-sm wrap">
                      <Badge
                        tone={
                          proposalScore.overall_score >= 85
                            ? 'success'
                            : proposalScore.overall_score >= 70
                              ? 'warning'
                              : 'danger'
                        }
                      >
                        {proposalScore.grade}
                      </Badge>
                      <Badge>{proposalScore.overall_score}/100</Badge>
                    </div>

                    <p>{proposalScore.summary}</p>

                    <h4>Critical fixes</h4>
                    <ul>{(proposalScore.critical_fixes || []).map((item) => <li key={item}>{item}</li>)}</ul>

                    <h4>Strengths</h4>
                    <ul>{(proposalScore.strengths || []).map((item) => <li key={item}>{item}</li>)}</ul>

                    <h4>Scoring dimensions</h4>
                    <div className="list-stack compact">
                      {(proposalScore.dimensions || []).map((dimension) => (
                        <div className="card inset-card" key={dimension.name}>
                          <div className="row spread">
                            <strong>{dimension.name}</strong>
                            <span>{dimension.score}/100</span>
                          </div>
                          <p className="tiny muted">{dimension.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    Generate or paste a proposal draft, then run the scorer for structured feedback.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {view === 'settings' && (
          <section className="page-grid">
            <div className="split-layout">
              <div className="card">
                <h2>Company profile</h2>
                <div className="form-grid two-column">
                  <Field label="Your name">
                    <input
                      value={profileDraft.name || ''}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </Field>

                  <Field label="Company name">
                    <input
                      value={profileDraft.companyName || ''}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, companyName: e.target.value }))}
                    />
                  </Field>

                  <Field label="Primary NAICS">
                    <select
                      value={profileDraft.naicsCode || ''}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, naicsCode: e.target.value }))}
                    >
                      <SelectOptions options={NAICS_OPTIONS} includeBlank blankLabel="Select NAICS" />
                    </select>
                  </Field>

                  <Field label="Set-aside">
                    <select
                      value={profileDraft.setAside || ''}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, setAside: e.target.value }))}
                    >
                      <SelectOptions options={SET_ASIDE_OPTIONS} includeBlank blankLabel="Select set-aside" />
                    </select>
                  </Field>

                  <Field label="Target agency">
                    <select
                      value={profileDraft.targetAgency || ''}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, targetAgency: e.target.value }))}
                    >
                      <SelectOptions options={AGENCY_OPTIONS} includeBlank blankLabel="Select agency" />
                    </select>
                  </Field>

                  <Field label="SAM.gov API key (Optional)">
                    <input
                      value={profileDraft.samApiKey || ''}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, samApiKey: e.target.value }))}
                    />
                  </Field>
                </div>

                <button type="button" className="primary-btn" onClick={saveProfile} disabled={busy}>
                  Save profile
                </button>
              </div>

              <div className="card">
                <h2>Email digest</h2>
                <div className="form-grid">
                  <Field label="Enable digest">
                    <select
                      value={String(digestSettings.enabled)}
                      onChange={(e) =>
                        setDigestSettings((prev) => ({ ...prev, enabled: e.target.value === 'true' }))
                      }
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </Field>

                  <Field label="Frequency">
                    <select
                      value={digestSettings.frequency}
                      onChange={(e) => setDigestSettings((prev) => ({ ...prev, frequency: e.target.value }))}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </Field>

                  <Field label="Send time">
                    <input
                      value={digestSettings.sendTime}
                      onChange={(e) => setDigestSettings((prev) => ({ ...prev, sendTime: e.target.value }))}
                    />
                  </Field>

                  <Field label="Minimum score">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={digestSettings.minScore}
                      onChange={(e) =>
                        setDigestSettings((prev) => ({ ...prev, minScore: Number(e.target.value) }))
                      }
                    />
                  </Field>
                </div>

                <div className="row wrap">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => updateDigest(digestSettings)}
                  >
                    Save digest settings
                  </button>
                  <button type="button" className="ghost-btn" onClick={sendTestDigest}>
                    Send test digest
                  </button>
                  {user.plan !== 'FREE' ? (
                    <button type="button" className="ghost-btn" onClick={openBillingPortal}>
                      Open billing portal
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'pricing' && (
          <section className="page-grid">
            <div>
              <h2 style={{ marginBottom: '0.25rem' }}>Choose your plan</h2>
              <p className="muted">14-day free trial on all plans. No credit card required to start.</p>
            </div>

            <div className="pricing-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {PLAN_CARDS.map((plan) => {
                const isPro = plan.code === 'PRO';
                const isCurrent = user.plan === plan.code;
                return (
                  <div key={plan.code} className="card" style={{
                    position: 'relative',
                    border: isPro ? '2px solid var(--blue)' : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    {isPro && (
                      <div style={{
                        position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--blue)', color: 'white', fontSize: '0.65rem', fontWeight: 700,
                        padding: '3px 14px', borderRadius: '999px', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                      }}>MOST POPULAR</div>
                    )}

                    <div className="muted tiny" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
                      {isPro ? 'For growing BD teams' : 'For contractors scaling up'}
                    </div>
                    <h2>{plan.name}</h2>
                    <div className="price">{plan.price}</div>
                    <p className="muted tiny" style={{ marginBottom: '1.25rem' }}>14-day free trial included</p>

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => startCheckout(plan.code)}
                      disabled={isCurrent}
                      style={{ width: '100%', marginBottom: '1.5rem' }}
                    >
                      {isCurrent ? 'Current plan' : 'Start free trial'}
                    </button>

                    <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1.1rem', flex: 1 }}>
                      <p className="tiny muted" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                        What's included
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {plan.features.map((feature) => (
                          <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: '#374151' }}>
                            <span style={{ color: isPro ? 'var(--blue)' : 'var(--green)', fontWeight: 700, flexShrink: 0 }}>+</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="muted tiny" style={{ textAlign: 'center' }}>
              Cancel anytime. No contracts. All AI features unlocked during your trial.
            </p>

            {user.plan !== 'FREE' && (
              <div style={{ textAlign: 'center' }}>
                <button type="button" className="ghost-btn" onClick={openBillingPortal}>
                  Manage subscription
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}