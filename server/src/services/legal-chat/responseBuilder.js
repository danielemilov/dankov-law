import { rememberQuestion } from './conversationState.js';

const DISCLAIMER =
  'Чатът дава само обща първоначална информация и не представлява конкретен правен съвет.';

function withDisclaimer(text) {
  return `${text}\n\n${DISCLAIMER}`;
}

function asked(state, key) {
  return state.askedQuestions?.includes(key);
}

function employmentReply(classification, entities, state, urgency) {
  if (classification.subtype === 'unpaidSalary') {
    return {
      text: 'При неплатено трудово възнаграждение са важни трудовият договор, фишовете, банковите извлечения и кореспонденцията с работодателя. Добре е да се уточни за кои месеци не е платено и дали има писмена комуникация.',
      question: 'За кои месеци не е изплатена заплатата?',
      questionKey: 'unpaidSalaryMonths',
      priority: urgency.urgent ? 'high' : 'normal',
    };
  }

  if (classification.subtype === 'workingWithoutContract') {
    return {
      text: 'При работа без писмен трудов договор са важни доказателствата, че реално сте работили - графици, чатове, свидетели, плащания, снимки и инструкции от работодателя.',
      question: 'От кога работите там и имате ли някакви писмени съобщения или плащания?',
      questionKey: 'noContractPeriod',
      priority: 'high',
    };
  }

  if (classification.subtype === 'sickLeave') {
    return {
      text: 'При проблем с болничен и работодател са важни датите, болничният лист, заповедите и комуникацията с работодателя. Ако има уволнение около болничен, сроковете може да са важни.',
      question: 'Уволнението или заповедта преди, по време или след болничния беше?',
      questionKey: 'sickLeaveTiming',
      priority: 'high',
    };
  }

  const hasDate = Boolean(state.knownFacts?.receivedDate || entities.mentionedDate);
  return {
    text: 'При уволнение обикновено са важни заповедта, датата на връчване, посоченото основание, дали са поискани писмени обяснения и какви документи са дадени от работодателя. Не е добре да се изчаква, защото при трудови спорове сроковете могат да са решаващи.',
    question: hasDate || asked(state, 'dismissalDate')
      ? 'Какво основание е посочено в заповедта?'
      : 'На коя дата ви беше връчена заповедта?',
    questionKey: hasDate || asked(state, 'dismissalDate') ? 'dismissalGround' : 'dismissalDate',
    priority: 'high',
  };
}

