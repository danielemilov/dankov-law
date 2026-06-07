import { analyzeLegalMessage, getDiagnostics } from './legal-chat/index.js';

const CONTACT_RE =
  /(\+?\d[\d\s().-]{6,}\d)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;

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

const SHLIOKAVICA_EQUIV = [
  ['sh', '6'],
  ['ch', '4'],
  ['sht', '6t'],
  ['zh', 'j'],
  ['ya', 'q'],
  ['yu', 'u'],
  ['ts', 'c'],
  ['a', 'а'],
  ['e', 'е'],
];

const BG_SUFFIXES = [
  '',
  'а',
  'ът',
  'та',
  'то',
  'те',
  'и',
  'ен',
  'на',
  'но',
  'ни',
  'ски',
  'ска',
  'ско',
  'ство',
  'ването',
  'ване',
  'ния',
  'ният',
  'ните',
];

const LAT_SUFFIXES = [
  '',
  'a',
  'at',
  'ta',
  'to',
  'te',
  'i',
  'en',
  'na',
  'no',
  'ni',
  'ski',
  'ska',
  'sko',
  'stvo',
  'vane',
  'vaneto',
  'nia',
  'niq',
  'nite',
];

const CONTEXT_BEFORE = [
  'имам проблем с',
  'получих',
  'връчиха ми',
  'искам помощ за',
  'искам консултация за',
  'не знам какво да правя с',
  'трябва ли да обжалвам',
  'какво да правя при',
  'мога ли да оспоря',
  'има ли срок за',
  'питам за',
  'казус с',
  'случай с',
  'проблем относно',
  'оплакване за',
  'жалба срещу',
  'iskam pomosht za',
  'imam problem s',
  'poluchih',
  'vrachiha mi',
  'kakvo da pravq pri',
  'mogа li da obzhalvam',
  'kazus s',
  'problem otnosno',
];

const CONTEXT_AFTER = [
  'какво да правя',
  'има ли срок',
  'може ли да се обжалва',
  'незаконно ли е',
  'как да реагирам',
  'какви документи трябват',
  'към кого да се обърна',
  'може ли адвокат да помогне',
  'има ли нарушение',
  'какви права имам',
  'kakvo da pravq',
  'ima li srok',
  'moje li da se obzhalva',
  'nezakonno li e',
  'kak da reagiram',
  'kakvi prava imam',
];

const GENERAL_LEGAL_CONTEXT = [
  'право',
  'правен',
  'правна',
  'правно',
  'адвокат',
  'консултация',
  'жалба',
  'молба',
  'искова молба',
  'съд',
  'районен съд',
  'административен съд',
  'окръжен съд',
  'вкс',
  'вас',
  'прокуратура',
  'полиция',
  'доказателство',
  'доказателства',
  'документ',
  'документи',
  'срок',
  'връчване',
  'заповед',
  'акт',
  'решение',
  'разпореждане',
  'уведомление',
  'протокол',
  'писмо',
  'имейл',
  'съобщение',
  'скрийншот',
  'линк',
  'свидетел',
  'свидетели',
  'дата',
  'час',
  'место',
  'място',
  'нарушение',
  'незаконно',
  'неправомерно',
  'обжалване',
  'оспорване',
  'защита',
  'обезщетение',
  'вреда',
  'вреди',
  'право на защита',
  'съдебно решение',
  'процедура',
  'сигнал',
  'проверка',
  'институция',
  'служител',
  'работодател',
  'държавен орган',
  'община',
  'комисия',
  'pravo',
  'praven',
  'pravna',
  'advokat',
  'konsultaciq',
  'jalba',
  'sud',
  'rayonen sud',
  'administrativen sud',
  'prokuratura',
  'policiq',
  'dokazatelstvo',
  'dokumenti',
  'srok',
  'vrachvane',
  'zapoved',
  'akt',
  'reshenie',
  'protokol',
  'email',
  'skrinshot',
  'link',
  'svidetel',
  'data',
  'narushenie',
  'nezakonno',
  'obzhalvane',
  'zashtita',
  'obezshtetenie',
  'procedura',
  'signal',
  'instituciq',
  'obshtina',
];

const LOW_QUALITY_PATTERNS = [
  'нищо',
  'nishto',
  'nisho',
  'nishot',
  'nqma nishto',
  'няма нищо',
  'не знам',
  'ne znam',
  'nz',
  'нз',
  'нямам идея',
  'nqmam ideq',
  'кажи',
  'kaji',
  'help',
  'помощ',
  'ok',
  'ок',
  'da',
  'да',
  'ne',
  'не',
  'test',
  'тест',
  'alo',
  'ало',
  'zdr',
  'здрасти',
  'здравей',
  'hi',
  'hello',
  '???',
  '...',
];

