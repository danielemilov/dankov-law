import { classifyLegalProblem } from './classifier.js';
import { buildConversationState } from './conversationState.js';
import { detectConversationIntent, updateBehaviorState } from './conversationIntents.js';
import { extractEntities } from './entityExtractor.js';
import { normalizeMessage } from './normalize.js';
import { buildResponse } from './responseBuilder.js';
import { detectUrgency } from './urgencyDetector.js';

const LOW_QUALITY = new Set([
  'ok',
  'da',
  'ne',
  'help',
  'pomosht',
  'zdravei',
  'zdrasti',
  'alo',
  'test',
  'ne znam',
  'nishto',
]);

function isLowQuality(doc) {
  if (doc.text.length < 3) return true;
  if (LOW_QUALITY.has(doc.text)) return true;
  if (doc.tokens.length <= 2 && doc.text.length < 8) return true;
  return false;
}

export function analyzeLegalMessage({ message = '', previousState = {} } = {}) {
  const doc = normalizeMessage(message);
  const conversationIntent = detectConversationIntent(doc, previousState);

  if (conversationIntent) {
    return {
      reply: conversationIntent.reply,
      detectedIntent: conversationIntent.detectedIntent,
      subtype: null,
      confidence: conversationIntent.confidence,
      label: conversationIntent.label,
      shouldShowContactForm: conversationIntent.shouldShowContactForm,
      priority: conversationIntent.priority,
      legalState: updateBehaviorState(previousState, doc, conversationIntent),
      entities: {
        hasDocument: false,
        documentTypes: [],
        hasDeadline: false,
        mentionedDate: null,
        institutions: [],
        contactDetected: false,
        hasThreat: false,
        hasCourtHearing: false,
        hasMoney: false,
      },
      urgency: {
        urgency: 'normal',
        urgent: false,
        reasons: [],
      },
      scores: {},
      hits: {
        conversation: [conversationIntent.kind],
      },
      ranked: [],
    };
  }

  const entities = extractEntities(doc);
  const urgency = detectUrgency(doc, entities);

  let classification = classifyLegalProblem(doc, entities, previousState);

  if (isLowQuality(doc) && classification.intent === 'unknown') {
    classification = {
      ...classification,
      confidence: 0,
    };
  }

  const state = buildConversationState(
    updateBehaviorState(previousState, doc),
    classification,
    entities
  );
  const response = buildResponse({
    classification,
    entities,
    urgency,
    state,
  });

  return {
    reply: response.reply,
    detectedIntent: classification.intent === 'ambiguous' ? 'unknown' : classification.intent,
    subtype: classification.subtype,
    confidence: classification.confidence,
    label: classification.subtypeLabel || classification.label,
    shouldShowContactForm: response.shouldShowContactForm,
    priority: response.priority,
    legalState: response.state,
    entities,
    urgency,
    scores: classification.scores,
    hits: classification.hits,
    ranked: classification.ranked?.slice(0, 3),
  };
}

export function getDiagnostics() {
  return {
    engine: 'rule-based-nlp',
    pipeline: ['normalize', 'extract_entities', 'classify_intent_subtype', 'detect_urgency', 'update_state', 'build_response'],
  };
}
