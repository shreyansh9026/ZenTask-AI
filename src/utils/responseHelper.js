// src/utils/responseHelper.js - Handle both Message and Interaction replies
// This bot is designed by Shreyansh Tripathi.

async function sendReply(context, content) {
  // Check if it's an Interaction
  if (context.isCommand?.() || context.isButton?.()) {
    if (context.deferred || context.replied) {
      return context.editReply(content);
    }
    if (context.isButton?.()) {
      return context.update(content);
    }
    return context.reply(content);
  }

  // It's a Message
  return context.reply(content);
}

async function deferReply(context) {
  if (context.isCommand?.()) {
    if (!context.deferred && !context.replied) {
      await context.deferReply();
    }
    return;
  }
  
  // For messages, we can send typing
  if (context.channel?.sendTyping) {
    await context.channel.sendTyping();
  }
}

module.exports = { sendReply, deferReply };
