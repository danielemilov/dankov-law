import { hasAnyStem, hasAnyToken, hasPhrase } from './normalize.js';

const CONTACT_RE =
  /(\+?\d[\d\s().-]{6,}\d)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;

const DOCUMENT_RULES = [
  ['dismissalOrder', ['zapoved za uvolnenie', 'zapoved za disciplinarno'], ['uvoln']],
  ['penaltyDecree', ['nakazatelno postanovlenie'], ['postanovlenie']],
  ['summons', ['poluchih prizovka'], ['prizovka']],
  ['policeTicket', ['akt ot politsiya', 'fish ot politsiya'], ['akt', 'fish']],
  ['contract', ['trudov dogovor', 'dogovor za naem', 'dogovor za zaem'], ['dogovor']],
  ['notarialDeed', ['notarialen akt'], ['notarialen']],
  ['protocol', [], ['protokol']],
];

export function extractEntities(doc) {
  const documentTypes = DOCUMENT_RULES.filter(([, phrases, stems]) => {
    return phrases.some((phrase) => hasPhrase(doc, phrase)) || stems.some((stem) => doc.tokens.some((token) => token.startsWith(stem)));
  }).map(([type]) => type);

  const institutions = [];
  if (hasAnyStem(doc, ['polits'])) institutions.push('police');
  if (hasAnyStem(doc, ['prokur'])) institutions.push('prosecution');
  if (hasAnyStem(doc, ['obshtin', 'kmet'])) institutions.push('municipality');
  if (hasAnyToken(doc, ['nap'])) institutions.push('nap');
  if (hasAnyToken(doc, ['noi'])) institutions.push('noi');
  if (hasAnyToken(doc, ['chsi'])) institutions.push('bailiff');
  if (hasAnyStem(doc, ['sad', 'sadeb'])) institutions.push('court');
  if (hasAnyStem(doc, ['rabotodatel']) || hasAnyToken(doc, ['shefa'])) institutions.push('employer');
  if (hasAnyStem(doc, ['banka'])) institutions.push('bank');
  if (hasAnyStem(doc, ['zastrahov'])) institutions.push('insurer');

  const relativeDate =
    ['dnes', 'utre', 'vchera'].find((token) => doc.tokenSet.has(token)) || null;
  const explicitDeadline = hasPhrase(doc, 'izticha srok') || hasPhrase(doc, 'kraen srok');

  return {
    hasDocument: documentTypes.length > 0 || hasAnyStem(doc, ['zapoved', 'akt', 'fish', 'dogovor', 'protokol', 'prizovka']),
    documentTypes,
    hasDeadline: explicitDeadline || hasAnyToken(doc, ['srok']) || /\b\d{1,2}\s*(dni|den|chas|chasa)\b/.test(doc.text),
    mentionedDate: relativeDate,
    institutions,
    contactDetected: CONTACT_RE.test(doc.raw),
    hasThreat: hasAnyStem(doc, ['zaplah', 'nasilie', 'arest', 'zadarzh']),
    hasCourtHearing: hasPhrase(doc, 'sadebno zasedanie') || hasAnyToken(doc, ['zasedanie']),
    hasMoney: hasAnyToken(doc, ['pari', 'zaplata', 'depozit']) || hasAnyStem(doc, ['plasht', 'dalg']),
  };
}
