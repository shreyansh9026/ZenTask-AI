// Date and time command
// This bot is designed by Shreyansh Tripathi.
const { buildSimpleEmbed } = require('../../utils/formatter');

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function handleDatetime(message) {
  const now = new Date();
  const day = DAYS[now.getDay()];
  const date = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  const timeStr = `${hours}:${minutes}:${seconds} ${period}`;
  const dateStr = `${day}, ${month} ${date}, ${year}`;

  const embed = buildSimpleEmbed(
    'info',
    'Date & Time',
    `**Time:** ${timeStr}\n**Date:** ${dateStr}`
  );

  return message.reply({ embeds: [embed] });
}

module.exports = { handleDatetime };
