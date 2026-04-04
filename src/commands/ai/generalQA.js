// General AI Q&A command
// This bot is designed by Shreyansh Tripathi.
const { askGroq, getGroqUserErrorMessage } = require('../../services/ai/groqService');
const { buildGroqEmbed, buildSimpleEmbed } = require('../../utils/formatter');

const conversationHistory = new Map();
const MAX_HISTORY = 10;

function getHistory(userId) {
  return conversationHistory.get(userId) || [];
}

function updateHistory(userId, role, content) {
  const history = getHistory(userId);
  history.push({ role, content });

  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }

  conversationHistory.set(userId, history);
}

async function handleGeneralQA(message, query) {
  await message.channel.sendTyping();

  const userId = message.author.id;
  const history = getHistory(userId);

  try {
    const answer = await askGroq(query, history);

    updateHistory(userId, 'user', query);
    updateHistory(userId, 'assistant', answer);

    const embed = buildGroqEmbed(query, answer);
    return message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Groq Q&A error:', error.response?.data || error.message);

    const embed = buildSimpleEmbed(
      'error',
      'AI Unavailable',
      getGroqUserErrorMessage(error, 'AI replies')
    );

    return message.reply({ embeds: [embed] });
  }
}

module.exports = { handleGeneralQA };
