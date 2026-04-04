// Note commands
// This bot is designed by Shreyansh Tripathi.
const { EmbedBuilder } = require('discord.js');
const db = require('../../storage/jsonStore');
const { buildSimpleEmbed } = require('../../utils/formatter');

function buildNoteListEmbed(notes, username) {
  const embed = new EmbedBuilder()
    .setColor(notes.length ? 0x7289da : 0xfee75c)
    .setTitle(`Notes for ${username}`)
    .setTimestamp();

  if (!notes.length) {
    embed.setDescription('You have **no notes** yet.\nUse `!addnote <text>` to save one.');
    return embed;
  }

  const lines = notes.map((note) => `[#${note.id}] ${note.text}`);
  embed.setDescription(lines.join('\n'));
  embed.setFooter({ text: `${notes.length} note(s) saved` });
  return embed;
}

async function handleAddNote(message, noteText) {
  if (!noteText || noteText.trim().length < 2) {
    return message.reply('Please provide note content. Example: `!addnote Meeting at 5pm`');
  }

  try {
    const note = db.addNote(message.author.id, noteText.trim());
    const embed = buildSimpleEmbed(
      'success',
      'Note Saved',
      `**#${note.id}** - ${note.text}\n\nUse \`!notes\` to view all your notes.`
    );
    return message.reply({ embeds: [embed] });
  } catch (error) {
    return message.reply(error.message);
  }
}

async function handleViewNotes(message) {
  const notes = db.getNotesForUser(message.author.id);
  const embed = buildNoteListEmbed(notes, message.author.username);
  return message.reply({ embeds: [embed] });
}

async function handleDeleteNote(message, noteId) {
  if (!noteId || isNaN(noteId)) {
    return message.reply('Please provide a valid note ID. Example: `!deletenote 2`');
  }

  const removed = db.deleteNote(message.author.id, Number(noteId));
  if (!removed) {
    return message.reply(`No note with ID **#${noteId}** found. Use \`!notes\` to see your list.`);
  }

  const embed = buildSimpleEmbed('warn', 'Note Deleted', `Removed: ~~${removed.text}~~`);
  return message.reply({ embeds: [embed] });
}

async function handleClearNotes(message) {
  const notes = db.getNotesForUser(message.author.id);
  if (!notes.length) {
    return message.reply('You have no notes to clear.');
  }

  db.clearNotes(message.author.id);
  const embed = buildSimpleEmbed('warn', 'All Notes Cleared', `Removed **${notes.length}** note(s).`);
  return message.reply({
    content: `Cleared ${notes.length} note(s).`,
    embeds: [embed],
  });
}

module.exports = { handleAddNote, handleViewNotes, handleDeleteNote, handleClearNotes };
