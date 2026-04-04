// Runtime lock helpers
// This bot is designed by Shreyansh Tripathi.
const fs = require('fs');
const path = require('path');

const LOCK_DIR = path.join(__dirname, '../../data');
const LOCK_FILE = path.join(LOCK_DIR, 'bot.lock');

let cleanupRegistered = false;

function ensureLockDir() {
  if (!fs.existsSync(LOCK_DIR)) {
    fs.mkdirSync(LOCK_DIR, { recursive: true });
  }
}

function readLockFile() {
  try {
    const raw = fs.readFileSync(LOCK_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isProcessRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function releaseRuntimeLock() {
  try {
    if (!fs.existsSync(LOCK_FILE)) {
      return;
    }

    const current = readLockFile();
    if (!current || current.pid === process.pid) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch {
    // Best-effort cleanup only.
  }
}

function registerCleanupHooks() {
  if (cleanupRegistered) {
    return;
  }

  cleanupRegistered = true;
  process.on('exit', releaseRuntimeLock);
}

function acquireRuntimeLock() {
  ensureLockDir();
  registerCleanupHooks();

  const payload = JSON.stringify(
    {
      pid: process.pid,
      createdAt: new Date().toISOString(),
    },
    null,
    2
  );

  try {
    fs.writeFileSync(LOCK_FILE, payload, { flag: 'wx' });
    return { acquired: true, lockFile: LOCK_FILE };
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  const current = readLockFile();
  if (current?.pid && isProcessRunning(current.pid)) {
    return {
      acquired: false,
      lockFile: LOCK_FILE,
      pid: current.pid,
      createdAt: current.createdAt || null,
    };
  }

  try {
    fs.unlinkSync(LOCK_FILE);
  } catch {
    // Ignore stale lock cleanup issues and retry once below.
  }

  fs.writeFileSync(LOCK_FILE, payload, { flag: 'wx' });
  return { acquired: true, lockFile: LOCK_FILE, recoveredStaleLock: true };
}

module.exports = { acquireRuntimeLock, releaseRuntimeLock };
