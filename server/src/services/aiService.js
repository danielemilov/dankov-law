import {
  buildLegalFallbackReply,
  detectLegalIntent,
  getLexiconDiagnostics,
} from './legalFallbackService.js';

const SYSTEM_PROMPT = `
Ти си AI асистент на адвокат Диян Данков от Разград, България.

Твоята роля:
- Даваш само обща правна информация.
- Не даваш конкретен правен съвет.
- Не обещаваш резултат.
- Насочваш към консултация, когато има срокове, документи, актове, уволнение, дискриминация, омразна реч, полиция или институция.
- Отговаряш на български език.
- Пишеш кратко, ясно и професионално.
- Ако казусът е неясен, задаваш 1–2 конкретни уточняващи въпроса.
- Ако потребителят остави контакт, казваш, че контактът може да бъде записан и предаден към кантората.

Важен disclaimer:
Чатът дава само обща информация и не представлява конкретен правен съвет.
`;

export function detectIntent(message = '') {
  return detectLegalIntent(message).intent;
}

function fallbackResult(userText, legalState = {}) {
  const result = buildLegalFallbackReply({
    message: userText,
    previousState: legalState,
  });

  return {
    reply: result.reply,
    model: 'fallback-lexicon-5000-signals',
    fallback: true,
    detectedIntent: result.detectedIntent || 'unknown',
    confidence: result.confidence ?? 0,
    priority: result.priority || 'normal',
    shouldShowContactForm: Boolean(result.shouldShowContactForm),
    label: result.label,
    subtype: result.subtype,
    legalState: result.legalState,
    entities: result.entities,
    urgency: result.urgency,
    scores: result.scores,
    hits: result.hits,
    diagnostics: getLexiconDiagnostics(),
  };
}

export async function getAssistantReply({ history = [], userText = '', legalState = {} }) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackResult(userText, legalState);
  }

  const local = buildLegalFallbackReply({
    message: userText,
    previousState: legalState,
  });

  try {
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...history.slice(-8).map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      })),
      {
        role: 'user',
        content: userText,
      },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.35,
        max_tokens: 420,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('OpenAI API error:', body);
      return fallbackResult(userText, legalState);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return fallbackResult(userText, legalState);
    }

    return {
      reply,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      fallback: false,
      detectedIntent: local.detectedIntent || 'unknown',
      confidence: local.confidence ?? 0,
      priority: local.priority || 'normal',
      shouldShowContactForm: Boolean(local.shouldShowContactForm),
      label: local.label,
      subtype: local.subtype,
      legalState: local.legalState,
      entities: local.entities,
      urgency: local.urgency,
      scores: local.scores,
      hits: local.hits,
      diagnostics: getLexiconDiagnostics(),
    };
  } catch (error) {
    console.error('AI service failed:', error.message);
    return fallbackResult(userText, legalState);
  }
}
