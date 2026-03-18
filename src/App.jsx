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
  getDaysLeft,
  normalizeOpportunity,
  recommendationLabel,
  scoreTone,
  typeLabel,
} from './utils/format';
import './index.css';
import AboutPage from './pages/AboutPage';

const NAV_ITEMS = [
  ['dashboard', 'Dashboard'],
  ['opportunities', 'Opportunities'],
  ['watchlist', 'Watchlist'],
  ['searches', 'Saved Searches'],
  ['performance', 'Past Performance'],
  ['proposal', 'Proposal Lab'],
  ['about', 'About'],
  ['settings', 'Settings'],
  ['pricing', 'Pricing'],
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

const initialAuth = { email: '', password: '', name: '' };
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
  return <span className={`badge ${tone}`}>{children}</span>;
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

  return (
    <button className="card opportunity-card" onClick={() => onSelect(opportunity)} type="button">
      <div className="row spread top-gap-sm">
        <div>
          <div className="row top-gap-sm">
            <ScorePill score={opportunity.score} />
            <Badge
              tone={
                recommendationLabel(opportunity.score) === 'Pursue'
                  ? 'success'
                  : recommendationLabel(opportunity.score) === 'Consider'
                    ? 'warning'
                    : 'danger'
              }
            >
              {opportunity.recommendation}
            </Badge>
          </div>

          <h3>{opportunity.title}</h3>
          <p className="muted">
            {opportunity.agency || 'Unknown agency'}
            {opportunity.subAgency ? ` • ${opportunity.subAgency}` : ''}
          </p>
        </div>

        <button
          type="button"
          className={`ghost-btn ${saved ? 'active' : ''}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleSave(opportunity);
          }}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="opportunity-meta">
        <span>{typeLabel(opportunity.opportunityType)}</span>
        <span>{opportunity.naicsCode || 'No NAICS'}</span>
        <span>{opportunity.setAsideDescription || 'No set-aside listed'}</span>
      </div>

      <div className="reason-list">
        {(opportunity.reasons || []).slice(0, 3).map((reason) => (
          <Badge key={reason}>{reason}</Badge>
        ))}
      </div>

      <div className="row spread muted tiny">
        <span>Posted {formatDate(opportunity.postedDate)}</span>
        <span>
          {daysLeft === null
            ? 'No deadline'
            : daysLeft < 0
              ? 'Closed'
              : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
        </span>
      </div>
    </button>
  );
}

function OpportunityDetail({ opportunity, saved, onToggleSave, onAnalyze, aiAnalysis }) {
  if (!opportunity) {
    return <div className="card empty-state">Select an opportunity to review fit, risk, and next steps.</div>;
  }

  const intel = opportunity.intel || {};

  return (
    <div className="detail-panel">
      <div className="card">
        <div className="row spread align-start">
          <div>
            <div className="row top-gap-sm">
              <ScorePill score={opportunity.score} />
              <Badge
                tone={
                  recommendationLabel(opportunity.score) === 'Pursue'
                    ? 'success'
                    : recommendationLabel(opportunity.score) === 'Consider'
                      ? 'warning'
                      : 'danger'
                }
              >
                {opportunity.recommendation}
              </Badge>
            </div>

            <h2>{opportunity.title}</h2>
            <p className="muted">
              {opportunity.agency || 'Unknown agency'}
              {opportunity.subAgency ? ` • ${opportunity.subAgency}` : ''}
            </p>
          </div>

          <button
            type="button"
            className={`primary-btn ${saved ? 'secondary' : ''}`}
            onClick={() => onToggleSave(opportunity)}
          >
            {saved ? 'Remove from watchlist' : 'Save to watchlist'}
          </button>
        </div>

        <div className="detail-grid">
          <div><strong>Notice ID</strong><span>{opportunity.noticeId}</span></div>
          <div><strong>Type</strong><span>{typeLabel(opportunity.opportunityType)}</span></div>
          <div><strong>NAICS</strong><span>{opportunity.naicsCode || '—'}</span></div>
          <div><strong>Set-aside</strong><span>{opportunity.setAsideDescription || 'None listed'}</span></div>
          <div><strong>Posted</strong><span>{formatDate(opportunity.postedDate)}</span></div>
          <div><strong>Deadline</strong><span>{formatDateTime(opportunity.responseDeadline)}</span></div>
        </div>

        <div className="intel-grid">
          <div className="card inset-card">
            <div className="muted tiny">Estimated value</div>
            <strong>{intel.estimatedValue ? formatMoney(intel.estimatedValue) : 'Unknown'}</strong>
            <small>{intel.valueConfidence || 'low'} confidence</small>
          </div>

          <div className="card inset-card">
            <div className="muted tiny">Complexity</div>
            <strong>{intel.complexityLevel || 'Unknown'}</strong>
            <small>{(intel.complexityFlags || []).join(', ') || 'No major complexity flags found'}</small>
          </div>

          <div className="card inset-card">
            <div className="muted tiny">Incumbent risk</div>
            <strong>{intel.incumbentRisk || 'Unknown'}</strong>
            <small>{(intel.incumbentSignals || []).join(', ') || 'No strong incumbent signals detected'}</small>
          </div>

          <div className="card inset-card">
            <div className="muted tiny">New firm suitability</div>
            <strong>{intel.newFirmSuitability || 'Unknown'}</strong>
            <small>{intel.clearanceRequired ? `Clearance: ${intel.clearanceRequired}` : 'No clearance signal detected'}</small>
          </div>
        </div>

        <div className="section-block">
          <div className="row spread align-center">
            <h3>Bid analysis</h3>
            <button type="button" className="primary-btn" onClick={() => onAnalyze(opportunity)}>
              Run AI analysis
            </button>
          </div>

          {aiAnalysis ? (
            <div className="analysis-box">
              <div className="row top-gap-sm wrap">
                <Badge
                  tone={
                    aiAnalysis.verdict === 'Strong Fit'
                      ? 'success'
                      : aiAnalysis.verdict === 'Potential Fit'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {aiAnalysis.verdict}
                </Badge>
                <Badge>{aiAnalysis.win_probability}% win probability</Badge>
              </div>

              <p>{aiAnalysis.verdict_reason}</p>

              <div className="split-two">
                <div>
                  <h4>Strengths</h4>
                  <ul>{(aiAnalysis.strengths || []).map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h4>Risks</h4>
                  <ul>{(aiAnalysis.risks || []).map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>

              <h4>Next steps</h4>
              <ul>{(aiAnalysis.next_steps || []).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ) : (
            <p className="muted">
              Use AI analysis to turn this notice into a quick bid/no-bid recommendation for a small contractor.
            </p>
          )}
        </div>

        <div className="section-block">
          <h3>Summary</h3>
          <p className="description">{opportunity.description || 'No description available for this opportunity.'}</p>
          {opportunity.uiLink ? (
            <a href={opportunity.uiLink} target="_blank" rel="noreferrer" className="text-link">
              Open original SAM.gov notice
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ mode, setMode, authForm, setAuthForm, onAuth, resetToken, onResetPassword, authBusy }) {
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <div className="brand-mark">GovSignal</div>
        <h1>Federal contract intelligence made easier to act on</h1>
        <p className="muted">Built for small government contractors who need a clearer bid/no-bid workflow.</p>

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
              <Field label="Your name">
                <input
                  value={authForm.name}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Jonas"
                />
              </Field>
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
                placeholder="••••••••"
              />
            </Field>

            <button className="primary-btn" type="button" onClick={() => onAuth(mode, authForm)} disabled={authBusy}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
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

function PublicHeader({ navigate, user, setAuthMode }) {
  return (
    <header className="card public-header" style={{ marginBottom: 24 }}>
      <div className="row spread align-center wrap">
        <div>
          <div className="brand-mark">GovSignal</div>
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

function HomeView({ navigate, user, setAuthMode }) {
  const goPrimary = () => {
    if (user) navigate('dashboard');
    else {
      setAuthMode('register');
      navigate('auth');
    }
  };

  return (
    <div className="app-shell public-shell">
      <main className="main-area">
        <PublicHeader navigate={navigate} user={user} setAuthMode={setAuthMode} />

        <section className="card hero-card">
          <div className="hero-layout">
            <div>
              <div className="hero-kicker">Federal Contract Intelligence</div>
              <h1 className="hero-title">Find profitable government contracts in seconds</h1>
              <p className="hero-text">
                GovSignal surfaces high-fit opportunities, simplifies qualification, and helps small contractors move faster with more confidence.
              </p>

              <div className="row wrap hero-actions">
                <button type="button" className="primary-btn" onClick={goPrimary}>
                  {user ? 'Open dashboard' : 'Start free'}
                </button>
                <button type="button" className="ghost-btn" onClick={() => navigate('about')}>
                  See how it works
                </button>
              </div>

              <div className="hero-proof">
                <span className="hero-value-chip">Avg. profit signals</span>
                <span>Built for beginner-friendly resellers</span>
                <span>Fast bid / no-bid workflow</span>
              </div>
            </div>

            <div className="hero-preview">
              <div className="preview-toolbar">
                <div className="preview-dot-group">
                  <span className="preview-dot active" />
                  <span className="preview-dot" />
                  <span className="preview-dot" />
                </div>
                <Badge>Live opportunities</Badge>
              </div>

              <div className="preview-shell">
                <div className="preview-metric-grid">
                  <div className="preview-metric">
                    <div className="tiny muted">Active matches</div>
                    <strong>2,381</strong>
                  </div>
                  <div className="preview-metric">
                    <div className="tiny muted">Avg. profit</div>
                    <strong>34%</strong>
                  </div>
                  <div className="preview-metric">
                    <div className="tiny muted">Easy wins</div>
                    <strong>412</strong>
                  </div>
                </div>

                <div className="preview-opportunity">
                  <div className="preview-row">
                    <div>
                      <strong>Office chairs • VA contract</strong>
                      <div className="tiny muted">Veterans Affairs • Small business set-aside</div>
                    </div>
                    <ScorePill score={92} />
                  </div>

                  <div className="feature-meta">
                    <Badge tone="success">Est. profit $18,400</Badge>
                    <Badge>Low complexity</Badge>
                    <Badge>Reseller fit</Badge>
                  </div>

                  <div className="tiny muted">Source at $72/unit • Gov price $120/unit • 40% margin</div>
                </div>

                <div className="preview-table">
                  <div className="table-row">
                    <div>
                      <strong>Tactical backpacks</strong>
                      <div className="tiny muted">Department of Defense</div>
                    </div>
                    <Badge tone="success">$92k est. profit</Badge>
                  </div>
                  <div className="table-row">
                    <div>
                      <strong>Printer toner and supplies</strong>
                      <div className="tiny muted">U.S. Forest Service</div>
                    </div>
                    <Badge>Easy</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-stats-grid">
          <div className="metric-card">
            <h3>$12.4M+</h3>
            <p className="muted">Contracts identified across high-fit supply categories.</p>
          </div>
          <div className="metric-card">
            <h3>2,300+</h3>
            <p className="muted">Active opportunities filtered for small contractor relevance.</p>
          </div>
          <div className="metric-card">
            <h3>87%</h3>
            <p className="muted">Avg. win-potential on curated best-fit opportunities.</p>
          </div>
        </section>

        <section className="soft-section">
          <div className="section-heading">
            <h2>Featured opportunities</h2>
            <p>Start with the best opportunities first, then drop into the full table for deeper filtering.</p>
          </div>

          <div className="featured-grid">
            {[
              {
                title: 'Office seating package',
                agency: 'Department of Veterans Affairs',
                profit: '$18,400',
                difficulty: 'Easy',
                score: 92,
              },
              {
                title: 'Tactical backpack replenishment',
                agency: 'Department of Defense',
                profit: '$92,000',
                difficulty: 'Moderate',
                score: 88,
              },
              {
                title: 'Printer toner and supplies',
                agency: 'U.S. Forest Service',
                profit: '$11,200',
                difficulty: 'Easy',
                score: 84,
              },
            ].map((item) => (
              <div className="feature-card" key={item.title}>
                <div className="row spread align-start">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="muted tiny">{item.agency}</p>
                  </div>
                  <ScorePill score={item.score} />
                </div>
                <div className="feature-profit">{item.profit}</div>
                <div className="feature-meta">
                  <Badge tone="success">High margin</Badge>
                  <Badge>{item.difficulty}</Badge>
                </div>
                <p className="muted">Pre-qualified for beginner-friendly resale workflows and faster sourcing.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="table-grid">
          <div className="filter-panel">
            <div className="section-heading">
              <h2>Filter what matters</h2>
              <p>Focus on profitability, ease, and category fit before you waste time reading every notice.</p>
            </div>
            <div className="filter-stack">
              <Field label="Industry"><input value="Office supplies" readOnly /></Field>
              <Field label="Profit range"><input value="$5k – $50k" readOnly /></Field>
              <Field label="Difficulty"><input value="Easy to Moderate" readOnly /></Field>
            </div>
            <div className="filter-chip-row">
              <span className="chip">Small business set-aside</span>
              <span className="chip">Reseller fit</span>
              <span className="chip">Fast turnaround</span>
            </div>
          </div>

          <div className="opportunities-panel">
            <div className="section-heading">
              <h2>Live opportunity view</h2>
              <p>Featured cards on top. Clean, sortable contract table below.</p>
            </div>

            <div className="opportunities-table">
              <div className="opportunity-table-row header">
                <span>Opportunity</span>
                <span>Agency</span>
                <span>Profit</span>
                <span>Ease</span>
                <span>Score</span>
              </div>
              {[
                ['Office seating package', 'VA', '$18.4k', 'Easy', '92'],
                ['Tactical backpacks', 'DoD', '$92k', 'Moderate', '88'],
                ['Printer toner', 'USFS', '$11.2k', 'Easy', '84'],
              ].map(([name, agency, profit, ease, score]) => (
                <div className="opportunity-table-row" key={name}>
                  <strong>{name}</strong>
                  <span className="muted">{agency}</span>
                  <span>{profit}</span>
                  <Badge>{ease}</Badge>
                  <ScorePill score={Number(score)} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="value-grid">
          {[
            ['Profit-first filtering', 'See what to sell and what the upside likely is before chasing a bid.'],
            ['Beginner-friendly workflow', 'Designed for smaller firms that need clarity, not procurement overload.'],
            ['Cleaner bid decisions', 'Use score, ease, and fit to decide where your time should actually go.'],
          ].map(([title, text]) => (
            <div className="value-card" key={title}>
              <h3>{title}</h3>
              <p className="muted" style={{ marginTop: 10 }}>{text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function AboutView({ navigate, user, setAuthMode }) {
  return (
    <div className="app-shell public-shell">
      <main className="main-area">
        <PublicHeader navigate={navigate} user={user} setAuthMode={setAuthMode} />

        <section className="soft-section">
          <div className="section-heading">
            <div className="hero-kicker">About GovSignal</div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.03 }}>A cleaner way to evaluate federal opportunities</h1>
            <p>
              GovSignal helps small and mid-sized contractors move from scattered contract searching to a more disciplined, profit-aware workflow.
            </p>
          </div>

          <div className="value-grid">
            <div className="value-card">
              <h3>Find better opportunities</h3>
              <p className="muted" style={{ marginTop: 10 }}>Surface contracts worth pursuing instead of sorting through raw procurement noise.</p>
            </div>
            <div className="value-card">
              <h3>Qualify faster</h3>
              <p className="muted" style={{ marginTop: 10 }}>See fit, risk, and likely complexity before your team spends hours digging in.</p>
            </div>
            <div className="value-card">
              <h3>Manage your pipeline</h3>
              <p className="muted" style={{ marginTop: 10 }}>Keep discovery, watchlists, and proposal planning inside one workflow.</p>
            </div>
          </div>

          <div className="row wrap" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                if (user) navigate('dashboard');
                else {
                  setAuthMode('register');
                  navigate('auth');
                }
              }}
            >
              {user ? 'Open dashboard' : 'Create account'}
            </button>
            <button type="button" className="ghost-btn" onClick={() => navigate('home')}>
              Back home
            </button>
          </div>
        </section>
      </main>
    </div>
  );
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
  const [proposalType, setProposalType] = useState('capability');
  const [proposalOutput, setProposalOutput] = useState('');
  const [proposalScore, setProposalScore] = useState(null);
  const [proposalDocument, setProposalDocument] = useState('');
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
      const [oppRes, watchRes, searchRes, perfRes, digestRes] = await Promise.all([
        api(
          `/api/opportunities?${new URLSearchParams({
            keyword: filters.keyword,
            naicsCode: filters.naicsCode,
            setAside: filters.setAside,
            agency: filters.agency,
            type: filters.type,
            daysBack: String(filters.daysBack || 30),
            limit: String(filters.limit || 50),
          }).toString()}`
        ),
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

        tokenStore.set(result.token);
        setToken(result.token);
        setUser(result.user);
        setProfileDraft({ ...EMPTY_PROFILE, ...result.user, samApiKey: '' });
        setAuthForm(initialAuth);
        navigate('dashboard');
        setMessage(mode === 'login' ? 'Welcome back.' : 'Account created successfully.');
      }
    } catch (err) {
      if (err.message === 'Email already registered') {
        setError('Account already exists — try signing in.');
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
    if (!searchName.trim()) {
      setError('Name this search first.');
      clearFlash();
      return;
    }

    try {
      const created = await api('/api/searches', {
        method: 'POST',
        body: { name: searchName.trim(), filters, alertOn: true },
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
      setError(err.message);
      if (err.status === 403) navigate('pricing');
    } finally {
      clearFlash();
    }
  }

  async function generateProposal() {
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
      setError(err.message);
      if (err.status === 403) navigate('pricing');
    } finally {
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

    // reset app state
    setOpportunities([]);
    setWatchlist([]);
    setSavedSearches([]);
    setPastPerformance([]);
    setSelectedOpportunity(null);

    // navigate to public home
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
      />
    );
  }

  if ((!token || !user) && view === 'home') {
    return <HomeView navigate={navigate} user={user} setAuthMode={setAuthMode} />;
  }

  if ((!token || !user) && view === 'about') {
    return <AboutView navigate={navigate} user={user} setAuthMode={setAuthMode} />;
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
      />
    );
  }

  if (view === 'home') {
    return <HomeView navigate={navigate} user={user} setAuthMode={setAuthMode} />;
  }

  if (view === 'about') {
  return <AboutPage />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div>
          <div className="brand-mark">GovSignal</div>
          <p className="tiny muted">GovCon workflow for small contractors</p>
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
              <p className="muted">Focus on the contracts most worth your time.</p>
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
                    <div className="empty-state">Save opportunities to start your working pipeline.</div>
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
                    placeholder="Name this search"
                  />
                  <button type="button" className="primary-btn" onClick={saveCurrentSearch}>
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
                  <div className="card empty-state">No opportunities found with the current filters.</div>
                ) : null}
              </div>

              <OpportunityDetail
                opportunity={selectedOpportunity}
                saved={savedNoticeIds.has(selectedOpportunity?.noticeId)}
                onToggleSave={toggleWatchlist}
                onAnalyze={runAnalysis}
                aiAnalysis={currentAnalysis}
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
                          {item.agency || 'Unknown agency'} • {formatDate(item.responseDeadline)}
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
                        Created {formatDate(item.createdAt)} • Alerts {item.alertOn ? 'on' : 'off'}
                      </div>
                      <div className="tiny muted">
                        {Object.entries(item.filters || {})
                          .filter(([, value]) => value)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' • ') || 'No filters saved'}
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
                          {item.agency || 'Unknown agency'} • {item.year || 'Unknown year'} • {item.outcome}
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
                  <textarea
                    rows="18"
                    value={proposalDocument}
                    onChange={(e) => setProposalDocument(e.target.value)}
                    placeholder="Generated proposal text will appear here."
                  />
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

                  <Field label="SAM.gov API key" hint="Optional. Lets you use your own SAM.gov quota.">
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
            <div className="pricing-grid">
              {PLAN_CARDS.map((plan) => (
                <div className="card" key={plan.code}>
                  <h2>{plan.name}</h2>
                  <div className="price">{plan.price}</div>
                  <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => startCheckout(plan.code)}
                    disabled={user.plan === plan.code}
                  >
                    {user.plan === plan.code ? 'Current plan' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              ))}

              <div className="card">
                <h2>Current plan</h2>
                <div className="price">{user.plan}</div>
                <p className="muted">
                  Free users can still search, save opportunities, and manage pipeline basics.
                  Paid plans unlock AI workflows and digest automation.
                </p>
                {user.plan !== 'FREE' ? (
                  <button type="button" className="ghost-btn" onClick={openBillingPortal}>
                    Manage subscription
                  </button>
                ) : null}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}