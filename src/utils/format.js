import { TYPE_LABELS } from '../constants';

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

export function formatMoney(value) {
  if (!value && value !== 0) return 'Unknown';
  const num = Number(value);
  if (Number.isNaN(num)) return 'Unknown';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatValueRange(min, max, label) {
  if (label) return label;

  const hasMin = min !== null && min !== undefined && min !== '';
  const hasMax = max !== null && max !== undefined && max !== '';

  if (!hasMin && !hasMax) return 'Value not provided';

  if (hasMin && hasMax) {
    if (Number(min) === Number(max)) return formatMoney(min);
    return `${formatMoney(min)} - ${formatMoney(max)}`;
  }

  if (hasMin) return `From ${formatMoney(min)}`;
  return `Up to ${formatMoney(max)}`;
}

export function getDaysLeft(value) {
  if (!value) return null;
  const now = new Date();
  const deadline = new Date(value);
  return Math.ceil((deadline - now) / 86400000);
}

export function scoreTone(score = 0) {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'fair';
  return 'weak';
}

export function recommendationLabel(score = 0) {
  if (score >= 80) return 'Pursue';
  if (score >= 60) return 'Consider';
  return 'Skip';
}

export function typeLabel(code) {
  return TYPE_LABELS[code] || code || 'Notice';
}

export function extractContractIntel(opportunity) {
  const rawText = `${opportunity.description || ''} ${opportunity.title || ''}`.toLowerCase();
  const valuePatterns = [
    /\$([0-9,]+(?:\.[0-9]+)?)\s*(million|mil\b|m\b)/i,
    /\$([0-9,]+(?:\.[0-9]+)?)\s*(billion|bil\b|b\b)/i,
    /\$([0-9,]+(?:\.[0-9]+)?)\s*(thousand|k\b)/i,
    /\$([0-9,]{5,}(?:\.[0-9]+)?)/i,
  ];

  let estimatedValue =
    opportunity.valueMin ||
    opportunity.awardAmount ||
    opportunity.baseAndAllOptionsValue ||
    opportunity.contractValue ||
    null;

  let valueConfidence = estimatedValue ? 'high' : 'low';

  if (!estimatedValue) {
    for (const pattern of valuePatterns) {
      const match = rawText.match(pattern);
      if (match) {
        let value = Number(match[1].replace(/,/g, ''));
        const unit = (match[2] || '').toLowerCase();
        if (unit.startsWith('b')) value *= 1_000_000_000;
        else if (unit.startsWith('m')) value *= 1_000_000;
        else if (unit.startsWith('k') || unit.startsWith('t')) value *= 1_000;
        estimatedValue = value;
        valueConfidence = 'medium';
        break;
      }
    }
  }

  let complexityLevel = 'Moderate';
  const complexityFlags = [];
  if (/enterprise|nationwide|multi-site|classified|zero trust|devsecops|soc|noc|24\/7/.test(rawText)) {
    complexityLevel = 'High';
    complexityFlags.push('Complex scope');
  }
  if (/help desk|staff augmentation|training|support services|document/.test(rawText)) {
    complexityLevel = complexityLevel === 'High' ? 'High' : 'Low to Moderate';
  }

  let clearanceRequired = null;
  if (/ts\/sci|top secret\/sci/.test(rawText)) clearanceRequired = 'TS/SCI';
  else if (/top secret/.test(rawText)) clearanceRequired = 'Top Secret';
  else if (/secret clearance|secret-level/.test(rawText)) clearanceRequired = 'Secret';
  else if (/public trust/.test(rawText)) clearanceRequired = 'Public Trust';

  let incumbentRisk = 'Low';
  const incumbentSignals = [];
  if (/follow-on|recompete|incumbent|bridge contract|option year|phase ii/.test(rawText)) {
    incumbentRisk = 'High';
    incumbentSignals.push('Likely incumbent present');
  }

  let newFirmSuitability = 'Moderate';
  if (/sources sought|rfi|market research/.test(rawText)) newFirmSuitability = 'High';
  if (clearanceRequired || complexityLevel === 'High' || incumbentRisk === 'High') newFirmSuitability = 'Low';

  return {
    estimatedValue,
    valueConfidence,
    competitionType: opportunity.setAsideDescription || 'Unknown',
    clearanceRequired,
    complexityLevel,
    complexityFlags,
    incumbentRisk,
    incumbentSignals,
    newFirmSuitability,
  };
}

export function normalizeOpportunity(item) {
  const opportunity = item?.opportunity
    ? { ...item.opportunity, watchlistNotes: item.notes, savedAt: item.savedAt }
    : item;

  const score = opportunity.score ?? item.score ?? 0;
  const reasons = opportunity.reasons || item.reasons || [];
  const intel = extractContractIntel(opportunity);

  return {
    ...opportunity,
    score,
    reasons,
    intel,
    recommendation: recommendationLabel(score),
    opportunityType: opportunity.opportunityType || opportunity.type,
    setAsideDescription: opportunity.setAsideDescription || opportunity.typeOfSetAsideDescription,
    responseDeadline: opportunity.responseDeadline || opportunity.responseDeadLine,
  };
}