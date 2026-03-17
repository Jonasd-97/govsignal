export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const NAICS_OPTIONS = [
  { code: '541511', label: '541511 — Custom Computer Programming' },
  { code: '541512', label: '541512 — Computer Systems Design' },
  { code: '541513', label: '541513 — Computer Facilities Management' },
  { code: '541519', label: '541519 — Other Computer Related Services' },
  { code: '541611', label: '541611 — Management Consulting' },
  { code: '541690', label: '541690 — Other Scientific & Technical Consulting' },
  { code: '541715', label: '541715 — R&D in Physical Sciences' },
  { code: '561320', label: '561320 — Temporary Staffing Services' },
  { code: '561410', label: '561410 — Document Preparation Services' },
  { code: '561990', label: '561990 — Other Support Services' },
  { code: '238210', label: '238210 — Electrical Contractors' },
  { code: '332999', label: '332999 — Other Fabricated Metal Products' },
  { code: '423490', label: '423490 — Industrial Equipment Wholesale' },
  { code: '424490', label: '424490 — Grocery & Related Product Wholesale' },
  { code: '511210', label: '511210 — Software Publishers' },
  { code: '517110', label: '517110 — Wired Telecom Carriers' },
  { code: '621111', label: '621111 — Offices of Physicians' },
  { code: '811212', label: '811212 — Computer Repair & Maintenance' },
];

export const SET_ASIDE_OPTIONS = [
  { code: 'SBA', label: 'Small Business' },
  { code: '8AN', label: '8(a)' },
  { code: 'HZC', label: 'HUBZone' },
  { code: 'SDVOSBC', label: 'SDVOSB' },
  { code: 'WOSB', label: 'WOSB' },
  { code: 'EDWOSB', label: 'EDWOSB' },
  { code: 'VSB', label: 'Veteran-Owned Small Business' },
];

export const AGENCY_OPTIONS = [
  'DEPT OF DEFENSE',
  'DEPT OF VETERANS AFFAIRS',
  'DEPT OF HOMELAND SECURITY',
  'GENERAL SERVICES ADMINISTRATION',
  'DEPT OF HEALTH AND HUMAN SERVICES',
  'DEPT OF JUSTICE',
  'DEPT OF TRANSPORTATION',
  'DEPT OF ENERGY',
  'DEPT OF STATE',
  'NASA',
  'ENVIRONMENTAL PROTECTION AGENCY',
  'DEPT OF TREASURY',
  'DEPT OF AGRICULTURE',
  'DEPT OF INTERIOR',
  'DEPT OF LABOR',
];

export const TYPE_OPTIONS = [
  { code: '', label: 'All notice types' },
  { code: 'o', label: 'Solicitations' },
  { code: 'k', label: 'Combined synopsis/solicitation' },
  { code: 'p', label: 'Pre-solicitations' },
  { code: 'r', label: 'Sources sought' },
  { code: 's', label: 'Special notices' },
  { code: 'a', label: 'Award notices' },
];

export const TYPE_LABELS = {
  o: 'Solicitation',
  p: 'Pre-Solicitation',
  k: 'Combined',
  r: 'Sources Sought',
  s: 'Special Notice',
  a: 'Award Notice',
  i: 'Intent to Bundle',
  g: 'Sale of Surplus',
};

export const PLAN_CARDS = [
  {
    code: 'PRO',
    name: 'Pro',
    price: '$49/mo',
    features: ['Unlimited opportunity searches', 'Daily email digest', 'AI bid analysis', 'Proposal drafting and scoring'],
  },
  {
    code: 'AGENCY',
    name: 'Agency',
    price: '$149/mo',
    features: ['Everything in Pro', 'Award history lookup', 'Agency-level workflows', 'Best fit for growing govcon teams'],
  },
];

export const DEFAULT_FILTERS = {
  keyword: '',
  naicsCode: '',
  setAside: '',
  agency: '',
  type: '',
  daysBack: 30,
  limit: 50,
};

export const EMPTY_PROFILE = {
  name: '',
  companyName: '',
  naicsCode: '',
  setAside: '',
  targetAgency: '',
  samApiKey: '',
};