const URGENCY_WORDS = [
  'днес',
  'утре',
  'спешно',
  'срок',
  'краен срок',
  'получих днес',
  'връчиха ми',
  'изтича',
  'задържаха',
  'арест',
  'призовка',
  'полиция',
  'трябва да обжалвам',
  'след 3 дни',
  'след три дни',
  '7 дни',
  '14 дни',
  'един месец',
  'до понеделник',
  'dnes',
  'utre',
  'speshno',
  'srok',
  'kraen srok',
  'poluchih dnes',
  'vrachiha mi',
  'izticha',
  'arest',
  'prizovka',
  'policiq',
  'sled 3 dni',
  '7 dni',
  '14 dni',
];

const CATEGORY_PACKS = {
  employment: {
    label: 'Трудово право / уволнение',
    priority: 'high',
    baseWeight: 1.35,
    phrases: [
      'уволниха ме дисциплинарно',
      'дисциплинарно уволнение',
      'незаконно уволнение',
      'заповед за уволнение',
      'не ми дадоха причина',
      'не ми връчиха заповед',
      'не ми поискаха обяснения',
      'писмени обяснения',
      'трудов договор',
      'не ми платиха заплата',
      'забавена заплата',
      'неплатен труд',
      'работодателят ме заплашва',
      'работодателят ме уволни',
      'прекратиха ми договора',
      'съкратиха ме',
      'предизвестие за уволнение',
      'работа без договор',
      'болничен и уволнение',
      'уволнение по време на болничен',
      'отказаха ми отпуск',
      'дисциплинарно наказание',
      'заповед за дисциплинарно наказание',
      'чл 190 кодекс на труда',
      'чл 193 кодекс на труда',
      'чл 344 кодекс на труда',
      'uvolniha me disciplinarno',
      'disciplinarno uvolnenie',
      'nezakonno uvolnenie',
      'zapoved za uvolnenie',
      'ne mi dadoha prichina',
      'ne mi poiskaха obqsneniq',
      'pismeni obqsneniq',
      'trudov dogovor',
      'ne mi platiha zaplata',
      'rabotodatelqt me uvolni',
      'prekratiha mi dogovora',
      'sukratiha me',
      'bolnichen i uvolnenie',
    ],
    stems: [
      'уволн',
      'уволнение',
      'уволниха',
      'дисциплинар',
      'работодател',
      'работник',
      'служител',
      'трудов',
      'договор',
      'заплата',
      'възнаграждение',
      'фиш',
      'предизвестие',
      'съкращ',
      'болничен',
      'отпуск',
      'работно време',
      'извънреден труд',
      'неплатен',
      'наказание',
      'обяснения',
      'заповед',
      'кодекс на труда',
      'инспекция по труда',
      'дисциплинарка',
      'прекратяване',
      'чл 190',
      'чл 193',
      'чл 344',
      'uvoln',
      'uvolnenie',
      'disciplinar',
      'rabotodatel',
      'rabotnik',
      'slujitel',
      'sluzhitel',
      'trudov',
      'dogovor',
      'zaplata',
      'predizvestie',
      'bolnichen',
      'otpusk',
      'nakazanie',
      'obqsneniq',
      'zapoved',
      'inspekciq po truda',
      'prekratqvane',
    ],
  },

  discrimination: {
    label: 'Дискриминация',
    priority: 'normal',
    baseWeight: 1.4,
    phrases: [
      'дискриминация заради етнос',
      'дискриминация заради произход',
      'дискриминация на работното място',
      'дискриминация в училище',
      'дискриминация в магазин',
      'изгониха ме от магазин',
      'отказаха да ме обслужат',
      'не ме пуснаха заради цвета',
      'обидиха ме заради етноса',
      'различно отношение',
      'личен признак',
      'комисия за защита от дискриминация',
      'кзд',
      'тормоз заради произход',
      'дискриминационно отношение',
      'diskriminaciq zaradi etnos',
      'diskriminacia zaradi proizhod',
      'diskriminaciq na rabotnoto mqsto',
      'otkazaha da me obslujat',
      'ne me pusnaha zaradi cveta',
      'lichen priznak',
      'komisia za zashtita ot diskriminacia',
      'kzd',
    ],
    stems: [
      'дискриминац',
      'дискриминиран',
      'етнос',
      'етническ',
      'произход',
      'ром',
      'роми',
      'циган',
      'мургав',
      'цвят на кожата',
      'религия',
      'вяра',
      'пол',
      'увреждане',
      'инвалидност',
      'личен признак',
      'неравно третиране',
      'различно отношение',
      'отказаха',
      'обслужване',
      'изгониха',
      'тормоз',
      'унижение',
      'обида',
      'кзд',
      'комисия',
      'zashtita ot diskriminacia',
      'diskriminaciq',
      'diskriminacia',
      'diskriminiran',
      'etnos',
      'etnicheski',
      'proizhod',
      'rom',
      'cigan',
      'murgav',
      'cvqt na kojata',
      'cviat na kojata',
      'religiq',
      'pol',
      'uvrejdane',
      'lichen priznak',
      'neravno tretirane',
      'razlichno otnoshenie',
      'otkazaha',
      'obslujvane',
      'tormoz',
      'obida',
    ],
  },

  hateSpeech: {
    label: 'Омразна реч онлайн',
    priority: 'normal',
    baseWeight: 1.32,
    phrases: [
      'омразна реч',
      'език на омразата',
      'обиждат ме във фейсбук',
      'писаха за мен във facebook',
      'обиди онлайн',
      'заплахи онлайн',
      'расистки коментари',
      'етнически обиди',
      'публикация срещу мен',
      'коментар за етноса ми',
      'снимка без съгласие',
      'пост без съгласие',
      'клевета във facebook',
      'обида във facebook',
      'tiktok обиди',
      'instagram обиди',
      'omrazna rech',
      'ezik na omrazata',
      'obijdat me vuv facebook',
      'pisaha za men vuv facebook',
      'obidi online',
      'zaplah online',
      'rasistki komentari',
      'etnicheski obidi',
      'publikaciq sreshtu men',
      'komentar za etnosa mi',
      'kleveta vuv facebook',
      'obida vuv facebook',
    ],
    stems: [
      'омраз',
      'реч на омразата',
      'език на омразата',
      'facebook',
      'фейсбук',
      'fb',
      'tiktok',
      'тик ток',
      'instagram',
      'инстаграм',
      'коментар',
      'пост',
      'публикация',
      'профил',
      'група',
      'страница',
      'скрийншот',
      'линк',
      'онлайн',
      'социална мрежа',
      'обида',
      'обиди',
      'клевета',
      'заплаха',
      'расист',
      'етнически',
      'публично',
      'споделяне',
      'снимка',
      'без съгласие',
      'omraz',
      'facebook',
      'fb',
      'tiktok',
      'instagram',
      'komentar',
      'post',
      'publikaciq',
      'profil',
      'grupa',
      'stranica',
      'skrinshot',
      'link',
      'online',
      'socialna mreja',
      'obida',
      'kleveta',
      'zaplah',
      'rasist',
      'etnicheski',
      'snimka',
      'bez saglasie',
      'bez suglasie',
    ],
  },

  administrative: {
    label: 'Административен акт / институция',
    priority: 'high',
    baseWeight: 1.35,
    phrases: [
      'получих акт от полицията',
      'акт от полицията',
      'акт от общината',
      'акт от институция',
      'наказателно постановление',
      'административен акт',
      'заповед от институция',
      'заповед от общината',
      'срок за обжалване',
      'как да обжалвам акт',
      'връчиха ми акт',
      'връчиха ми заповед',
      'глоба от полицията',
      'фиш от полицията',
      'жалба срещу акт',
      'обжалване на заповед',
      'poluchih akt ot policiqta',
      'akt ot policiqta',
      'akt ot obshtinata',
      'nakazatelno postanovlenie',
      'administrativen akt',
      'zapoved ot instituciq',
      'srok za obzhalvane',
      'kak da obzhalvam akt',
      'vrachiha mi akt',
      'globa ot policiqta',
      'fish ot policiqta',
    ],
    stems: [
      'акт',
      'полиция',
      'полицай',
      'глоба',
      'фиш',
      'наказателно постановление',
      'административен акт',
      'административно нарушение',
      'заповед',
      'институция',
      'община',
      'кмет',
      'администрация',
      'обжалване',
      'оспорване',
      'жалба',
      'държавен орган',
      'контролен орган',
      'проверка',
      'връчване',
      'срок',
      'апк',
      'административен съд',
      'наказващ орган',
      'актосъставител',
      'нарушение',
      'akt',
      'policiq',
      'policia',
      'policai',
      'globa',
      'fish',
      'nakazatelno postanovlenie',
      'administrativen akt',
      'zapoved',
      'instituciq',
      'obshtina',
      'kmet',
      'administraciq',
      'obzhalvane',
      'osporvane',
      'jalba',
      'darjaven organ',
      'vrachvane',
      'srok',
      'apk',
      'administrativen sud',
      'narushenie',
    ],
  },

  criminal: {
    label: 'Полиция / наказателен казус',
    priority: 'high',
    baseWeight: 1.25,
    phrases: [
      'викаха ме в полицията',
      'получих призовка',
      'задържаха ме',
      'арестуваха ме',
      'разпит в полицията',
      'досъдебно производство',
      'обвинение срещу мен',
      'прокуратурата ме вика',
      'пострадал съм от престъпление',
      'подадох жалба в полицията',
      'протокол от полицията',
      'vikaha me v policiqta',
      'poluchih prizovka',
      'zadarjaha me',
      'arestuvaha me',
      'razpit v policiqta',
      'dosadebno proizvodstvo',
      'obvinenie sreshtu men',
      'prokuraturata me vika',
      'podadoh jalba v policiqta',
    ],
    stems: [
      'обвинение',
      'разследване',
      'досъдебно',
      'призовка',
      'прокуратура',
      'задържане',
      'задържаха',
      'арест',
      'арестуваха',
      'побой',
      'заплаха',
      'разпит',
      'полиция',
      'свидетел',
      'обвиняем',
      'пострадал',
      'жалба в полицията',
      'протокол',
      'престъпление',
      'наказателно',
      'мвр',
      'дознател',
      'следовател',
      'obvinenie',
      'razsledvane',
      'dosadebno',
      'prizovka',
      'prokuratura',
      'zadarjane',
      'arest',
      'poboy',
      'zaplah',
      'razpit',
      'policiq',
      'svidetel',
      'obvinqem',
      'postradal',
      'protokol',
      'prestuplenie',
      'nakazatelno',
      'mvr',
    ],
  },

  booking: {
    label: 'Консултация',
    priority: 'normal',
    baseWeight: 1.12,
    phrases: [
      'искам консултация',
      'искам час',
      'как да запазя час',
      'искам среща с адвокат',
      'може ли контакт',
      'как да се свържа',
      'може ли да ми се обадите',
      'искам адвокат',
      'искам да говоря с адвокат',
      'zapazq chas',
      'iskam konsultaciq',
      'iskam chas',
      'iskam sreshta s advokat',
      'moje li kontakt',
      'kak da se svurja',
      'iskam advokat',
    ],
    stems: [
      'час',
      'консултация',
      'среща',
      'запазя',
      'запиша',
      'говоря с адвокат',
      'връзка',
      'контакт',
      'обади',
      'свържете',
      'адвокат',
      'кантора',
      'прием',
      'заявка',
      'chas',
      'konsultaciq',
      'konsultacia',
      'sreshta',
      'zapazq',
      'zapisha',
      'kontakt',
      'obadi',
      'svurjete',
      'advokat',
      'kantora',
      'priem',
      'zaqvka',
    ],
  },

  pricing: {
    label: 'Въпрос за хонорар',
    priority: 'normal',
    baseWeight: 1.1,
    phrases: [
      'колко струва',
      'каква е цената',
      'адвокатски хонорар',
      'колко е консултацията',
      'безплатна ли е консултацията',
      'платена ли е консултацията',
      'kolko struva',
      'kakva e cenata',
      'advokatski honorar',
      'kolko e konsultaciqta',
      'bezplatna li e konsultaciqta',
    ],
    stems: [
      'цена',
      'струва',
      'такса',
      'хонорар',
      'пари',
      'плащане',
      'безплатно',
      'платено',
      'ценоразпис',
      'cena',
      'struva',
      'taksa',
      'honorar',
      'pari',
      'plashtane',
      'bezplatno',
      'plateno',
    ],
  },

  documents: {
    label: 'Документи / доказателства',
    priority: 'normal',
    baseWeight: 1.08,
    phrases: [
      'какви документи трябват',
      'какво да нося',
      'какво да подготвя',
      'какви доказателства',
      'имам заповед',
      'имам акт',
      'имам договор',
      'имам скрийншоти',
      'kakvi dokumenti trqbvat',
      'kakvo da nosq',
      'kakvo da podgotvq',
      'kakvi dokazatelstva',
      'imam zapoved',
      'imam akt',
      'imam dogovor',
      'imam skrinshoti',
    ],
    stems: [
      'документ',
      'документи',
      'доказателство',
      'доказателства',
      'свидетел',
      'свидетели',
      'договор',
      'скрийншот',
      'снимка',
      'имейл',
      'чат',
      'съобщение',
      'заповед',
      'акт',
      'протокол',
      'фиш',
      'постановление',
      'линк',
      'публикация',
      'dokumenti',
      'dokazatelstva',
      'svidetel',
      'svideteli',
      'dogovor',
      'skrinshot',
      'snimka',
      'email',
      'chat',
      'saobshtenie',
      'suobshtenie',
      'zapoved',
      'akt',
      'protokol',
      'fish',
      'link',
      'publikaciq',
    ],
  },

  civil: {
    label: 'Граждански спор',
    priority: 'normal',
    baseWeight: 1.05,
    phrases: [
      'дължат ми пари',
      'не ми връщат пари',
      'искам обезщетение',
      'договорен спор',
      'неизпълнен договор',
      'съседски спор',
      'dluzhat mi pari',
      'ne mi vrashtat pari',
      'iskam obezshtetenie',
      'dogovoren spor',
      'sasedski spor',
    ],
    stems: [
      'дълг',
      'пари',
      'обезщетение',
      'вреда',
      'вреди',
      'договор',
      'неизпълнение',
      'искова молба',
      'съсед',
      'имущество',
      'вземане',
      'заем',
      'разписка',
      'dlug',
      'pari',
      'obezshtetenie',
      'vredi',
      'dogovor',
      'neizpulnenie',
      'iskova molba',
      'sased',
      'imushtestvo',
      'zaem',
      'razpiska',
    ],
  },

  family: {
    label: 'Семейно право',
    priority: 'normal',
    baseWeight: 1.04,
    phrases: [
      'развод',
      'родителски права',
      'издръжка',
      'домашно насилие',
      'режим на лични отношения',
      'razvod',
      'roditelski prava',
      'izdrujka',
      'domashno nasilie',
      'rezhim na lichni otnosheniq',
    ],
    stems: [
      'развод',
      'издръжка',
      'дете',
      'деца',
      'родител',
      'родителски права',
      'семейно',
      'брак',
      'домашно насилие',
      'заповед за защита',
      'razvod',
      'izdrujka',
      'dete',
      'deca',
      'roditel',
      'semeino',
      'brak',
      'domashno nasilie',
      'zapoved za zashtita',
    ],
  },

  property: {
    label: 'Имотен спор',
    priority: 'normal',
    baseWeight: 1.04,
    phrases: [
      'имотен спор',
      'наследствен имот',
      'делба на имот',
      'проблем с нотариален акт',
      'съсед ми пречи',
      'imoten spor',
      'nasledstven imot',
      'delba na imot',
      'problem s notarialen akt',
    ],
    stems: [
      'имот',
      'нотариален акт',
      'наследство',
      'делба',
      'собственост',
      'владение',
      'съсед',
      'граница',
      'кадастър',
      'нотариус',
      'imot',
      'notarialen akt',
      'nasledstvo',
      'delba',
      'sobstvenost',
      'vladenie',
      'sased',
      'granica',
      'kadastur',
      'notarius',
    ],
  },

  consumer: {
    label: 'Потребителски спор',
    priority: 'normal',
    baseWeight: 1.04,
    phrases: [
      'измамиха ме',
      'не ми признават гаранция',
      'дефектна стока',
      'онлайн покупка',
      'iskam refund',
      'ne mi vrushtat parite',
      'defektna stoka',
    ],
    stems: [
      'потребител',
      'гаранция',
      'стока',
      'услуга',
      'дефект',
      'връщане',
      'refund',
      'поръчка',
      'онлайн магазин',
      'измама',
      'potrebitel',
      'garanciq',
      'stoka',
      'usluga',
      'defekt',
      'vrashtane',
      'porachka',
      'online magazin',
      'izmama',
    ],
  },
};

