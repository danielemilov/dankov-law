import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

router.post('/', async (req, res) => {
  // Тук по-късно може да вържем inbound WhatsApp съобщенията към същия ChatSession/ChatMessage модел.
  // Засега пазим endpoint-а готов за Meta webhook verification и приемане на payload.
  console.log('WhatsApp webhook payload:', JSON.stringify(req.body));
  res.sendStatus(200);
});

export default router;
