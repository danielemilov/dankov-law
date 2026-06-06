# Dankov Law — MERN Starter

Професионален MERN starter за адвокатски сайт с:

- React + Vite клиент
- Express API
- MongoDB/Mongoose модели
- Booking форма
- AI чат асистент
- Email нотификации
- Optional WhatsApp Cloud API нотификации

## Първо стартиране

```bash
cd dankov-law-mern-starter
cp server/.env.example server/.env
npm install
npm run dev
```

Клиент: http://localhost:5173
API: http://localhost:5000/api/health

## Минимални env настройки

За локален старт без реален AI/Email можеш да оставиш ключовете празни. Чатът ще работи с fallback логика.

За реален AI:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.5
```

За email:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
LAWYER_EMAIL=...
```

За WhatsApp Cloud API:

```env
WHATSAPP_ENABLED=true
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
LAWYER_WHATSAPP_PHONE=35988XXXXXXX
META_VERIFY_TOKEN=some-secret-token
```

## Архитектура

```text
client/                 React UI
server/                 Express API
server/src/models       Mongoose schemas
server/src/routes       API routes
server/src/services     AI, email, WhatsApp, notification services
```

## Забележка

AI асистентът не дава конкретен правен съвет. Той дава обща информация, събира контакти и насочва към консултация.
