const CYR_TO_LAT = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sht',
  ъ: 'a',
  ь: '',
  ю: 'yu',
  я: 'ya',
};

const WORD_FIXES = new Map([
  ['kakwo', 'kakvo'],
  ['kvo', 'kakvo'],
  ['kvо', 'kakvo'],
  ['zdravey', 'zdravei'],
  ['zdrasti', 'zdravei'],
  ['zdr', 'zdravei'],
  ['dpbre', 'dobre'],
  ['dobr', 'dobre'],
  ['okey', 'ok'],
  ['okei', 'ok'],
  ['ko', 'kakvo'],
  ['kak', 'kak'],
  ['6efa', 'shefa'],
  ['shefat', 'shefa'],
  ['shefut', 'shefa'],
  ['sefut', 'shefa'],
  ['4si', 'chsi'],
  ['chsi', 'chsi'],
  ['policiq', 'politsiya'],
  ['policia', 'politsiya'],
  ['politsia', 'politsiya'],
  ['advokad', 'advokat'],
  ['advokatka', 'advokat'],
  ['vru4iha', 'vrachiha'],
  ['vruchiha', 'vrachiha'],
  ['vrachixa', 'vrachiha'],
  ['pla6tat', 'plashtat'],
  ['plashtane', 'plashtane'],
  ['plasta', 'plashta'],
  ['sud', 'sad'],
  ['syda', 'sada'],
  ['delo', 'delo'],
  ['dogovora', 'dogovor'],
  ['zapovedta', 'zapoved'],
  ['zapoveda', 'zapoved'],
  ['akta', 'akt'],
  ['uvolniha', 'uvolniha'],
  ['uvolnixa', 'uvolniha'],
  ['zaplata', 'zaplata'],
  ['zaplatata', 'zaplata'],
  ['parite', 'pari'],
  ['vrashtat', 'vrashtat'],
  ['bolni4en', 'bolnichen'],
  ['predizvestieto', 'predizvestie'],
  ['predizvestie', 'predizvestie'],
  ['obshtinata', 'obshtina'],
  ['obshtina', 'obshtina'],
  ['prokuraturata', 'prokuratura'],
  ['prokuratura', 'prokuratura'],
]);

function transliterate(value) {
  return String(value)
    .toLowerCase()
    .replace(/[а-яё]/g, (char) => CYR_TO_LAT[char] ?? char);
}

function normalizeShliokavica(value) {
  return value
    .replace(/6t/g, 'sht')
    .replace(/6/g, 'sh')
    .replace(/4/g, 'ch')
    .replace(/q/g, 'ya')
    .replace(/ю/g, 'yu')
    .replace(/x/g, 'h')
    .replace(/w/g, 'v')
    .replace(/j/g, 'zh')
    .replace(/c(?!h)/g, 'ts');
}

function fixToken(token) {
  if (WORD_FIXES.has(token)) return WORD_FIXES.get(token);
  return token;
}

export function normalizeMessage(message = '') {
  const raw = String(message);
  const latin = normalizeShliokavica(transliterate(raw))
    .replace(/[^a-z0-9+@.\s-]/g, ' ')
    .replace(/[-/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = latin
    .split(' ')
    .filter(Boolean)
    .map(fixToken)
    .filter(Boolean);

  return {
    raw,
    text: tokens.join(' '),
    tokens,
    tokenSet: new Set(tokens),
  };
}

export function hasToken(doc, token) {
  return doc.tokenSet.has(token);
}

export function hasAnyToken(doc, tokens = []) {
  return tokens.some((token) => hasToken(doc, token));
}

export function hasStem(doc, stem) {
  return doc.tokens.some((token) => token.startsWith(stem));
}

export function hasAnyStem(doc, stems = []) {
  return stems.some((stem) => hasStem(doc, stem));
}

export function hasPhrase(doc, phrase) {
  const normalized = normalizeMessage(phrase).text;
  if (!normalized) return false;

  return ` ${doc.text} `.includes(` ${normalized} `);
}
