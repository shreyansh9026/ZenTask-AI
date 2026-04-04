// src/index.js - Bot entry point
// This bot is designed by Shreyansh Tripathi.
require('dotenv').config();

const path = require('path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { handleMessage } = require('./handlers/messageHandler');
const { acquireRuntimeLock, releaseRuntimeLock } = require('./utils/runtimeLock');
const { appendLogLine, formatError, isBrokenPipeError, logError, logInfo } = require('./utils/logger');

function log(message) {
  logInfo(message);
}

const runtimeLock = acquireRuntimeLock();
if (!runtimeLock.acquired) {
  const startedAt = runtimeLock.createdAt ? ` (started ${runtimeLock.createdAt})` : '';
  log(`Another bot instance is already running with PID ${runtimeLock.pid}${startedAt}. Exiting this process.`);
  process.exit(1);
}

if (runtimeLock.recoveredStaleLock) {
  log('Recovered a stale runtime lock from a previous bot process.');
}

log(`Runtime lock acquired at ${path.relative(process.cwd(), runtimeLock.lockFile)} for PID ${process.pid}.`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.once('clientReady', () => {
  log(`Bot online as ${client.user.tag}`);
  log(`Serving ${client.guilds.cache.size} server(s):`);
  client.guilds.cache.forEach((guild) => log(`- ${guild.name} (${guild.id})`));
  log('');
  client.user.setActivity('your tasks | !help', { type: 3 });
});

client.on('messageCreate', (message) => {
  if (message.author.bot) {
    return;
  }

  appendLogLine(`Message received: "${message.content}" from ${message.author.tag}`);

  handleMessage(client, message).catch((error) => {
    logError(`Unhandled message handler failure: ${formatError(error)}`);
  });
});

client.on('warn', (warning) => log(`Discord warning: ${warning}`));
client.on('error', (error) => logError(`Discord client error: ${formatError(error)}`));
client.on('shardDisconnect', (event, shardId) => {
  log(`Shard ${shardId} disconnected with code ${event.code}.`);
});
client.on('shardError', (error, shardId) => {
  logError(`Shard ${shardId} error: ${formatError(error)}`);
});
client.on('shardReconnecting', (shardId) => {
  log(`Shard ${shardId} reconnecting.`);
});
client.on('shardResume', (_replayedEvents, shardId) => {
  log(`Shard ${shardId} resumed successfully.`);
});
client.rest.on('rateLimited', (info) => {
  log(`Discord rate limit hit on ${info.route || 'unknown route'}; retry after ${info.timeToReset}ms.`);
});

process.on('unhandledRejection', (error) => {
  logError(`Unhandled rejection: ${formatError(error)}`);
});
process.on('uncaughtException', (error) => {
  if (isBrokenPipeError(error)) {
    appendLogLine(`Suppressed broken pipe exception: ${formatError(error)}`);
    return;
  }

  logError(`Uncaught exception: ${formatError(error)}`);
  releaseRuntimeLock();
  process.exit(1);
});

function shutdown(signal) {
  log(`Received ${signal}. Releasing runtime lock and shutting down.`);
  releaseRuntimeLock();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGBREAK', () => shutdown('SIGBREAK'));

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  logError(`Failed to login: ${formatError(error)}`);
  releaseRuntimeLock();
  process.exit(1);
});
