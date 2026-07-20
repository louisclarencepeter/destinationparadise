// Extracts the guest's contact details from planner chat history so the
// client can include them in the /api/planner-send handoff request.

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d[\d\s().-]{6,}\d)/;
const NAME_PROMPT_REGEX = /\b(your\s+name|may\s+i\s+have\s+your\s+name|what'?s\s+your\s+name|could\s+i\s+have\s+your\s+name|can\s+i\s+get\s+your\s+name)\b/i;

export function extractContact(messages) {
  const contact = { name: '', email: '', phone: '' };

  for (let i = 0; i < messages.length; i += 1) {
    const message = messages[i];
    if (message.role !== 'user') continue;

    if (!contact.email) {
      const emailMatch = message.content.match(EMAIL_REGEX);
      if (emailMatch) contact.email = emailMatch[0];
    }

    if (!contact.phone) {
      const cleaned = message.content.replace(EMAIL_REGEX, '');
      const phoneMatch = cleaned.match(PHONE_REGEX);
      if (phoneMatch) contact.phone = phoneMatch[0].trim();
    }

    if (!contact.name && i > 0 && messages[i - 1].role === 'assistant' && NAME_PROMPT_REGEX.test(messages[i - 1].content)) {
      const candidate = message.content.trim();
      if (candidate && candidate.length <= 60 && !EMAIL_REGEX.test(candidate) && !/\d{4,}/.test(candidate)) {
        contact.name = candidate.replace(/^(my\s+name\s+is|i'?m|it'?s|this\s+is)\s+/i, '').replace(/[.!]+$/, '').trim();
      }
    }
  }

  return contact;
}
