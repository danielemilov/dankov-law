export function buildConversationState(previousState = {}, classification = {}, entities = {}) {
  const activeIntent =
    classification.intent && !['unknown', 'ambiguous'].includes(classification.intent)
      ? classification.intent
      : previousState.activeIntent || 'unknown';

  const activeSubtype =
    classification.subtype ||
    (activeIntent === previousState.activeIntent ? previousState.activeSubtype : null) ||
    null;

  const intentChanged =
    previousState.activeIntent &&
    previousState.activeIntent !== 'unknown' &&
    activeIntent !== previousState.activeIntent;

  const knownFacts = {
    ...(intentChanged ? {} : previousState.knownFacts || {}),
  };

  if (entities.hasDocument) knownFacts.hasDocument = true;
  if (entities.documentTypes?.length) knownFacts.documentTypes = entities.documentTypes;
  if (entities.mentionedDate) knownFacts.lastMentionedDate = entities.mentionedDate;
  if (entities.hasDeadline) knownFacts.hasDeadline = true;
  if (entities.institutions?.length) knownFacts.institutions = entities.institutions;

  if (
    previousState.activeSubtype &&
    entities.mentionedDate &&
    previousState.askedQuestions?.includes('dismissalDate')
  ) {
    knownFacts.receivedDate = entities.mentionedDate;
  }

  return {
    activeIntent,
    activeSubtype,
    knownFacts,
    askedQuestions: intentChanged ? [] : previousState.askedQuestions || [],
    behavior: previousState.behavior || {},
  };
}

export function rememberQuestion(state, questionKey) {
  if (!questionKey) return state;

  return {
    ...state,
    askedQuestions: Array.from(new Set([...(state.askedQuestions || []), questionKey])),
  };
}