function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[„“”]/g, '"')
    .replace(/[!?;:()[\]{}]/g, ' ')
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function latinize(text = '') {
  return normalize(text)
    .split('')
    .map((char) => CYR_TO_LAT[char] ?? char)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(items = []) {
  return [...new Set(items.map((item) => normalize(item)).filter(Boolean))];
}

function shliokavicaVariants(term) {
  const variants = new Set([term]);

  for (const [from, to] of SHLIOKAVICA_EQUIV) {
    if (term.includes(from)) {
      variants.add(term.replaceAll(from, to));
    }
  }

  variants.add(term.replaceAll('ya', 'q'));
  variants.add(term.replaceAll('yu', 'u'));
  variants.add(term.replaceAll('sh', '6'));
  variants.add(term.replaceAll('ch', '4'));
  variants.add(term.replaceAll('sht', '6t'));

  return [...variants];
}

function buildTermVariants(term) {
  const base = normalize(term);
  const latin = latinize(base);

  const raw = new Set([
    base,
    latin,
    base.replaceAll('ъ', 'а'),
    base.replaceAll('й', 'и'),
    latin.replaceAll('y', 'i'),
    latin.replaceAll('a', 'q'),
  ]);

  for (const variant of [...raw]) {
    shliokavicaVariants(variant).forEach((item) => raw.add(item));
  }

  return unique([...raw]);
}

function buildExpandedSignalsForCategory(config) {
  const signals = [];

  for (const phrase of config.phrases) {
    for (const variant of buildTermVariants(phrase)) {
      signals.push({ term: variant, weight: 3.2, kind: 'phrase' });
    }
  }

  for (const stem of config.stems) {
    const variants = buildTermVariants(stem);
    const suffixes = /[a-z]/i.test(stem) ? LAT_SUFFIXES : BG_SUFFIXES;

    for (const variant of variants) {
      signals.push({ term: variant, weight: 1.35, kind: 'stem' });

      if (variant.length >= 4 && !variant.includes(' ')) {
        for (const suffix of suffixes) {
          signals.push({ term: `${variant}${suffix}`, weight: 0.9, kind: 'suffix' });
        }
      }

      for (const before of CONTEXT_BEFORE) {
        signals.push({ term: `${before} ${variant}`, weight: 1.6, kind: 'context_before' });
      }

      for (const after of CONTEXT_AFTER) {
        signals.push({ term: `${variant} ${after}`, weight: 1.45, kind: 'context_after' });
      }

      for (const legal of GENERAL_LEGAL_CONTEXT) {
        if (variant.length >= 5) {
          signals.push({ term: `${variant} ${legal}`, weight: 0.55, kind: 'legal_context' });
          signals.push({ term: `${legal} ${variant}`, weight: 0.55, kind: 'legal_context' });
        }
      }
    }
  }

  const map = new Map();

  for (const signal of signals) {
    if (!signal.term || signal.term.length < 3) continue;

    const existing = map.get(signal.term);

    if (!existing || signal.weight > existing.weight) {
      map.set(signal.term, signal);
    }
  }

  return [...map.values()];
}

const EXPANDED_LEXICON = Object.fromEntries(
  Object.entries(CATEGORY_PACKS).map(([intent, config]) => [
    intent,
    buildExpandedSignalsForCategory(config),
  ])
);

const LEXICON_DIAGNOSTICS = Object.fromEntries(
  Object.entries(EXPANDED_LEXICON).map(([intent, signals]) => [intent, signals.length])
);

function countSignalHits(text, signals) {
  let score = 0;
  const hits = [];

  for (const signal of signals) {
    if (text.includes(signal.term)) {
      score += signal.weight;
      hits.push(signal.term);
    }
  }

  return {
    score,
    hits: hits.slice(0, 20),
  };
}

function isVeryShortOrLowQuality(message = '') {
  const clean = normalize(message);

  if (!clean) return true;
  if (clean.length < 4) return true;
  if (LOW_QUALITY_PATTERNS.includes(clean)) return true;

  const words = clean.split(' ').filter(Boolean);

  if (words.length <= 2 && LOW_QUALITY_PATTERNS.some((item) => clean.includes(item))) {
    return true;
  }

  const compact = clean.replace(/[^a-zа-я0-9]/gi, '');
  if (compact.length > 0 && compact.length <= 4) return true;

  return false;
}

export function getLexiconDiagnostics() {
  const legacy = {
    categories: LEXICON_DIAGNOSTICS,
    totalSignals: Object.values(LEXICON_DIAGNOSTICS).reduce((sum, value) => sum + value, 0),
  };

  return {
    ...legacy,
    ...getDiagnostics(),
  };
}

export function containsContact(message = '') {
  return CONTACT_RE.test(message);
}

export function detectUrgency(message = '') {
  const text = normalize(message);
  const latin = latinize(text);
  return URGENCY_WORDS.some((word) => text.includes(word) || latin.includes(word));
}

export function detectLegalIntent(message = '') {
  const result = analyzeLegalMessage({ message });

  return {
    intent: result.detectedIntent,
    subtype: result.subtype,
    confidence: result.confidence,
    label: result.label,
    scores: result.scores,
    hits: result.hits,
    entities: result.entities,
    urgency: result.urgency,
  };
}

function detectLegacyLegalIntent(message = '') {
  const text = normalize(message);
  const latin = latinize(text);
  const searchable = unique([text, latin, ...shliokavicaVariants(latin)]).join(' | ');

  if (!text || isVeryShortOrLowQuality(text)) {
    return {
      intent: 'unknown',
      confidence: 0,
      label: 'Неуточнен казус',
      scores: {},
      hits: {},
    };
  }

  const scores = {};
  const hits = {};

  for (const [intent, signals] of Object.entries(EXPANDED_LEXICON)) {
    const result = countSignalHits(searchable, signals);
    scores[intent] = result.score * CATEGORY_PACKS[intent].baseWeight;
    hits[intent] = result.hits;
  }

  if (
    scores.discrimination > 0 &&
    /facebook|фейсбук|fb|tiktok|тик ток|instagram|инстаграм|пост|коментар|публикац|онлайн/.test(
      searchable
    )
  ) {
    scores.hateSpeech += 5.4;
  }

  if (
    scores.administrative > 0 &&
    /полиция|polici|полицай|акт|akt|глоба|globa|фиш|fish|наказателно постановление/.test(
      searchable
    )
  ) {
    scores.administrative += 5.2;
  }

  if (
    scores.employment > 0 &&
    /уволн|uvoln|дисциплинар|disciplinar|работодател|rabotodatel|заповед за уволнение/.test(
      searchable
    )
  ) {
    scores.employment += 5.4;
  }

  const ranked = Object.entries(scores)
    .map(([intent, score]) => ({ intent, score }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best || best.score <= 0.2) {
    return {
      intent: 'general',
      confidence: 0.18,
      label: 'Общ правен въпрос',
      scores,
      hits,
    };
  }

  const second = ranked[1]?.score || 0;
  const margin = best.score - second;

  return {
    intent: best.intent,
    confidence: Math.min(1, Math.max(0.2, (best.score + margin) / 12)),
    label: CATEGORY_PACKS[best.intent]?.label || best.intent,
    scores,
    hits,
  };
}

function buildContactReply(intent, confidence) {
  return {
    reply:
      'Благодаря. Контактът може да бъде записан към разговора и предаден към кантората. Пазете документи, скрийншоти, линкове, заповеди или актове, защото може да са важни при преценка на казуса.',
    detectedIntent: intent,
    confidence,
    shouldShowContactForm: false,
    priority: 'normal',
  };
}

function replyForUnknown() {
  return {
    reply:
      'Не мога да разбера казуса само от това съобщение. Напишете накратко какво се е случило, кога е станало и дали имате документ, акт, заповед, съобщения или скрийншоти. Например: „Уволниха ме дисциплинарно“, „Получих акт от полицията“ или „Писаха обидни неща за мен онлайн“.',
    shouldShowContactForm: false,
    priority: 'normal',
  };
}

function replyForEmployment(text, urgent) {
  const disciplinary = /дисциплинар|disciplinar|дисциплинарка/.test(text);
  const dismissed = /уволн|uvoln|прекрат|prekrat/.test(text);

  if (disciplinary || dismissed) {
    return {
      reply:
        'При уволнение най-важни са: заповедта, датата на връчване, мотивите, дали са поискани писмени обяснения и дали процедурата е спазена. Пазете трудов договор, заповед, писмени обяснения, съобщения, графици, фишове и кореспонденция с работодателя. Не е добре да се изчаква, защото при трудови спорове сроковете могат да са решаващи.\n\nКога ви беше връчена заповедта или кога разбрахте за уволнението?',
      shouldShowContactForm: true,
      priority: 'high',
    };
  }

  return {
    reply:
      'При трудов спор трябва да се уточни дали става дума за уволнение, неплатена заплата, дисциплинарно наказание, отпуск, болничен или друг проблем. Пазете договора, фишове, заповеди и писмена кореспонденция. Конкретна преценка се прави след преглед на документите.\n\nКакъв точно е трудовият проблем?',
    shouldShowContactForm: true,
    priority: urgent ? 'high' : 'normal',
  };
}

function replyForDiscrimination(urgent) {
  return {
    reply:
      'При съмнение за дискриминация са важни фактите: какво точно се е случило, кога, къде, кой е участвал и дали има свидетели или доказателства. Пазете съобщения, снимки, документи, имена, дати и всичко, което показва различно отношение заради личен признак. Това е чувствителен казус и е добре да се обсъди внимателно с адвокат.\n\nИмате ли свидетели, съобщения, снимки или друг вид доказателство?',
    shouldShowContactForm: true,
    priority: urgent ? 'high' : 'normal',
  };
}

function replyForHateSpeech() {
  return {
    reply:
      'При обидно или омразно съдържание онлайн първо запазете доказателствата: скрийншоти, линк, профил, дата, час и точния текст. След това трябва да се прецени дали става дума за обида, клевета, заплаха, дискриминационно съдържание или омразна реч. Контекстът и точните думи са решаващи.\n\nПазите ли скрийншот и линк към публикацията или профила?',
    shouldShowContactForm: true,
    priority: 'normal',
  };
}

function replyForAdministrative() {
  return {
    reply:
      'Когато има акт, заповед или документ от институция, най-важни са видът на документа, датата на връчване и срокът за обжалване. Не е добре да се изчаква, защото при административни актове сроковете често са кратки. Запазете оригинала и всички приложения към него.\n\nКакъв точно документ получихте и на коя дата ви беше връчен?',
    shouldShowContactForm: true,
    priority: 'high',
  };
}

function replyForCriminal() {
  return {
    reply:
      'Ако има полиция, прокуратура, призовка, задържане или досъдебно производство, е важно да не подписвате документи, които не разбирате, и да потърсите адвокатска помощ възможно най-скоро. Запазете призовки, протоколи, актове и имена на служители или свидетели.\n\nИмате ли призовка, протокол или друг документ от полиция или прокуратура?',
    shouldShowContactForm: true,
    priority: 'high',
  };
}

function replyForPricing() {
  return {
    reply:
      'Хонорарът зависи от вида на казуса, сложността, спешността, документите и дали става дума само за консултация или за процесуално представителство. Най-точно може да се каже след кратко описание на случая.\n\nЗа какъв тип казус става дума?',
    shouldShowContactForm: true,
    priority: 'normal',
  };
}

function replyForBooking() {
  return {
    reply:
      'Можете да запазите консултация чрез формата на сайта, като оставите име, телефон или имейл, правна област и кратко описание на казуса. След изпращане заявката се записва и се изпраща към кантората. Ако случаят е спешен, отбележете това в описанието.\n\nЖелаете ли да оставите телефон или имейл за връзка?',
    shouldShowContactForm: true,
    priority: 'normal',
  };
}

function replyForDocuments() {
  return {
    reply:
      'Най-полезно е да подготвите всички документи, свързани със случая: заповеди, договори, актове, съобщения, скрийншоти, имейли, свидетелски данни и точни дати. Не изпращайте излишно чувствителни данни в чата. За конкретна преценка адвокатът трябва да види документите и хронологията.\n\nКакъв документ имате в момента?',
    shouldShowContactForm: true,
    priority: 'normal',
  };
}

function replyForCivil() {
  return {
    reply:
      'При граждански спор са важни договорите, разписките, кореспонденцията, датите и доказателствата за вреди или неизпълнение. За да се прецени дали има основание за претенция, трябва да се види какво точно е уговорено и какво не е изпълнено.\n\nИмате ли договор, разписка, съобщения или друг документ?',
    shouldShowContactForm: true,
    priority: 'normal',
  };
}

function replyForFamily() {
  return {
    reply:
      'При семеен казус е важно да се уточни дали става дума за развод, родителски права, издръжка, домашно насилие или режим на лични отношения. Ако има риск за дете или насилие, не трябва да се изчаква.\n\nКакъв точно е семейният проблем?',
    shouldShowContactForm: true,
    priority: 'normal',
  };
}

function replyForProperty() {
  return {
    reply:
      'При имотен спор са важни нотариалният акт, документи за собственост, скици, наследствени документи, договори и точната хронология. Добре е да се прегледат документите преди да се предприемат действия.\n\nС какъв имотен документ разполагате?',
    shouldShowContactForm: true,
    priority: 'normal',
  };
}

function replyForConsumer() {
  return {
    reply:
      'При потребителски спор са важни касова бележка, договор, гаранция, кореспонденция с търговеца, снимки и доказателства за дефекта или отказа. Пазете всички съобщения и документи.\n\nСтава дума за стока, услуга, гаранция или онлайн покупка?',
    shouldShowContactForm: true,
    priority: 'normal',
  };
}

function replyForGeneral() {
  return {
    reply:
      'Мога да дам само обща първоначална ориентация. За да ви насоча правилно, опишете накратко какво се е случило, кога е станало и дали има документ, заповед, акт, съобщения или скрийншоти. Ако въпросът е конкретен правен казус, най-сигурният вариант е консултация с адвокат.\n\nКакъв е проблемът?',
    shouldShowContactForm: false,
    priority: 'normal',
  };
}

export function buildLegalFallbackReply({ message, previousState = {} }) {
  return analyzeLegalMessage({ message, previousState });
}
