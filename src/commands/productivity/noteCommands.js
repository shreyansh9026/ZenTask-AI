// Note commands
// This bot is designed by Shreyansh Tripathi.
const { EmbedBuilder } = require('discord.js');
const db = require('../../storage/mongooseStore');
const { buildSimpleEmbed, buildNoteActionRow } = require('../../utils/formatter');
const { sendReply } = require('../../utils/responseHelper');

function getUserData(context) {
  const user = context.author || context.user;
  return { id: user.id, username: user.username };
}

function buildNoteListEmbed(notes, username) {
  const embed = new EmbedBuilder()
    .setColor(notes.length ? 0x7289da : 0xfee75c)
    .setTitle(`Notes for ${username}`)
    .setTimestamp();

  if (!notes.length) {
    embed.setDescription('You have **no notes** yet.\nUse `/note add` or `!addnote <text>` to save one.');
    return embed;
  }

  const lines = notes.map((note) => `[#${note.id}] ${note.text}`);
  embed.setDescription(lines.join('\n'));
  embed.setFooter({ text: `${notes.length} note(s) saved` });
  return embed;
}

async function handleAddNote(context, noteText) {
  const { id } = getUserData(context);
  
  if (!noteText || noteText.trim().length < 2) {
    return sendReply(context, 'Please provide note content. Example: `/note add content: Meeting at 5pm`');
  }

  try {
    const note = await db.addNote(id, noteText.trim());
    const embed = buildSimpleEmbed(
      'success',
      'Note Saved',
      `**#${note.id}** - ${note.text}\n\nUse \`/note view\` to view all your notes.`
    );
    return sendReply(context, { embeds: [embed] });
  } catch (error) {
    return sendReply(context, error.message);
  }
}

async function handleViewNotes(context) {
  const { id, username } = getUserData(context);
  const notes = await db.getNotesForUser(id);
  const embed = buildNoteListEmbed(notes, username);
  const row = buildNoteActionRow();
  return sendReply(context, { embeds: [embed], components: [row] });
}

async function handleDeleteNote(context, noteId) {
  const { id } = getUserData(context);
  
  if (!noteId || isNaN(noteId)) {
    return sendReply(context, 'Please provide a valid note ID. Example: `/note delete id: 2`');
  }

  const removed = await db.deleteNote(id, Number(noteId));
  if (!removed) {
    return sendReply(context, `No note with ID **#${noteId}** found. Use \`/note view\` to see your list.`);
  }

  const embed = buildSimpleEmbed('warn', 'Note Deleted', `Removed: ~~${removed.text}~~`);
  return sendReply(context, { embeds: [embed] });
}

async function handleClearNotes(context) {
  const { id } = getUserData(context);
  const notes = await db.getNotesForUser(id);
  
  if (!notes.length) {
    return sendReply(context, 'You have no notes to clear.');
  }

  await db.clearNotes(id);
  const embed = buildSimpleEmbed('warn', 'All Notes Cleared', `Removed **${notes.length}** note(s).`);
  return sendReply(context, {
    content: `Cleared ${notes.length} note(s).`,
    embeds: [embed],
  });
}

module.exports = { handleAddNote, handleViewNotes, handleDeleteNote, handleClearNotes };