function byIntent(classification, entities, state, urgency) {
  switch (classification.intent) {
    case 'employment':
      return employmentReply(classification, entities, state, urgency);
    case 'administrative':
      return {
        text: 'Когато има акт, фиш, наказателно постановление или заповед от институция, най-важни са видът на документа, датата на връчване и срокът за обжалване. Запазете оригинала и всички приложения.',
        question: 'Какъв точно документ получихте и на коя дата беше връчен?',
        questionKey: 'administrativeDocumentDate',
        priority: 'high',
      };
    case 'criminal':
      return {
        text: 'При полиция, прокуратура, призовка, задържане или досъдебно производство е важно да не подписвате документи, които не разбирате, и да потърсите адвокатска помощ възможно най-скоро.',
        question: 'Имате ли призовка, протокол или друг документ от полиция или прокуратура?',
        questionKey: 'criminalDocument',
        priority: 'high',
      };
    case 'family':
      return {
        text: 'При семеен казус трябва да се уточни дали става дума за развод, родителски права, издръжка, домашно насилие или режим на лични отношения. Ако има риск за дете или насилие, не трябва да се изчаква.',
        question: classification.subtype === 'domesticViolence'
          ? 'Има ли непосредствен риск за вас или дете в момента?'
          : 'Какъв точно е семейният проблем?',
        questionKey: 'familySubtype',
        priority: urgency.urgent || classification.subtype === 'domesticViolence' ? 'high' : 'normal',
      };
    case 'discrimination':
      return {
        text: 'При съмнение за дискриминация са важни фактите: какво точно се е случило, кога, къде, кой е участвал и дали има свидетели или доказателства. Пазете съобщения, снимки, документи, имена и дати.',
        question: 'Имате ли свидетели, съобщения, снимки или друг вид доказателство?',
        questionKey: 'discriminationEvidence',
        priority: urgency.urgent ? 'high' : 'normal',
      };
    case 'hateSpeech':
      return {
        text: 'При обидно, клеветническо или омразно съдържание онлайн първо запазете доказателствата: скрийншоти, линк, профил, дата, час и точния текст. После се преценява дали е обида, клевета, заплаха, дискриминационно съдържание или омразна реч.',
        question: 'Пазите ли скрийншот и линк към публикацията или профила?',
        questionKey: 'onlineEvidence',
        priority: urgency.urgent ? 'high' : 'normal',
      };
    case 'property':
      return {
        text: 'При имотен спор са важни нотариалният акт, договорите, документите за собственост, скици, наследствени документи и точната хронология.',
        question: 'С какъв имотен документ разполагате?',
        questionKey: 'propertyDocument',
        priority: 'normal',
      };
    case 'consumer':
      return {
        text: 'При потребителски спор са важни касова бележка, договор, гаранция, кореспонденция с търговеца, снимки и доказателства за дефекта или отказа.',
        question: 'Става дума за стока, услуга, гаранция или онлайн покупка?',
        questionKey: 'consumerSubtype',
        priority: 'normal',
      };
    case 'civil':
      return {
        text: 'При граждански спор са важни договорите, разписките, кореспонденцията, датите и доказателствата за вреди или неизпълнение.',
        question: 'Имате ли договор, разписка, съобщения или друг документ?',
        questionKey: 'civilEvidence',
        priority: 'normal',
      };
    case 'pricing':
      return {
        text: 'Хонорарът зависи от вида на казуса, сложността, спешността, документите и дали става дума само за консултация или за процесуално представителство.',
        question: 'За какъв тип казус става дума?',
        questionKey: 'pricingCaseType',
        priority: 'normal',
      };
    case 'booking':
      return {
        text: 'Можете да заявите консултация чрез формата на сайта, като оставите име, телефон или имейл и кратко описание на казуса.',
        question: 'Желаете ли да оставите телефон или имейл за връзка?',
        questionKey: 'bookingContact',
        priority: 'normal',
      };
    case 'documents':
      return {
        text: 'Най-полезно е да подготвите всички документи, свързани със случая: заповеди, договори, актове, съобщения, скрийншоти, имейли, свидетелски данни и точни дати.',
        question: 'Какъв документ имате в момента?',
        questionKey: 'documentType',
        priority: urgency.urgent ? 'high' : 'normal',
      };
    default:
      return null;
  }
}

export function buildResponse({ classification, entities, urgency, state }) {
  if (entities.contactDetected) {
    return {
      reply: withDisclaimer('Благодаря. Контактът може да бъде записан към разговора и предаден към кантората. Пазете документи, скрийншоти, линкове, заповеди или актове, защото може да са важни при преценка на казуса.'),
      state,
      shouldShowContactForm: false,
      priority: 'normal',
    };
  }

  if (classification.intent === 'ambiguous') {
    return {
      reply: withDisclaimer(classification.clarifyQuestion),
      state,
      shouldShowContactForm: false,
      priority: 'normal',
    };
  }

  if (classification.intent === 'unknown') {
    return {
      reply: withDisclaimer('Не мога да разбера казуса само от това съобщение. Напишете накратко какво се е случило, кога е станало и дали имате документ, акт, заповед, съобщения или скрийншоти. Например: „Уволниха ме дисциплинарно“, „Получих акт от полицията“ или „Писаха обидни неща за мен онлайн“.'),
      state,
      shouldShowContactForm: false,
      priority: 'normal',
    };
  }

  const base = byIntent(classification, entities, state, urgency);
  if (!base) {
    return {
      reply: withDisclaimer('Мога да дам само обща първоначална ориентация. Опишете какво се е случило, кога е станало и дали има документ, заповед, акт, съобщения или скрийншоти.'),
      state,
      shouldShowContactForm: false,
      priority: 'normal',
    };
  }

  const nextState = rememberQuestion(state, base.questionKey);
  const urgencyLine = urgency.urgent
    ? '\n\nПонеже споменавате срок, връчване, заседание, заплаха или друг спешен елемент, е добре да не се отлага преглед от адвокат.'
    : '';

  return {
    reply: withDisclaimer(`${base.text}${urgencyLine}\n\n${base.question}`),
    state: nextState,
    shouldShowContactForm:
      base.priority === 'high' ||
      urgency.urgent ||
      ['employment', 'discrimination', 'hateSpeech', 'administrative', 'criminal', 'family'].includes(classification.intent),
    priority: base.priority || (urgency.urgent ? 'high' : 'normal'),
  };
}
