import { hasAnyStem, hasAnyToken, hasPhrase } from './normalize.js';

export function detectUrgency(doc, entities = {}) {
  const reasons = [];

  if (hasAnyToken(doc, ['dnes', 'utre'])) reasons.push('near_date');
  if (entities.hasDeadline || hasPhrase(doc, 'izticha srok')) reasons.push('deadline');
  if (hasPhrase(doc, 'vrachiha mi') || hasAnyStem(doc, ['vrach'])) reasons.push('served_document');
  if (hasAnyStem(doc, ['arest', 'zadarzh'])) reasons.push('detention');
  if (hasAnyStem(doc, ['nasilie', 'zaplah'])) reasons.push('threat_or_violence');
  if (hasPhrase(doc, 'dete v risk')) reasons.push('child_risk');
  if (hasAnyStem(doc, ['uvoln'])) reasons.push('dismissal');
  if (hasAnyToken(doc, ['chsi', 'zapor']) || hasPhrase(doc, 'publichna prodan')) reasons.push('enforcement');
  if (entities.hasCourtHearing) reasons.push('court_hearing');

  return {
    urgency: reasons.length ? 'high' : 'normal',
    urgent: reasons.length > 0,
    reasons,
  };
}
