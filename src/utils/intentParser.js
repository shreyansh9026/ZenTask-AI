// src/utils/intentParser.js - Rule-based intent detection
// This bot is designed by Shreyansh Tripathi.
const PREFIX = (process.env.BOT_PREFIX || '!').toLowerCase();

const DATETIME_PATTERNS = [
  /\b(what('?s| is) (the )?(time|date|day))\b/i,
  /\bwhat (time|date|day) is it\b/i,
  /\b(current|today'?s?) (time|date|day)\b/i,
  /\bwhat day is (it|today)\b/i,
  /\btell me the (time|date)\b/i,
  /\b(time|date) (right )?now\b/i,
];

const TASK_ADD_PATTERNS = [
  /^(add|create|new|make|set) (a |an )?(task|todo|reminder|note)[:\s]/i,
  /^(remind me to|remember to|i need to|don'?t forget to)\s+.+/i,
  /^(add|create|note)\s+.{3,}/i,
];

const TASK_VIEW_PATTERNS = [
  /\b(show|list|view|display|get|check)\s+(my |all )?(tasks?|todos?)\b/i,
  /\bwhat('?s| are) (my )?(tasks?|todos?)\b/i,
];

const TASK_CLEAR_PATTERNS = [
  /\b(clear|remove|delete)\s+(all\s+)?(my\s+)?(tasks?|todos?)\b/i,
  /\b(delete|remove)\s+everything\s+from\s+(my\s+)?(tasks?|todos?)\b/i,
];

const TASK_DELETE_PATTERNS = [
  /\b(delete|remove|cancel|drop)\s+(task\s*)?#?(\d+)\b/i,
];

const TASK_DONE_PATTERNS = [
  /\b(done|complete|finish|mark)\s+(task\s*)?#?(\d+)\b/i,
  /\btask\s*#?(\d+)\s+(is\s+)?(done|complete|finished)\b/i,
];

const REMINDER_PATTERNS = [
  /\bremind me (at|in|after)\b/i,
  /\bset (a )?reminder\b/i,
];

const NEWS_PATTERNS = [
  /\b(latest|recent|breaking|today'?s?) news\b/i,
  /\bwhat'?s? (happening|going on) (today|now|in the world)\b/i,
  /\bheadlines\b/i,
];

const NOTE_ADD_PATTERNS = [
  /^(add|save|create|write|make) (a |an )?(note|memo)[:\s]/i,
  /^note[:\s]+.{2,}/i,
];

const NOTE_VIEW_PATTERNS = [
  /\b(show|list|view|display|get)\s+(my |all )?notes?\b/i,
  /\bwhat('?s| are) (my )?notes?\b/i,
];

const NOTE_CLEAR_PATTERNS = [
  /\b(clear|remove|delete)\s+(all\s+)?(my\s+)?notes?\b/i,
];

const NOTE_DELETE_PATTERNS = [
  /\b(delete|remove|archive)\s+(note\s*)?#?(\d+)\b/i,
];

const SEARCH_PATTERNS = [
  /\b(search|find|look up|google|look for)\b/i,
  /\b(current|latest|recent|today'?s?|live|now)\s+(events?|news|results?|scores?|standings?)\b/i,
  /\bwho (won|lost|is winning)\b/i,
  /\bwhat('?s| is) (currently|happening|going on)\b/i,
  /\b(this week|this month|right now)\s+.{5,}/i,
];

const GREETING_PATTERNS = [
  /^(hi|hello|hey|yo|sup|hola)\b/i,
];

function extractTaskId(text = '') {
  const match = text.match(/#?(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function detectIntentRuleBased(content) {
  const text = content.trim();

  if (text.startsWith(PREFIX)) {
    const [cmd = '', ...rest] = text.slice(PREFIX.length).trim().split(/\s+/);
    const arg = rest.join(' ');

    switch (cmd.toLowerCase()) {
      case 'addtask':
      case 'task':
        return { intent: 'task_add', arg };
      case 'tasks':
      case 'mytasks':
      case 'listtasks':
        return { intent: 'task_view', arg: null };
      case 'cleartasks':
      case 'clearalltasks':
      case 'resettasks':
        return { intent: 'task_clear', arg: null };
      case 'deletetask':
      case 'deltask':
      case 'removetask':
        return { intent: 'task_delete', arg: extractTaskId(arg) };
      case 'donetask':
      case 'completetask':
      case 'finishtask':
        return { intent: 'task_done', arg: extractTaskId(arg) };
      case 'addnote':
      case 'note':
        return { intent: 'note_add', arg };
      case 'notes':
      case 'mynotes':
      case 'listnotes':
        return { intent: 'note_view', arg: null };
      case 'clearnotes':
      case 'clearallnotes':
      case 'resetnotes':
        return { intent: 'note_clear', arg: null };
      case 'deletenote':
      case 'removenote':
        return { intent: 'note_delete', arg: extractTaskId(arg) };
      case 'search':
      case 'find':
        return { intent: 'search', arg };
      case 'remind':
      case 'reminder':
        return { intent: 'reminder', arg };
      case 'news':
        return { intent: 'news', arg };
      case 'time':
      case 'date':
        return { intent: 'datetime', arg: null };
      case 'help':
        return { intent: 'help', arg: null };
      case 'ping':
        return { intent: 'ping', arg: null };
      default:
        return null;
    }
  }

  if (DATETIME_PATTERNS.some((pattern) => pattern.test(text))) {
    return { intent: 'datetime', arg: null };
  }

  if (TASK_VIEW_PATTERNS.some((pattern) => pattern.test(text))) {
    return { intent: 'task_view', arg: null };
  }

  if (TASK_CLEAR_PATTERNS.some((pattern) => pattern.test(text))) {
    return { intent: 'task_clear', arg: null };
  }

  for (const pattern of TASK_DELETE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return { intent: 'task_delete', arg: parseInt(match[match.length - 1], 10) };
    }
  }

  for (const pattern of TASK_DONE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return { intent: 'task_done', arg: parseInt(match[match.length - 1], 10) };
    }
  }

  if (REMINDER_PATTERNS.some((pattern) => pattern.test(text))) {
    return { intent: 'reminder', arg: text };
  }

  if (NEWS_PATTERNS.some((pattern) => pattern.test(text))) {
    return { intent: 'news', arg: null };
  }

  if (SEARCH_PATTERNS.some((pattern) => pattern.test(text))) {
    return { intent: 'search', arg: text };
  }

  if (NOTE_VIEW_PATTERNS.some((pattern) => pattern.test(text))) {
    return { intent: 'note_view', arg: null };
  }

  if (NOTE_CLEAR_PATTERNS.some((pattern) => pattern.test(text))) {
    return { intent: 'note_clear', arg: null };
  }

  for (const pattern of NOTE_DELETE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return { intent: 'note_delete', arg: parseInt(match[match.length - 1], 10) };
    }
  }

  if (NOTE_ADD_PATTERNS.some((pattern) => pattern.test(text))) {
    const cleaned = text
      .replace(/^(add|save|create|write|make) (a |an )?(note|memo)[:\s]*/i, '')
      .replace(/^note[:\s]+/i, '')
      .trim();
    return { intent: 'note_add', arg: cleaned || text };
  }

  if (TASK_ADD_PATTERNS.some((pattern) => pattern.test(text))) {
    const cleaned = text
      .replace(/^(add|create|new|make|set) (a |an )?(task|todo|reminder)[:\s]*/i, '')
      .replace(/^(remind me to|remember to|i need to|don'?t forget to)\s*/i, '')
      .trim();
    return { intent: 'task_add', arg: cleaned || text };
  }

  if (GREETING_PATTERNS.some((pattern) => pattern.test(text))) {
    return { intent: 'general', arg: text };
  }

  return null;
}

function parseReminderText(text) {
  const inMatch = text.match(/\bin\s+(\d+)\s*(minute|min|hour|hr|second|sec)s?\b/i);
  const atMatch = text.match(/\bat\s+(\d{1,2}):(\d{2})\s*(am|pm)?\b/i);

  let minutes = null;

  if (inMatch) {
    const value = parseInt(inMatch[1], 10);
    const unit = inMatch[2].toLowerCase();

    if (unit.startsWith('sec')) {
      minutes = Math.ceil(value / 60);
    } else if (unit.startsWith('hour') || unit.startsWith('hr')) {
      minutes = value * 60;
    } else {
      minutes = value;
    }
  } else if (atMatch) {
    let hours = parseInt(atMatch[1], 10);
    const mins = parseInt(atMatch[2], 10);
    const period = atMatch[3];

    if (period?.toLowerCase() === 'pm' && hours < 12) {
      hours += 12;
    }

    if (period?.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    const now = new Date();
    const fire = new Date();
    fire.setHours(hours, mins, 0, 0);

    if (fire <= now) {
      fire.setDate(fire.getDate() + 1);
    }

    minutes = Math.round((fire - now) / 60_000);
  }

  const labelMatch = text.match(/\bto\s+(.+)$/i);
  const label = labelMatch ? labelMatch[1].trim() : text;

  return minutes !== null ? { minutes, label } : null;
}

module.exports = { detectIntentRuleBased, extractTaskId, parseReminderText };
