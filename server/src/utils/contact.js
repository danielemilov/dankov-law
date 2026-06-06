export function extractContact(text = '') {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = text.match(/(?:\+?359|0)\s?8[789]\s?\d{3}\s?\d{3}|\+?\d[\d\s().-]{7,}\d/)?.[0] || '';
  return { email, phone };
}

export function shouldEscalate(text = '') {
  const value = text.toLowerCase();
  const urgentWords = [
    'спешно', 'днес', 'утре', 'срок', 'уволнение', 'дискриминац', 'омраз',
    'полиция', 'заповед', 'арест', 'съд', 'дело', 'контакт', 'телефон', '@'
  ];
  return urgentWords.some((word) => value.includes(word));
}
