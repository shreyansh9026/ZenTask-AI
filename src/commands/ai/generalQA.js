// General AI Q&A command
// This bot is designed by Shreyansh Tripathi.
const { askGroq, analyzeImage, getGroqUserErrorMessage } = require('../../services/ai/groqService');
const { buildGroqEmbed, buildSimpleEmbed } = require('../../utils/formatter');
const { sendReply, deferReply } = require('../../utils/responseHelper');
const db = require('../../storage/mongooseStore');

async function handleGeneralQA(context, query, imageUrl = null) {
  // If no imageUrl provided analytically, check if context is a regular message with attachments
  if (!imageUrl && context.attachments?.size > 0) {
    const firstAttach = context.attachments.first();
    if (firstAttach.contentType?.startsWith('image/')) {
      imageUrl = firstAttach.url;
    }
  }

  await deferReply(context);

  const userId = context.author?.id || context.user?.id;
  const history = await db.getChatHistory(userId);

  try {
    let answer;
    
    if (imageUrl) {
      // Use Vision model if image is present
      answer = await analyzeImage(imageUrl, query);
    } else {
      // Regular text model
      answer = await askGroq(query, history);
    }

    // Update and save history
    history.push({ role: 'user', content: query });
    history.push({ role: 'assistant', content: answer });
    await db.saveChatHistory(userId, history);

    const embed = buildGroqEmbed(query, answer);
    
    if (imageUrl) {
      embed.setImage(imageUrl);
      embed.setFooter({ text: 'Analyzed using Llama 3.2 Vision' });
    }

    return sendReply(context, { embeds: [embed] });
  } catch (error) {
    console.error('Groq Q&A error:', error.response?.data || error.message);

    const embed = buildSimpleEmbed(
      'error',
      'AI Unavailable',
      getGroqUserErrorMessage(error, imageUrl ? 'Image Analysis' : 'AI replies')
    );

    return sendReply(context, { embeds: [embed] });
  }
}

module.exports = { handleGeneralQA };
