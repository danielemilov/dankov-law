import { hasPhrase } from './normalize.js';
import { AMBIGUOUS_MONEY_QUESTION, INTENTS } from './rules.js';

function scoreTerm(doc, term, weight) {
  if (term.length <= 3) return doc.tokenSet.has(term) ? weight : 0;
  return doc.tokens.some((token) => token.startsWith(term)) ? weight : 0;
}

function scoreSubtype(doc, subtypeRules = {}) {
  const scored = Object.entries(subtypeRules).map(([subtype, rules]) => {
    let score = 0;
    for (const phrase of rules.phrases || []) {
      if (hasPhrase(doc, phrase)) score += 8;
    }
    for (const stem of rules.stems || []) {
      score += scoreTerm(doc, stem, 3);
    }
    return { subtype, label: rules.label, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0] : null;
}

export function classifyLegalProblem(doc, entities = {}, previousState = {}) {
  const scores = {};
  const hits = {};

  for (const [intent, rules] of Object.entries(INTENTS)) {
    let score = 0;
    hits[intent] = [];

    for (const [phrase, weight] of Object.entries(rules.strongPhrases || {})) {
      if (hasPhrase(doc, phrase)) {
        score += weight;
        hits[intent].push(`phrase:${phrase}`);
      }
    }

    for (const [term, weight] of Object.entries(rules.coreTerms || {})) {
      const termScore = scoreTerm(doc, term, weight);
      if (termScore) {
        score += termScore;
        hits[intent].push(`core:${term}`);
      }
    }

    for (const [term, weight] of Object.entries(rules.supportingTerms || {})) {
      const termScore = scoreTerm(doc, term, weight);
      if (termScore) {
        score += termScore;
        hits[intent].push(`support:${term}`);
      }
    }

    for (const [phrase, penalty] of Object.entries(rules.exclusions || {})) {
      if (hasPhrase(doc, phrase) || doc.tokenSet.has(phrase)) {
        score += penalty;
        hits[intent].push(`exclude:${phrase}`);
      }
    }

    if (previousState.activeIntent === intent && score > 0 && score < 7) {
      score += 2;
      hits[intent].push('context:activeIntent');
    }

    scores[intent] = Math.max(0, score);
  }

  const ranked = Object.entries(scores)
    .map(([intent, score]) => ({ intent, score }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0] || { intent: 'unknown', score: 0 };
  const second = ranked[1] || { intent: 'unknown', score: 0 };
  const vagueMoneyBack =
    hasPhrase(doc, 'ne mi vrashtat pari') &&
    !['zaplata', 'depozit', 'zaem', 'pokupka', 'garantsiya', 'naem'].some((token) =>
      doc.tokenSet.has(token)
    );
  const ambiguousMoney =
    (entities.hasMoney || vagueMoneyBack) &&
    best.score < 8 &&
    ['civil', 'consumer', 'property', 'employment'].some((intent) => scores[intent] > 0);

  if (vagueMoneyBack) {
    return {
      intent: 'ambiguous',
      subtype: null,
      confidence: 0.32,
      label: 'Неясен паричен спор',
      clarifyQuestion: AMBIGUOUS_MONEY_QUESTION,
      scores,
      hits,
      ranked,
    };
  }

  if (best.score < 7) {
    if (previousState.activeIntent && entities.mentionedDate) {
      return {
        intent: previousState.activeIntent,
        subtype: previousState.activeSubtype || null,
        confidence: 0.4,
        label: 'Продължение на предишния казус',
        scores,
        hits: {
          ...hits,
          context: ['relative_date_followup'],
        },
        ranked,
      };
    }

    return {
      intent: ambiguousMoney ? 'ambiguous' : 'unknown',
      subtype: null,
      confidence: best.score ? 0.22 : 0,
      label: ambiguousMoney ? 'Неясен паричен спор' : 'Неуточнен казус',
      clarifyQuestion: ambiguousMoney ? AMBIGUOUS_MONEY_QUESTION : null,
      scores,
      hits,
      ranked,
    };
  }

  if (best.score - second.score < 2) {
    return {
      intent: 'ambiguous',
      subtype: null,
      confidence: 0.35,
      label: 'Двусмислен казус',
      clarifyQuestion: ambiguousMoney
        ? AMBIGUOUS_MONEY_QUESTION
        : 'За да ви насоча правилно, уточнете дали казусът е трудов, административен, семеен, имотен, потребителски или друг?',
      scores,
      hits,
      ranked,
    };
  }

  const subtype = scoreSubtype(doc, INTENTS[best.intent]?.subtypes);
  const margin = best.score - second.score;

  return {
    intent: best.intent,
    subtype: subtype?.subtype || null,
    subtypeLabel: subtype?.label || null,
    confidence: Math.min(0.96, Math.max(0.42, (best.score + margin) / 24)),
    label: INTENTS[best.intent]?.label || best.intent,
    scores,
    hits,
    ranked,
  };
}
