// Logger utilities
// This bot is designed by Shreyansh Tripathi.
const fs = require('fs');
const path = require('path');
const util = require('util');

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'bot-debug.log');
const brokenStreams = {
  stdout: false,
  stderr: false,
};

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function formatMessage(args) {
  return util.format(...args);
}

function formatError(error) {
  if (!error) {
    return 'Unknown error';
  }

  return error.stack || error.message || String(error);
}

function sanitizeForFile(message) {
  return String(message).replace(/\r?\n/g, '\\n');
}

function appendLogLine(message) {
  const line = `[${new Date().toISOString()}] ${sanitizeForFile(message)}\n`;

  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, line);
  } catch {
    // Logging must never crash the bot.
  }
}

function markStreamBroken(streamName, error) {
  if (brokenStreams[streamName]) {
    return;
  }

  brokenStreams[streamName] = true;
  appendLogLine(`Suppressed ${streamName} stream error: ${formatError(error)}`);
}

function writeToStream(streamName, message) {
  if (brokenStreams[streamName]) {
    return;
  }

  const stream = streamName === 'stderr' ? process.stderr : process.stdout;
  if (!stream?.write) {
    brokenStreams[streamName] = true;
    return;
  }

  try {
    stream.write(`${message}\n`);
  } catch (error) {
    markStreamBroken(streamName, error);
  }
}

function logTo(streamName, ...args) {
  const message = formatMessage(args);
  appendLogLine(message);
  writeToStream(streamName, message);
}

function isBrokenPipeError(error) {
  return Boolean(
    error &&
    (
      error.code === 'EPIPE' ||
      String(error.message || '').toLowerCase().includes('broken pipe')
    )
  );
}

function attachStreamGuard(stream, streamName) {
  if (!stream?.on) {
    return;
  }

  stream.on('error', (error) => {
    markStreamBroken(streamName, error);
  });
}

attachStreamGuard(process.stdout, 'stdout');
attachStreamGuard(process.stderr, 'stderr');

module.exports = {
  appendLogLine,
  formatError,
  isBrokenPipeError,
  logError: (...args) => logTo('stderr', ...args),
  logInfo: (...args) => logTo('stdout', ...args),
  logWarn: (...args) => logTo('stderr', ...args),
};
