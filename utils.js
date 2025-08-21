import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

/**
 * Sends a media file to a Telegram chat. It automatically determines the type of media (photo, video, or document) based on the file extension.
 * @param {object} conn - The Telegram bot instance.
 * @param {number|string} chatId - The ID of the chat to send the media to.
 * @param {string} filePath - The local path to the file.
 * @param {string} [caption=''] - The caption for the media.
 * @returns {Promise<object>} The sent message object.
 */
export async function sendMedia(conn, chatId, filePath, caption = '') {
  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const opts = { caption };

    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return conn.sendPhoto(chatId, buffer, opts);
    } else if (['.mp4', '.mov', '.mkv', '.webm'].includes(ext)) {
      return conn.sendVideo(chatId, buffer, opts);
    } else {
      return conn.sendDocument(chatId, buffer, opts);
    }
  } catch (err) {
    console.error(chalk.red.bold('❌ sendMedia error:'), chalk.gray(err));
    // Also inform the user in the chat
    return conn.sendMessage(chatId, '❌ Gagal mengirim file media.');
  }
}

/**
 * Manages a "loading" message in a chat, showing an indicator while a process is running and updating it to "done" when finished.
 * @param {object} m - The message object that triggered the action.
 * @param {object} conn - The Telegram bot instance.
 * @param {boolean} [done=false] - Set to true to change the message to "Selesai" and clear the state.
 */
export async function loading(m, conn, done = false) {
  const chatId = m.chat?.id || m.chat;
  if (!chatId) {
    console.error(chalk.red.bold('❌ loading() error:'), 'chatId is missing.');
    return;
  }

  const key = `loading_${chatId}_${m.message_id || m.id}`;
  global._loadingMsgs = global._loadingMsgs || {};

  try {
    if (!done) {
      const res = await conn.sendMessage(chatId, '⏳ Loading...', { reply_to_message_id: m.message_id || m.id });
      global._loadingMsgs[key] = res.message_id;
    } else {
      const messageId = global._loadingMsgs[key];
      if (messageId) {
        await conn.editMessageText('✅ Selesai diproses.', { chat_id: chatId, message_id: messageId });
        delete global._loadingMsgs[key];
      }
    }
  } catch (err) {
    // Avoid crashing on minor UI errors, like trying to edit a deleted message
    console.error(chalk.red.bold('❌ loading() error:'), chalk.gray(err.message));
  }
}
