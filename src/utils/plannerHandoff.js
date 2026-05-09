export const PLANNER_HANDOFF_STORAGE_KEY = 'dp_planner_handoff';
export const PLANNER_HANDOFF_EVENT = 'dp-planner-handoff';

const MAX_HANDOFF_CHARS = 7000;
const PLANNER_MESSAGE_PREFIX = 'AI planner draft for the team';

const fallbackMessage = [
  PLANNER_MESSAGE_PREFIX,
  '',
  'The guest opened the AI planner and clicked "Send draft to the team" before a chat draft was created.',
  '',
  'Please help them build the trip, check availability, and send a quote.',
].join('\n');

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }))
    .filter((item) => item.content);
}

function clipTranscript(transcript) {
  if (transcript.length <= MAX_HANDOFF_CHARS) {
    return { transcript, clipped: false };
  }

  return {
    transcript: transcript.slice(transcript.length - MAX_HANDOFF_CHARS).trimStart(),
    clipped: true,
  };
}

export function isPlannerHandoffMessage(message = '') {
  return typeof message === 'string' && message.startsWith(PLANNER_MESSAGE_PREFIX);
}

export function buildPlannerHandoff(history, sourcePath = '') {
  const messages = cleanHistory(history);
  const createdAt = new Date().toISOString();

  if (messages.length === 0) {
    return {
      createdAt,
      messageCount: 0,
      sourcePath,
      subject: PLANNER_MESSAGE_PREFIX,
      transcript: '',
      message: fallbackMessage,
    };
  }

  const fullTranscript = messages
    .map((item) => `${item.role === 'user' ? 'Guest' : 'Planner'}: ${item.content}`)
    .join('\n\n');
  const { transcript, clipped } = clipTranscript(fullTranscript);

  const message = [
    PLANNER_MESSAGE_PREFIX,
    sourcePath ? `Source: ${sourcePath}` : '',
    `Created: ${createdAt}`,
    clipped ? 'Note: This includes the latest part of a longer planner chat.' : '',
    '',
    transcript,
    '',
    'Please review this draft, check availability, and send a quote.',
  ]
    .filter((line) => line !== null)
    .join('\n');

  return {
    createdAt,
    messageCount: messages.length,
    sourcePath,
    subject: PLANNER_MESSAGE_PREFIX,
    transcript,
    message,
  };
}

export function savePlannerHandoff(history, sourcePath = '') {
  const handoff = buildPlannerHandoff(history, sourcePath);

  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PLANNER_HANDOFF_STORAGE_KEY, JSON.stringify(handoff));
      window.dispatchEvent(new CustomEvent(PLANNER_HANDOFF_EVENT, { detail: handoff }));
    }
  } catch {
    // The visible form still opens even if storage is unavailable.
  }

  return handoff;
}

export function readPlannerHandoff() {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(PLANNER_HANDOFF_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.subject !== PLANNER_MESSAGE_PREFIX || typeof parsed.message !== 'string') {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
